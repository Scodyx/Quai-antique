<?php

namespace App\Controller;

use App\Entity\Category;
use App\Repository\CategoryRepository;
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

#[Route('/api/category', name: 'app_api_category_')]
class CategoryController extends AbstractController
{
    private CategoryRepository $repository;

    private EntityManagerInterface $entityManager;

    private SerializerInterface $serializer;

    public function __construct(
        CategoryRepository $repository,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer
    ) {
        $this->repository = $repository;
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
    }

    /**
     * @OA\Get(
     *     path="/api/category", summary="Lister les catégories",
     *     description="Retourne les catégories par titre croissant.", tags={"Categories"}, security={},
     *     @OA\Response(response=200, description="Liste des catégories")
     * )
     */
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $categories = $this->repository->findBy([], ['title' => 'ASC']);
        $data = [];

        foreach ($categories as $category) {
            $data[] = $this->formatCategory($category);
        }

        return $this->json([
            'count' => count($data),
            'categories' => $data,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/category", summary="Créer une catégorie",
     *     description="Opération réservée à ROLE_ADMIN.", tags={"Categories"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"title"},
     *         @OA\Property(property="title", type="string", maxLength=64, example="Entrées")
     *     )),
     *     @OA\Response(response=201, description="Catégorie créée"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=409, description="Titre déjà utilisé"),
     *     @OA\Response(response=422, description="Données invalides")
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

        $errors = $this->validateCategoryData($data);

        if ($errors !== []) {
            return $this->json([
                'error' => 'Données invalides',
                'fields' => $errors,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $title = trim($data['title']);

        if ($this->repository->findOneBy(['title' => $title]) !== null) {
            return $this->json([
                'error' => 'Une catégorie portant ce titre existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $category = new Category();
        $category
            ->setUuid(Uuid::v4()->toRfc4122())
            ->setTitle($title)
            ->setCreatedAt(new DateTimeImmutable());

        $this->entityManager->persist($category);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Catégorie créée',
            'category' => $this->formatCategory($category),
        ], Response::HTTP_CREATED);
    }

    /**
     * @OA\Get(
     *     path="/api/category/{id}", summary="Consulter une catégorie",
     *     description="Retourne une catégorie précise.", tags={"Categories"}, security={},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Catégorie trouvée"),
     *     @OA\Response(response=404, description="Catégorie introuvable")
     * )
     */
    #[Route('/{id}', name: 'show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $category = $this->repository->find($id);

        if ($category === null) {
            return $this->json([
                'error' => 'Catégorie introuvable',
                'id' => $id,
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->formatCategory($category));
    }

    /**
     * @OA\Put(
     *     path="/api/category/{id}", summary="Modifier une catégorie",
     *     description="Opération réservée à ROLE_ADMIN.", tags={"Categories"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"title"},
     *         @OA\Property(property="title", type="string", maxLength=64, example="Entrées")
     *     )),
     *     @OA\Response(response=200, description="Catégorie modifiée"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=404, description="Catégorie introuvable"),
     *     @OA\Response(response=409, description="Titre déjà utilisé"),
     *     @OA\Response(response=422, description="Données invalides")
     * )
     */
    #[Route('/{id}', name: 'edit', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function edit(int $id, Request $request): JsonResponse
    {
        $category = $this->repository->find($id);

        if ($category === null) {
            return $this->json([
                'error' => 'Catégorie introuvable',
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

        $errors = $this->validateCategoryData($data);

        if ($errors !== []) {
            return $this->json([
                'error' => 'Données invalides',
                'fields' => $errors,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $title = trim($data['title']);
        $categoryWithSameTitle = $this->repository->findOneBy(['title' => $title]);

        if ($categoryWithSameTitle !== null
            && $categoryWithSameTitle->getId() !== $category->getId()) {
            return $this->json([
                'error' => 'Une catégorie portant ce titre existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $category
            ->setTitle($title)
            ->setUpdatedAt(new DateTimeImmutable());

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Catégorie modifiée',
            'category' => $this->formatCategory($category),
        ], Response::HTTP_OK);
    }

    /**
     * @OA\Delete(
     *     path="/api/category/{id}", summary="Supprimer une catégorie",
     *     description="Opération réservée à ROLE_ADMIN.", tags={"Categories"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Catégorie supprimée"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=404, description="Catégorie introuvable")
     * )
     */
    #[Route('/{id}', name: 'delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): Response
    {
        $category = $this->repository->find($id);

        if ($category === null) {
            return $this->json([
                'error' => 'Catégorie introuvable',
                'id' => $id,
            ], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($category);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function validateCategoryData(array $data): array
    {
        $errors = [];

        if (!isset($data['title']) || !is_string($data['title']) || trim($data['title']) === '') {
            $errors['title'] = 'Le titre doit être une chaîne non vide';
        } elseif (mb_strlen(trim($data['title'])) > 64) {
            $errors['title'] = 'Le titre ne doit pas dépasser 64 caractères';
        }

        return $errors;
    }

    private function formatCategory(Category $category): array
    {
        $data = $this->serializer->normalize(
            $category,
            null,
            ['groups' => ['category:read']]
        );

        if (!is_array($data)) {
            return [];
        }

        return $data;
    }
}
