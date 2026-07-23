<?php

namespace App\Controller;

use App\Entity\Picture;
use App\Repository\PictureRepository;
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

#[Route('/api/picture', name: 'app_api_picture_')]
class PictureController extends AbstractController
{
    private PictureRepository $repository;
    private RestaurantRepository $restaurantRepository;
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;

    public function __construct(
        PictureRepository $repository,
        RestaurantRepository $restaurantRepository,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer
    ) {
        $this->repository = $repository;
        $this->restaurantRepository = $restaurantRepository;
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
    }

    /**
     * @OA\Get(
     *     path="/api/picture", summary="Lister les images",
     *     description="Retourne les métadonnées d’images.", tags={"Pictures"}, security={},
     *     @OA\Response(response=200, description="Liste des images")
     * )
     */
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $pictures = $this->repository->findBy([], ['createdAt' => 'DESC']);
        $data = [];

        foreach ($pictures as $picture) {
            $data[] = $this->formatPicture($picture);
        }

        return $this->json(['count' => count($data), 'pictures' => $data]);
    }

    /**
     * @OA\Post(
     *     path="/api/picture", summary="Créer une image",
     *     description="Opération réservée à ROLE_ADMIN.", tags={"Pictures"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"title","slug","restaurantId"},
     *         @OA\Property(property="title", type="string", example="Salle du restaurant"),
     *         @OA\Property(property="slug", type="string", example="/images/gallery/salle.jpg"),
     *         @OA\Property(property="restaurantId", type="integer", example=1)
     *     )),
     *     @OA\Response(response=201, description="Image créée"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=409, description="Slug déjà utilisé"),
     *     @OA\Response(response=422, description="Données ou restaurant invalides")
     * )
     */
    #[Route('', name: 'new', methods: ['POST'])]
    public function new(Request $request): JsonResponse
    {
        try {
            $data = $request->toArray();
        } catch (JsonException $exception) {
            return $this->json(['error' => 'Corps JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        $errors = $this->validatePictureData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $restaurant = $this->restaurantRepository->find($data['restaurantId']);

        if ($restaurant === null) {
            return $this->invalidDataResponse([
                'restaurantId' => 'Le restaurant sélectionné est introuvable',
            ]);
        }

        $title = trim($data['title']);
        $slug = trim($data['slug']);

        if ($this->repository->findOneBy(['slug' => $slug]) !== null) {
            return $this->json([
                'error' => 'Une image portant ce slug existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $picture = new Picture();
        $picture
            ->setTitle($title)
            ->setSlug($slug)
            ->setRestaurant($restaurant)
            ->setCreatedAt(new DateTimeImmutable());

        $this->entityManager->persist($picture);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Image créée',
            'picture' => $this->formatPicture($picture),
        ], Response::HTTP_CREATED);
    }

    /**
     * @OA\Get(
     *     path="/api/picture/{id}", summary="Consulter une image",
     *     description="Retourne les métadonnées d’une image.", tags={"Pictures"}, security={},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Image trouvée"),
     *     @OA\Response(response=404, description="Image introuvable")
     * )
     */
    #[Route('/{id}', name: 'show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $picture = $this->repository->find($id);

        if ($picture === null) {
            return $this->pictureNotFoundResponse($id);
        }

        return $this->json($this->formatPicture($picture));
    }

    /**
     * @OA\Put(
     *     path="/api/picture/{id}", summary="Modifier une image",
     *     description="Opération réservée à ROLE_ADMIN.", tags={"Pictures"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"title","slug","restaurantId"},
     *         @OA\Property(property="title", type="string", example="Salle du restaurant"),
     *         @OA\Property(property="slug", type="string", example="/images/gallery/salle.jpg"),
     *         @OA\Property(property="restaurantId", type="integer", example=1)
     *     )),
     *     @OA\Response(response=200, description="Image modifiée"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=404, description="Image introuvable"),
     *     @OA\Response(response=409, description="Slug déjà utilisé"),
     *     @OA\Response(response=422, description="Données invalides")
     * )
     */
    #[Route('/{id}', name: 'edit', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function edit(int $id, Request $request): JsonResponse
    {
        $picture = $this->repository->find($id);

        if ($picture === null) {
            return $this->pictureNotFoundResponse($id);
        }

        try {
            $data = $request->toArray();
        } catch (JsonException $exception) {
            return $this->json(['error' => 'Corps JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        $errors = $this->validatePictureData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $restaurant = $this->restaurantRepository->find($data['restaurantId']);

        if ($restaurant === null) {
            return $this->invalidDataResponse([
                'restaurantId' => 'Le restaurant sélectionné est introuvable',
            ]);
        }

        $title = trim($data['title']);
        $slug = trim($data['slug']);
        $existingPicture = $this->repository->findOneBy(['slug' => $slug]);

        if ($existingPicture !== null && $existingPicture->getId() !== $picture->getId()) {
            return $this->json([
                'error' => 'Une image portant ce slug existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $picture
            ->setTitle($title)
            ->setSlug($slug)
            ->setRestaurant($restaurant)
            ->setUpdatedAt(new DateTimeImmutable());

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Image modifiée',
            'picture' => $this->formatPicture($picture),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/picture/{id}", summary="Supprimer une image",
     *     description="Opération réservée à ROLE_ADMIN.", tags={"Pictures"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Image supprimée"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=404, description="Image introuvable")
     * )
     */
    #[Route('/{id}', name: 'delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): Response
    {
        $picture = $this->repository->find($id);

        if ($picture === null) {
            return $this->pictureNotFoundResponse($id);
        }

        $this->entityManager->remove($picture);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function validatePictureData(array $data): array
    {
        $errors = [];

        if (!isset($data['title']) || !is_string($data['title']) || trim($data['title']) === '') {
            $errors['title'] = 'Le titre doit être une chaîne non vide';
        } elseif (mb_strlen(trim($data['title'])) > 128) {
            $errors['title'] = 'Le titre ne doit pas dépasser 128 caractères';
        }

        if (!isset($data['slug']) || !is_string($data['slug']) || trim($data['slug']) === '') {
            $errors['slug'] = 'Le slug doit être une chaîne non vide';
        } elseif (mb_strlen(trim($data['slug'])) > 128) {
            $errors['slug'] = 'Le slug ne doit pas dépasser 128 caractères';
        } elseif (preg_match('/^[a-z0-9._\/-]+$/', trim($data['slug'])) !== 1) {
            $errors['slug'] = 'Le slug contient des caractères non autorisés';
        }

        if (!isset($data['restaurantId'])
            || !is_int($data['restaurantId'])
            || $data['restaurantId'] < 1) {
            $errors['restaurantId'] = 'L’identifiant du restaurant doit être un entier strictement positif';
        }

        return $errors;
    }

    private function invalidDataResponse(array $errors): JsonResponse
    {
        return $this->json([
            'error' => 'Données invalides',
            'fields' => $errors,
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    private function pictureNotFoundResponse(int $id): JsonResponse
    {
        return $this->json([
            'error' => 'Image introuvable',
            'id' => $id,
        ], Response::HTTP_NOT_FOUND);
    }

    private function formatPicture(Picture $picture): array
    {
        $data = $this->serializer->normalize(
            $picture,
            null,
            ['groups' => ['picture:read']]
        );

        return is_array($data) ? $data : [];
    }
}
