<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Entity\User;
use App\Repository\BookingRepository;
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

#[Route('/api/booking', name: 'app_api_booking_')]
class BookingController extends AbstractController
{
    private BookingRepository $repository;
    private RestaurantRepository $restaurantRepository;
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;
    private BookingAvailabilityService $availabilityService;

    public function __construct(
        BookingRepository $repository,
        RestaurantRepository $restaurantRepository,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        BookingAvailabilityService $availabilityService
    ) {
        $this->repository = $repository;
        $this->restaurantRepository = $restaurantRepository;
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->availabilityService = $availabilityService;
    }

    /**
     * @OA\Get(
     *     path="/api/booking", summary="Lister les réservations accessibles",
     *     description="Un client voit uniquement ses réservations; un administrateur voit toutes les réservations.",
     *     tags={"Bookings"}, security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="date", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Response(response=200, description="Liste filtrée des réservations"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=422, description="Date invalide")
     * )
     */
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $date = null;
        $dateParameter = $request->query->get('date');

        if ($dateParameter !== null) {
            if (!is_string($dateParameter) || !$this->isStrictDate($dateParameter)) {
                return $this->invalidDataResponse([
                    'date' => 'La date doit respecter le format YYYY-MM-DD',
                ]);
            }
            $date = $this->createOrderDate($dateParameter);
        }

        $user = $this->isGranted('ROLE_ADMIN') ? null : $this->authenticatedUser();
        $bookings = $this->repository->findForUserAndDate($user, $date);
        $data = [];

        foreach ($bookings as $booking) {
            $data[] = $this->formatBooking($booking);
        }

