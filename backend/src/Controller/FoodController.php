<?php

namespace App\Controller;

use App\Entity\Food;
use App\Repository\CategoryRepository;
use App\Repository\FoodRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Exception\JsonException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Uid\Uuid;

#[Route('/api/food', name: 'app_api_food_')]
class FoodController extends AbstractController
{
    private FoodRepository $repository;

    private EntityManagerInterface $entityManager;

    private SerializerInterface $serializer;

    private CategoryRepository $categoryRepository;

    public function __construct(
        FoodRepository $repository,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        CategoryRepository $categoryRepository
    ) {
        $this->repository = $repository;
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->categoryRepository = $categoryRepository;
    }

    /**
     * @OA\Get(
     *     path="/api/food", summary="Lister les plats",
     *     description="Retourne les plats et leurs catégories.", tags={"Foods"}, security={},
     *     @OA\Response(response=200, description="Liste des plats")
     * )
     */
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $foods = $this->repository->findBy([], ['title' => 'ASC']);
        $data = [];

        foreach ($foods as $food) {
            $data[] = $this->formatFood($food);
        }

        return $this->json([
            'count' => count($data),
            'foods' => $data,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/food", summary="Créer un plat",
     *     description="Opération réservée à ROLE_ADMIN. Le prix est en centimes.", tags={"Foods"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"title","description","price","categoryIds"},
     *         @OA\Property(property="title", type="string", maxLength=64, example="Salade savoyarde"),
     *         @OA\Property(property="description", type="string", example="Produits frais de Savoie"),
     *         @OA\Property(property="price", type="integer", description="Prix en centimes", example=1550),
     *         @OA\Property(property="categoryIds", type="array", @OA\Items(type="integer"), example={1})
     *     )),
     *     @OA\Response(response=201, description="Plat créé"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=409, description="Titre déjà utilisé"),
     *     @OA\Response(response=422, description="Données ou catégories invalides")
     * )
     */
    #[Route('', name: 'new', methods: ['POST'])]
    public function new(Request $request): JsonResponse
    {
        try {
            $data = $request->toArray();
        } catch (JsonException $exception) {
            return $this->json([
                'error' => 'Corps JSON invalide',
            ], Response::HTTP_BAD_REQUEST);
        }

        $errors = $this->validateFoodData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $categoryIds = array_values(array_unique($data['categoryIds'] ?? []));
        $categoryResolution = $this->resolveCategories($categoryIds);

        if ($categoryResolution['missing'] !== []) {
            return $this->missingCategoriesResponse($categoryResolution['missing']);
        }

        $title = trim($data['title']);
        $description = trim($data['description']);

        if ($this->repository->findOneBy(['title' => $title]) !== null) {
            return $this->json([
                'error' => 'Un plat portant ce titre existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $food = new Food();
        $food
            ->setUuid(Uuid::v4()->toRfc4122())
            ->setTitle($title)
            ->setDescription($description)
            ->setPrice($data['price'])
            ->setCreatedAt(new DateTimeImmutable());

        foreach ($categoryResolution['categories'] as $category) {
            $food->addCategory($category);
        }

        $this->entityManager->persist($food);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Plat créé',
            'food' => $this->formatFood($food),
        ], Response::HTTP_CREATED);
    }

    /**
     * @OA\Get(
     *     path="/api/food/{id}", summary="Consulter un plat",
     *     description="Retourne un plat précis.", tags={"Foods"}, security={},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Plat trouvé"),
     *     @OA\Response(response=404, description="Plat introuvable")
     * )
     */
    #[Route('/{id}', name: 'show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $food = $this->repository->find($id);

        if ($food === null) {
            return $this->json([
                'error' => 'Plat introuvable',
                'id' => $id,
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->formatFood($food));
    }

    /**
     * @OA\Put(
     *     path="/api/food/{id}", summary="Modifier un plat",
     *     description="Opération réservée à ROLE_ADMIN.", tags={"Foods"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"title","description","price"},
     *         @OA\Property(property="title", type="string", maxLength=64, example="Salade savoyarde"),
     *         @OA\Property(property="description", type="string", example="Produits frais de Savoie"),
     *         @OA\Property(property="price", type="integer", description="Prix en centimes", example=1550),
     *         @OA\Property(property="categoryIds", type="array", @OA\Items(type="integer"), example={1})
     *     )),
     *     @OA\Response(response=200, description="Plat modifié"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=404, description="Plat introuvable"),
     *     @OA\Response(response=409, description="Titre déjà utilisé"),
     *     @OA\Response(response=422, description="Données invalides")
     * )
     */
    #[Route('/{id}', name: 'edit', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function edit(int $id, Request $request): JsonResponse
    {
        $food = $this->repository->find($id);

        if ($food === null) {
            return $this->json([
                'error' => 'Plat introuvable',
                'id' => $id,
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = $request->toArray();
        } catch (JsonException $exception) {
            return $this->json([
                'error' => 'Corps JSON invalide',
            ], Response::HTTP_BAD_REQUEST);
        }

        $errors = $this->validateFoodData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $categoryResolution = null;

        if (array_key_exists('categoryIds', $data)) {
            $categoryIds = array_values(array_unique($data['categoryIds']));
            $categoryResolution = $this->resolveCategories($categoryIds);

            if ($categoryResolution['missing'] !== []) {
                return $this->missingCategoriesResponse($categoryResolution['missing']);
            }
        }

        $title = trim($data['title']);
        $description = trim($data['description']);
        $existingFood = $this->repository->findOneBy(['title' => $title]);

        if ($existingFood !== null && $existingFood->getId() !== $food->getId()) {
            return $this->json([
                'error' => 'Un plat portant ce titre existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $food
            ->setTitle($title)
            ->setDescription($description)
            ->setPrice($data['price'])
            ->setUpdatedAt(new DateTimeImmutable());

        if ($categoryResolution !== null) {
            foreach ($food->getCategories()->toArray() as $category) {
                $food->removeCategory($category);
            }

            foreach ($categoryResolution['categories'] as $category) {
                $food->addCategory($category);
            }
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Plat modifié',
            'food' => $this->formatFood($food),
        ], Response::HTTP_OK);
    }

    /**
     * @OA\Delete(
     *     path="/api/food/{id}", summary="Supprimer un plat",
     *     description="Opération réservée à ROLE_ADMIN.", tags={"Foods"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Plat supprimé"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=404, description="Plat introuvable")
     * )
     */
    #[Route('/{id}', name: 'delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): Response
    {
        $food = $this->repository->find($id);

        if ($food === null) {
            return $this->json([
                'error' => 'Plat introuvable',
                'id' => $id,
            ], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($food);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function validateFoodData(array $data): array
    {
        $errors = [];

        if (!isset($data['title']) || !is_string($data['title']) || trim($data['title']) === '') {
            $errors['title'] = 'Le titre doit être une chaîne non vide';
        } elseif (mb_strlen(trim($data['title'])) > 64) {
            $errors['title'] = 'Le titre ne doit pas dépasser 64 caractères';
        }

        if (!isset($data['description'])
            || !is_string($data['description'])
            || trim($data['description']) === '') {
            $errors['description'] = 'La description doit être une chaîne non vide';
        }

        if (!isset($data['price'])
            || !is_int($data['price'])
            || $data['price'] < 1
            || $data['price'] > 32767) {
            $errors['price'] = 'Le prix doit être un entier compris entre 1 et 32767';
        }

        if (array_key_exists('categoryIds', $data)) {
            if (!is_array($data['categoryIds'])) {
                $errors['categoryIds'] = 'Les catégories doivent être fournies sous forme de tableau';
            } else {
                foreach ($data['categoryIds'] as $categoryId) {
                    if (!is_int($categoryId) || $categoryId < 1) {
                        $errors['categoryIds'] = 'Chaque identifiant de catégorie doit être un entier strictement positif';
                        break;
                    }
                }
            }
        }

        return $errors;
    }

    private function resolveCategories(array $categoryIds): array
    {
        if ($categoryIds === []) {
            return ['categories' => [], 'missing' => []];
        }

        $categories = $this->categoryRepository->findBy(['id' => $categoryIds]);
        $foundIds = [];

        foreach ($categories as $category) {
            $foundIds[] = $category->getId();
        }

        return [
            'categories' => $categories,
            'missing' => array_values(array_diff($categoryIds, $foundIds)),
        ];
    }

    private function missingCategoriesResponse(array $missingIds): JsonResponse
    {
        return $this->invalidDataResponse([
            'categoryIds' => sprintf(
                'Certaines catégories sont introuvables : %s',
                implode(', ', $missingIds)
            ),
        ]);
    }

    private function invalidDataResponse(array $errors): JsonResponse
    {
        return $this->json([
            'error' => 'Données invalides',
            'fields' => $errors,
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    private function formatFood(Food $food): array
    {
        $data = $this->serializer->normalize(
            $food,
            null,
            ['groups' => ['food:read']]
        );

        if (!is_array($data)) {
            return [];
        }

        if (isset($data['categories']) && is_array($data['categories'])) {
            $data['categories'] = array_values($data['categories']);
        }

        return $data;
    }
}
