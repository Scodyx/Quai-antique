<?php

namespace App\Controller;

use App\Entity\Menu;
use App\Repository\CategoryRepository;
use App\Repository\MenuRepository;
use App\Repository\RestaurantRepository;
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

#[Route('/api/menu', name: 'app_api_menu_')]
class MenuController extends AbstractController
{
    private MenuRepository $repository;
    private RestaurantRepository $restaurantRepository;
    private CategoryRepository $categoryRepository;
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;

    public function __construct(
        MenuRepository $repository,
        RestaurantRepository $restaurantRepository,
        CategoryRepository $categoryRepository,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer
    ) {
        $this->repository = $repository;
        $this->restaurantRepository = $restaurantRepository;
        $this->categoryRepository = $categoryRepository;
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
    }

    /**
     * @OA\Get(
     *     path="/api/menu", summary="Lister les menus",
     *     description="Retourne les menus, leur restaurant et leurs catégories.", tags={"Menus"}, security={},
     *     @OA\Response(response=200, description="Liste des menus")
     * )
     */
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $menus = $this->repository->findBy([], ['title' => 'ASC']);
        $data = [];

        foreach ($menus as $menu) {
            $data[] = $this->formatMenu($menu);
        }

        return $this->json([
            'count' => count($data),
            'menus' => $data,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/menu", summary="Créer un menu",
     *     description="Opération réservée à ROLE_ADMIN. Le prix est en centimes.", tags={"Menus"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"title","description","price","restaurantId","categoryIds"},
     *         @OA\Property(property="title", type="string", example="Menu du marché"),
     *         @OA\Property(property="description", type="string", example="Entrée, plat et dessert"),
     *         @OA\Property(property="price", type="integer", description="Prix en centimes", example=3900),
     *         @OA\Property(property="restaurantId", type="integer", example=1),
     *         @OA\Property(property="categoryIds", type="array", @OA\Items(type="integer"), example={1,2,3})
     *     )),
     *     @OA\Response(response=201, description="Menu créé"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=409, description="Titre déjà utilisé"),
     *     @OA\Response(response=422, description="Données ou relations invalides")
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

        $errors = $this->validateMenuData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $title = trim($data['title']);
        $description = trim($data['description']);

        if ($this->repository->findOneBy(['title' => $title]) !== null) {
            return $this->json([
                'error' => 'Un menu portant ce titre existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $relations = $this->resolveRelations($data['restaurantId'], $data['categoryIds']);

        if ($relations['errors'] !== []) {
            return $this->invalidDataResponse($relations['errors']);
        }

        $menu = new Menu();
        $menu
            ->setUuid(Uuid::v4()->toRfc4122())
            ->setTitle($title)
            ->setDescription($description)
            ->setPrice($data['price'])
            ->setRestaurant($relations['restaurant'])
            ->setCreatedAt(new DateTimeImmutable());

        foreach ($relations['categories'] as $category) {
            $menu->addCategory($category);
        }

        $this->entityManager->persist($menu);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Menu créé',
            'menu' => $this->formatMenu($menu),
        ], Response::HTTP_CREATED);
    }

    /**
     * @OA\Get(
     *     path="/api/menu/{id}", summary="Consulter un menu",
     *     description="Retourne un menu précis.", tags={"Menus"}, security={},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Menu trouvé"),
     *     @OA\Response(response=404, description="Menu introuvable")
     * )
     */
    #[Route('/{id}', name: 'show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $menu = $this->repository->find($id);

        if ($menu === null) {
            return $this->menuNotFoundResponse($id);
        }