        return $this->json(['count' => count($data), 'bookings' => $data]);
    }

    /**
     * @OA\Get(
     *     path="/api/booking/availability", summary="Consulter les disponibilités",
     *     description="Retourne les services, capacités restantes et créneaux d’une date.",
     *     tags={"Availability"}, security={},
     *     @OA\Parameter(name="restaurantId", in="query", required=true, @OA\Schema(type="integer", minimum=1)),
     *     @OA\Parameter(name="date", in="query", required=true, description="Date YYYY-MM-DD", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="guestNumber", in="query", required=false, @OA\Schema(type="integer", minimum=1, default=1)),
     *     @OA\Response(response=200, description="Disponibilités ou fermeture du lundi"),
     *     @OA\Response(response=404, description="Restaurant introuvable"),
     *     @OA\Response(response=422, description="Paramètres invalides")
     * )
     */
    #[Route('/availability', name: 'availability', methods: ['GET'])]
    public function availability(Request $request): JsonResponse
    {
        $errors = [];
        $restaurantId = filter_var(
            $request->query->get('restaurantId'),
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        );
        $dateValue = $request->query->get('date');
        $guestNumberValue = $request->query->get('guestNumber', '1');
        $guestNumber = filter_var(
            $guestNumberValue,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1, 'max_range' => 32767]]
        );

        if ($restaurantId === false) {
            $errors['restaurantId'] = 'L’identifiant du restaurant doit être un entier strictement positif';
        }

        if (!is_string($dateValue) || !$this->isStrictDate($dateValue)) {
            $errors['date'] = 'La date doit respecter le format YYYY-MM-DD';
        } elseif ($this->createOrderDate($dateValue) < new DateTimeImmutable('today')) {
            $errors['date'] = 'La date de réservation ne peut pas être antérieure à aujourd’hui';
        }

        if ($guestNumber === false) {
            $errors['guestNumber'] = 'Le nombre de convives doit être un entier compris entre 1 et 32767';
        }

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $restaurant = $this->restaurantRepository->find($restaurantId);

        if ($restaurant === null) {
            return $this->json([
                'error' => 'Restaurant introuvable',
                'id' => $restaurantId,
            ], Response::HTTP_NOT_FOUND);
        }

        $date = $this->createOrderDate($dateValue);
        $closed = !$this->availabilityService->isOpenDate($date);

        return $this->json([
            'restaurant' => [
                'id' => $restaurant->getId(),
                'uuid' => $restaurant->getUuid(),
                'name' => $restaurant->getName(),
            ],
            'date' => $date->format('Y-m-d'),
            'guestNumber' => $guestNumber,
            'closed' => $closed,
            'maxGuest' => $restaurant->getMaxGuest(),
            'services' => $closed
                ? []
                : $this->availabilityService->availability($restaurant, $date, $guestNumber),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/booking", summary="Créer une réservation",
     *     description="Crée une réservation appartenant au client authentifié.",
     *     tags={"Bookings"}, security={{"X-AUTH-TOKEN"={}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"guestNumber","orderDate","orderHour","restaurantId"},
     *         @OA\Property(property="guestNumber", type="integer", minimum=1, maximum=32767, example=2),
     *         @OA\Property(property="orderDate", type="string", format="date", example="2027-06-15"),
     *         @OA\Property(property="orderHour", type="string", pattern="^\d{2}:\d{2}$", example="12:30"),
     *         @OA\Property(property="allergy", type="string", nullable=true, example="Arachides"),
     *         @OA\Property(property="restaurantId", type="integer", example=1)
     *     )),
     *     @OA\Response(response=201, description="Réservation créée"),
     *     @OA\Response(response=400, description="JSON invalide"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=422, description="Données, horaire ou capacité invalides")
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

        $errors = $this->validateBookingData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $restaurant = $this->restaurantRepository->find($data['restaurantId']);

        if ($restaurant === null) {
            return $this->invalidDataResponse([
                'restaurantId' => 'Le restaurant sélectionné est introuvable',
            ]);
        }

        $date = $this->createOrderDate($data['orderDate']);
        $businessErrors = $this->availabilityService->validateBooking(
            $restaurant,
            $date,
            $data['orderHour'],
            $data['guestNumber']
        );

        if ($businessErrors !== []) {
            return $this->invalidDataResponse($businessErrors);
        }

        $booking = new Booking();
        $booking
            ->setUuid(Uuid::v4()->toRfc4122())
            ->setGuestNumber($data['guestNumber'])
            ->setOrderDate($date)
            ->setOrderHour($this->createOrderHour($data['orderDate'], $data['orderHour']))
            ->setAllergy($this->cleanAllergy($data))
            ->setRestaurant($restaurant)
            ->setUser($this->authenticatedUser())
            ->setCreatedAt(new DateTimeImmutable());

        $this->entityManager->persist($booking);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Réservation créée',
            'booking' => $this->formatBooking($booking),
        ], Response::HTTP_CREATED);
    }

    /**
     * @OA\Get(
     *     path="/api/booking/{id}", summary="Consulter une réservation",
     *     description="Un client ne peut pas consulter la réservation d’un autre client.",
     *     tags={"Bookings"}, security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Réservation trouvée"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="Réservation appartenant à un autre client"),
     *     @OA\Response(response=404, description="Réservation introuvable")
     * )
     */
    #[Route('/{id}', name: 'show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $booking = $this->repository->find($id);

        if ($booking === null) {
            return $this->bookingNotFoundResponse($id);
        }
        if (!$this->canAccess($booking)) {
            return $this->accessDeniedResponse();
        }

        return $this->json($this->formatBooking($booking));
    }

    /**
     * @OA\Put(
     *     path="/api/booking/{id}", summary="Modifier une réservation",
     *     description="Le propriétaire ou un administrateur peut modifier la réservation.",
     *     tags={"Bookings"}, security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"guestNumber","orderDate","orderHour","restaurantId"},
     *         @OA\Property(property="guestNumber", type="integer", minimum=1, maximum=32767, example=2),
     *         @OA\Property(property="orderDate", type="string", format="date", example="2027-06-15"),
     *         @OA\Property(property="orderHour", type="string", pattern="^\d{2}:\d{2}$", example="12:30"),
     *         @OA\Property(property="allergy", type="string", nullable=true, example="Arachides"),
     *         @OA\Property(property="restaurantId", type="integer", example=1)
     *     )),
     *     @OA\Response(response=200, description="Réservation modifiée"),
     *     @OA\Response(response=400, description="JSON invalide"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="Réservation appartenant à un autre client"),
     *     @OA\Response(response=404, description="Réservation introuvable"),
     *     @OA\Response(response=422, description="Données, horaire ou capacité invalides")
     * )
     */
    #[Route('/{id}', name: 'edit', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function edit(int $id, Request $request): JsonResponse
    {
        $booking = $this->repository->find($id);

        if ($booking === null) {
            return $this->bookingNotFoundResponse($id);
        }
        if (!$this->canAccess($booking)) {
            return $this->accessDeniedResponse();
        }

        try {
            $data = $request->toArray();
        } catch (JsonException $exception) {
            return $this->json(['error' => 'Corps JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        $errors = $this->validateBookingData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $restaurant = $this->restaurantRepository->find($data['restaurantId']);

        if ($restaurant === null) {
            return $this->invalidDataResponse([
                'restaurantId' => 'Le restaurant sélectionné est introuvable',
            ]);
        }

        $date = $this->createOrderDate($data['orderDate']);
        $businessErrors = $this->availabilityService->validateBooking(
            $restaurant,
            $date,
            $data['orderHour'],
            $data['guestNumber'],
            $booking
        );

        if ($businessErrors !== []) {
            return $this->invalidDataResponse($businessErrors);
        }

        $booking
            ->setGuestNumber($data['guestNumber'])
            ->setOrderDate($date)
            ->setOrderHour($this->createOrderHour($data['orderDate'], $data['orderHour']))
            ->setAllergy($this->cleanAllergy($data))
            ->setRestaurant($restaurant)
            ->setUpdatedAt(new DateTimeImmutable());
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Réservation modifiée',
            'booking' => $this->formatBooking($booking),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/booking/{id}", summary="Supprimer une réservation",
     *     description="Le propriétaire ou un administrateur peut supprimer la réservation.",
     *     tags={"Bookings"}, security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=204, description="Réservation supprimée"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=403, description="Réservation appartenant à un autre client"),
     *     @OA\Response(response=404, description="Réservation introuvable")
     * )
     */
    #[Route('/{id}', name: 'delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): Response
    {
        $booking = $this->repository->find($id);

        if ($booking === null) {
            return $this->bookingNotFoundResponse($id);
        }
        if (!$this->canAccess($booking)) {
            return $this->accessDeniedResponse();
        }

        $this->entityManager->remove($booking);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function validateBookingData(array $data): array
    {
        $errors = [];

        if (!isset($data['guestNumber'])
            || !is_int($data['guestNumber'])
            || $data['guestNumber'] < 1
            || $data['guestNumber'] > 32767) {
            $errors['guestNumber'] = 'Le nombre de convives doit être un entier compris entre 1 et 32767';
        }

        if (!isset($data['orderDate'])
            || !is_string($data['orderDate'])
            || !$this->isStrictDate($data['orderDate'])) {
            $errors['orderDate'] = 'La date doit respecter le format YYYY-MM-DD';
        } elseif ($this->createOrderDate($data['orderDate']) < new DateTimeImmutable('today')) {
            $errors['orderDate'] = 'La date de réservation ne peut pas être antérieure à aujourd’hui';
        }

        if (!isset($data['orderHour'])
            || !is_string($data['orderHour'])
            || preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $data['orderHour']) !== 1) {
            $errors['orderHour'] = 'L’heure doit respecter le format HH:MM';
        } elseif (((int) substr($data['orderHour'], 3, 2)) % 15 !== 0) {
            $errors['orderHour'] = 'L’heure doit correspondre à un créneau de 15 minutes';
        }

        if (!isset($data['restaurantId'])
            || !is_int($data['restaurantId'])
            || $data['restaurantId'] < 1) {
            $errors['restaurantId'] = 'L’identifiant du restaurant doit être un entier strictement positif';
        }

        if (array_key_exists('allergy', $data)
            && $data['allergy'] !== null
            && (!is_string($data['allergy']) || mb_strlen(trim($data['allergy'])) > 255)) {
            $errors['allergy'] = 'Les allergies doivent être une chaîne de 255 caractères maximum ou null';
        }

        return $errors;
    }

    private function isStrictDate(string $date): bool
    {
        $parsedDate = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        $errors = DateTimeImmutable::getLastErrors();

        return $parsedDate !== false
            && ($errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0))
            && $parsedDate->format('Y-m-d') === $date;
    }

    private function createOrderDate(string $date): DateTimeImmutable
    {
        $orderDate = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        if ($orderDate === false) {
            throw new \LogicException('La date a été validée avant sa conversion.');
        }
        return $orderDate;
    }

    private function createOrderHour(string $date, string $hour): DateTimeImmutable
    {
        $orderHour = DateTimeImmutable::createFromFormat('!Y-m-d H:i', $date.' '.$hour);
        if ($orderHour === false) {
            throw new \LogicException('L’heure a été validée avant sa conversion.');
        }
        return $orderHour;
    }

    private function cleanAllergy(array $data): ?string
    {
        if (!array_key_exists('allergy', $data) || $data['allergy'] === null) {
            return null;
        }
        $allergy = trim($data['allergy']);
        return $allergy === '' ? null : $allergy;
    }

    private function invalidDataResponse(array $errors): JsonResponse
    {
        return $this->json([
            'error' => 'Données invalides',
            'fields' => $errors,
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    private function bookingNotFoundResponse(int $id): JsonResponse
    {
        return $this->json([
            'error' => 'Réservation introuvable',
            'id' => $id,
        ], Response::HTTP_NOT_FOUND);
    }

    private function authenticatedUser(): User
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            throw $this->createAccessDeniedException();
        }
        return $user;
    }

    private function canAccess(Booking $booking): bool
    {
        return $this->isGranted('ROLE_ADMIN')
            || $booking->getUser() === $this->authenticatedUser();
    }

    private function accessDeniedResponse(): JsonResponse
    {
        return $this->json(['error' => 'Accès interdit'], Response::HTTP_FORBIDDEN);
    }

    private function formatBooking(Booking $booking): array
    {
        $data = $this->serializer->normalize(
            $booking,
            null,
            ['groups' => ['booking:read']]
        );

        if (!is_array($data)) {
            return [];
        }

        $data['orderDate'] = $booking->getOrderDate()->format('Y-m-d');
        $data['orderHour'] = $booking->getOrderHour()->format('H:i');

        return $data;
    }
}
