<?php

namespace App\Controller;

use App\Entity\Restaurant;
use App\Repository\RestaurantRepository;
use App\Service\BookingAvailabilityService;
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

#[Route('/api/restaurant', name: 'app_api_restaurant_')]
class RestaurantController extends AbstractController
{
    private RestaurantRepository $repository;
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;
    private BookingAvailabilityService $availabilityService;

    public function __construct(
        RestaurantRepository $repository,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        BookingAvailabilityService $availabilityService
    ) {
        $this->repository = $repository;
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->availabilityService = $availabilityService;
    }

    /**
     * @OA\Get(
     *     path="/api/restaurant",
     *     summary="Lister les restaurants",
     *     description="Retourne les restaurants par nom croissant.",
     *     tags={"Restaurant"},
     *     security={},
     *     @OA\Response(response=200, description="Liste des restaurants")
     * )
     */
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $restaurants = $this->repository->findBy([], ['name' => 'ASC']);
        $data = [];

        foreach ($restaurants as $restaurant) {
            $data[] = $this->formatRestaurant($restaurant);
        }

        return $this->json(['count' => count($data), 'restaurants' => $data]);
    }

    /**
     * @OA\Post(
     *     path="/api/restaurant",
     *     summary="Créer un restaurant",
     *     description="Opération réservée à ROLE_ADMIN.",
     *     tags={"Restaurant"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"name","description","amOpeningTime","pmOpeningTime","maxGuest"},
     *         @OA\Property(property="name", type="string", maxLength=32, example="Quai Antique"),
     *         @OA\Property(property="description", type="string", example="Restaurant gastronomique savoyard"),
     *         @OA\Property(property="amOpeningTime", type="object",
     *             @OA\Property(property="open", type="string", example="12:00"),
     *             @OA\Property(property="close", type="string", example="14:00")
     *         ),
     *         @OA\Property(property="pmOpeningTime", type="object",
     *             @OA\Property(property="open", type="string", example="19:00"),
     *             @OA\Property(property="close", type="string", example="22:30")
     *         ),
     *         @OA\Property(property="maxGuest", type="integer", minimum=1, maximum=32767, example=45)
     *     )),
     *     @OA\Response(response=201, description="Restaurant créé"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=409, description="Nom déjà utilisé"),
     *     @OA\Response(response=422, description="Données invalides")
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

        $errors = $this->validateRestaurantData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $name = trim($data['name']);
        $description = trim($data['description']);

        if ($this->repository->findOneBy(['name' => $name]) !== null) {
            return $this->json([
                'error' => 'Un restaurant portant ce nom existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $restaurant = new Restaurant();
        $restaurant
            ->setUuid(Uuid::v4()->toRfc4122())
            ->setName($name)
            ->setDescription($description)
            ->setAmOpeningTime($data['amOpeningTime'])
            ->setPmOpeningTime($data['pmOpeningTime'])
            ->setMaxGuest($data['maxGuest'])
            ->setCreatedAt(new DateTimeImmutable());

        $this->entityManager->persist($restaurant);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Restaurant créé',
            'restaurant' => $this->formatRestaurant($restaurant),
        ], Response::HTTP_CREATED);
    }

    /**
     * @OA\Get(
     *     path="/api/restaurant/{id}",
     *     summary="Consulter un restaurant",
     *     description="Retourne un restaurant précis.",
     *     tags={"Restaurant"},
     *     security={},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Restaurant trouvé"),
     *     @OA\Response(response=404, description="Restaurant introuvable")
     * )
     */
    #[Route('/{id}', name: 'show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $restaurant = $this->repository->find($id);

        if ($restaurant === null) {
            return $this->json([
                'error' => 'Restaurant introuvable',
                'id' => $id,
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->formatRestaurant($restaurant));
    }

    /**
     * @OA\Put(
     *     path="/api/restaurant/{id}",
     *     summary="Modifier un restaurant",
     *     description="Opération réservée à ROLE_ADMIN.",
     *     tags={"Restaurant"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"name","description","amOpeningTime","pmOpeningTime","maxGuest"},
     *         @OA\Property(property="name", type="string", maxLength=32, example="Quai Antique"),
     *         @OA\Property(property="description", type="string", example="Restaurant gastronomique savoyard"),
     *         @OA\Property(property="amOpeningTime", type="object",
     *             @OA\Property(property="open", type="string", example="12:00"),
     *             @OA\Property(property="close", type="string", example="14:00")
     *         ),
     *         @OA\Property(property="pmOpeningTime", type="object",
     *             @OA\Property(property="open", type="string", example="19:00"),
     *             @OA\Property(property="close", type="string", example="22:30")
     *         ),
     *         @OA\Property(property="maxGuest", type="integer", minimum=1, maximum=32767, example=45)
     *     )),
     *     @OA\Response(response=200, description="Restaurant modifié"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=404, description="Restaurant introuvable"),
     *     @OA\Response(response=409, description="Nom déjà utilisé"),
     *     @OA\Response(response=422, description="Données invalides")
     * )
     */
    #[Route('/{id}', name: 'edit', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function edit(int $id, Request $request): JsonResponse
    {
        $restaurant = $this->repository->find($id);

        if ($restaurant === null) {
            return $this->json([
                'error' => 'Restaurant introuvable',
                'id' => $id,
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = $request->toArray();
        } catch (JsonException $exception) {
            return $this->json(['error' => 'Corps JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        $errors = $this->validateRestaurantData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $name = trim($data['name']);
        $description = trim($data['description']);
        $restaurantWithSameName = $this->repository->findOneBy(['name' => $name]);

        if ($restaurantWithSameName !== null
            && $restaurantWithSameName->getId() !== $restaurant->getId()) {
            return $this->json([
                'error' => 'Un restaurant portant ce nom existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $restaurant
            ->setName($name)
            ->setDescription($description)
            ->setAmOpeningTime($data['amOpeningTime'])
            ->setPmOpeningTime($data['pmOpeningTime'])
            ->setMaxGuest($data['maxGuest'])
            ->setUpdatedAt(new DateTimeImmutable());
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Restaurant modifié',
            'restaurant' => $this->formatRestaurant($restaurant),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/restaurant/{id}",
     *     summary="Supprimer un restaurant",
     *     description="Opération réservée à ROLE_ADMIN.",
     *     tags={"Restaurant"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Restaurant supprimé"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="ROLE_ADMIN requis"),
     *     @OA\Response(response=404, description="Restaurant introuvable")
     * )
     */
    #[Route('/{id}', name: 'delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): Response
    {
        $restaurant = $this->repository->find($id);

        if ($restaurant === null) {
            return $this->json([
                'error' => 'Restaurant introuvable',
                'id' => $id,
            ], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($restaurant);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function validateRestaurantData(array $data): array
    {
        $errors = [];

        if (!isset($data['name']) || !is_string($data['name']) || trim($data['name']) === '') {
            $errors['name'] = 'Le nom doit être une chaîne non vide';
        } elseif (mb_strlen(trim($data['name'])) > 32) {
            $errors['name'] = 'Le nom ne doit pas dépasser 32 caractères';
        }

        if (!isset($data['description'])
            || !is_string($data['description'])
            || trim($data['description']) === '') {
            $errors['description'] = 'La description doit être une chaîne non vide';
        }

        $this->validateScheduleField($data, 'amOpeningTime', 'matin', $errors);
        $this->validateScheduleField($data, 'pmOpeningTime', 'soir', $errors);

        if (!isset($errors['amOpeningTime'])
            && !isset($errors['pmOpeningTime'])
            && $data['amOpeningTime']['close'] >= $data['pmOpeningTime']['open']) {
            $errors['amOpeningTime'] = 'Le service du matin doit se terminer avant le service du soir';
        }

        if (!isset($data['maxGuest'])
            || !is_int($data['maxGuest'])
            || $data['maxGuest'] < 1
            || $data['maxGuest'] > 32767) {
            $errors['maxGuest'] = 'Le nombre maximal de couverts doit être compris entre 1 et 32767';
        }

        return $errors;
    }

    private function validateScheduleField(
        array $data,
        string $field,
        string $label,
        array &$errors
    ): void {
        if (!isset($data[$field]) || !is_array($data[$field])) {
            $errors[$field] = sprintf('Les horaires du %s doivent être un tableau JSON', $label);
            return;
        }

        $scheduleError = $this->availabilityService->validateSchedule($data[$field]);

        if ($scheduleError !== null) {
            $errors[$field] = $scheduleError;
        }
    }

    private function invalidDataResponse(array $errors): JsonResponse
    {
        return $this->json([
            'error' => 'Données invalides',
            'fields' => $errors,
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    private function formatRestaurant(Restaurant $restaurant): array
    {
        $data = $this->serializer->normalize(
            $restaurant,
            null,
            ['groups' => ['restaurant:read']]
        );

        return is_array($data) ? $data : [];
    }
}