        return $this->json($this->formatMenu($menu));
    }

    /**
     * @OA\Put(
     *     path="/api/menu/{id}", summary="Modifier un menu",
     *     description="Opération réservée à ROLE_ADMIN.", tags={"Menus"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"title","description","price","restaurantId","categoryIds"},
     *         @OA\Property(property="title", type="string", example="Menu du marché"),
     *         @OA\Property(property="description", type="string", example="Entrée, plat et dessert"),
     *         @OA\Property(property="price", type="integer", description="Prix en centimes", example=3900),
     *         @OA\Property(property="restaurantId", type="integer", example=1),
     *         @OA\Property(property="categoryIds", type="array", @OA\Items(type="integer"), example={1,2,3})
     *     )),
     *     @OA\Response(response=200, description="Menu modifié"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=404, description="Menu introuvable"),
     *     @OA\Response(response=409, description="Titre déjà utilisé"),
     *     @OA\Response(response=422, description="Données invalides")
     * )
     */
    #[Route('/{id}', name: 'edit', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function edit(int $id, Request $request): JsonResponse
    {
        $menu = $this->repository->find($id);

        if ($menu === null) {
            return $this->menuNotFoundResponse($id);
        }

        try {
            $data = $request->toArray();
        } catch (JsonException $exception) {
            return $this->json([
                'error' => 'Corps JSON invalide',
            ], Response::HTTP_BAD_REQUEST);
        }

        $errors = $this->validateMenuData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $title = trim($data['title']);
        $description = trim($data['description']);
        $existingMenu = $this->repository->findOneBy(['title' => $title]);

        if ($existingMenu !== null && $existingMenu->getId() !== $menu->getId()) {
            return $this->json([
                'error' => 'Un menu portant ce titre existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $relations = $this->resolveRelations($data['restaurantId'], $data['categoryIds']);

        if ($relations['errors'] !== []) {
            return $this->invalidDataResponse($relations['errors']);
        }

        $menu
            ->setTitle($title)
            ->setDescription($description)
            ->setPrice($data['price'])
            ->setRestaurant($relations['restaurant'])
            ->setUpdatedAt(new DateTimeImmutable());

        foreach ($menu->getCategories()->toArray() as $category) {
            $menu->removeCategory($category);
        }

        foreach ($relations['categories'] as $category) {
            $menu->addCategory($category);
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Menu modifié',
            'menu' => $this->formatMenu($menu),
        ], Response::HTTP_OK);
    }

    /**
     * @OA\Delete(
     *     path="/api/menu/{id}", summary="Supprimer un menu",
     *     description="Opération réservée à ROLE_ADMIN.", tags={"Menus"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Menu supprimé"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=404, description="Menu introuvable")
     * )
     */
    #[Route('/{id}', name: 'delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): Response
    {
        $menu = $this->repository->find($id);

        if ($menu === null) {
            return $this->menuNotFoundResponse($id);
        }

        $this->entityManager->remove($menu);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function validateMenuData(array $data): array
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

        if (!isset($data['restaurantId'])
            || !is_int($data['restaurantId'])
            || $data['restaurantId'] < 1) {
            $errors['restaurantId'] = 'L’identifiant du restaurant doit être un entier strictement positif';
        }

        if (!isset($data['categoryIds'])
            || !is_array($data['categoryIds'])
            || $data['categoryIds'] === []) {
            $errors['categoryIds'] = 'Au moins une catégorie doit être sélectionnée';
        } else {
            foreach ($data['categoryIds'] as $categoryId) {
                if (!is_int($categoryId) || $categoryId < 1) {
                    $errors['categoryIds'] = 'Chaque identifiant de catégorie doit être un entier strictement positif';
                    break;
                }
            }
        }

        return $errors;
    }

    private function resolveRelations(int $restaurantId, array $categoryIds): array
    {
        $errors = [];
        $restaurant = $this->restaurantRepository->find($restaurantId);
        $categoryIds = array_values(array_unique($categoryIds));
        $categories = $this->categoryRepository->findBy(['id' => $categoryIds]);
        $foundIds = [];

        if ($restaurant === null) {
            $errors['restaurantId'] = 'Le restaurant sélectionné est introuvable';
        }

        foreach ($categories as $category) {
            $foundIds[] = $category->getId();
        }

        $missingIds = array_values(array_diff($categoryIds, $foundIds));

        if ($missingIds !== []) {
            $errors['categoryIds'] = sprintf(
                'Certaines catégories sont introuvables : %s',
                implode(', ', $missingIds)
            );
        }

        return [
            'restaurant' => $restaurant,
            'categories' => $categories,
            'errors' => $errors,
        ];
    }

    private function invalidDataResponse(array $errors): JsonResponse
    {
        return $this->json([
            'error' => 'Données invalides',
            'fields' => $errors,
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    private function menuNotFoundResponse(int $id): JsonResponse
    {
        return $this->json([
            'error' => 'Menu introuvable',
            'id' => $id,
        ], Response::HTTP_NOT_FOUND);
    }

    private function formatMenu(Menu $menu): array
    {
        $data = $this->serializer->normalize(
            $menu,
            null,
            ['groups' => ['menu:read']]
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
