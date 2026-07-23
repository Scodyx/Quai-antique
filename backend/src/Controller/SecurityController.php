<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\ApiTokenGenerator;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Exception\JsonException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Uid\Uuid;

#[Route('/api', name: 'app_api_')]
class SecurityController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private UserRepository $repository;
    private SerializerInterface $serializer;
    private UserPasswordHasherInterface $passwordHasher;
    private ApiTokenGenerator $tokenGenerator;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserRepository $repository,
        SerializerInterface $serializer,
        UserPasswordHasherInterface $passwordHasher,
        ApiTokenGenerator $tokenGenerator
    ) {
        $this->entityManager = $entityManager;
        $this->repository = $repository;
        $this->serializer = $serializer;
        $this->passwordHasher = $passwordHasher;
        $this->tokenGenerator = $tokenGenerator;
    }

    /**
     * @OA\Post(
     *     path="/api/registration", summary="Créer un compte client",
     *     description="Inscrit un nouveau client et retourne son token initial.",
     *     tags={"Authentication"}, security={},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"firstName","lastName","email","password","passwordConfirmation","guestNumber"},
     *         @OA\Property(property="firstName", type="string", example="Camille"),
     *         @OA\Property(property="lastName", type="string", example="Martin"),
     *         @OA\Property(property="email", type="string", format="email", example="camille@example.test"),
     *         @OA\Property(property="password", type="string", format="password", example="Exemple2026"),
     *         @OA\Property(property="passwordConfirmation", type="string", format="password", example="Exemple2026"),
     *         @OA\Property(property="guestNumber", type="integer", minimum=1, maximum=32767, example=2),
     *         @OA\Property(property="allergy", type="string", nullable=true, example="Arachides")
     *     )),
     *     @OA\Response(response=201, description="Compte créé"),
     *     @OA\Response(response=400, description="JSON invalide"),
     *     @OA\Response(response=409, description="E-mail déjà utilisé"),
     *     @OA\Response(response=422, description="Données invalides")
     * )
     */
    #[Route('/registration', name: 'registration', methods: ['POST'])]
    public function registration(Request $request): JsonResponse
    {
        try {
            $data = $request->toArray();
        } catch (JsonException $exception) {
            return $this->json(['error' => 'Corps JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        $errors = $this->validateRegistrationData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $email = mb_strtolower(trim($data['email']));

        if ($this->repository->findOneBy(['email' => $email]) !== null) {
            return $this->json([
                'error' => 'Un compte utilisant cette adresse e-mail existe déjà',
            ], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user
            ->setUuid(Uuid::v4()->toRfc4122())
            ->setEmail($email)
            ->setRoles([])
            ->setApiToken($this->tokenGenerator->generate())
            ->setFirstName(trim($data['firstName']))
            ->setLastName(trim($data['lastName']))
            ->setGuestNumber($data['guestNumber'])
            ->setAllergy($this->cleanAllergy($data))
            ->setCreatedAt(new DateTimeImmutable());
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Compte créé',
            'user' => $this->formatUser($user),
            'apiToken' => $user->getApiToken(),
        ], Response::HTTP_CREATED);
    }

    /**
     * @OA\Post(
     *     path="/api/login", summary="Se connecter",
     *     description="Authentifie un compte par e-mail et mot de passe.",
     *     tags={"Authentication"}, security={},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"email","password"},
     *         @OA\Property(property="email", type="string", format="email", example="utilisateur@example.test"),
     *         @OA\Property(property="password", type="string", format="password", example="Exemple2026")
     *     )),
     *     @OA\Response(response=200, description="Connexion réussie"),
     *     @OA\Response(response=401, description="Identifiants invalides")
     * )
     */
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        if ($user === null) {
            return $this->json(['error' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'message' => 'Connexion réussie',
            'user' => $this->formatUser($user),
            'apiToken' => $user->getApiToken(),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/account/me", summary="Consulter son profil",
     *     description="Retourne le compte associé au token.", tags={"Account"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Response(response=200, description="Profil courant"),
     *     @OA\Response(response=401, description="Authentification requise")
     * )
     */
    #[Route('/account/me', name: 'account_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        return $this->json(['user' => $this->formatUser($this->authenticatedUser())]);
    }

    /**
     * @OA\Put(
     *     path="/api/account/edit", summary="Modifier son profil",
     *     description="Modifie les informations non sensibles du compte.", tags={"Account"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"firstName","lastName","guestNumber"},
     *         @OA\Property(property="firstName", type="string", example="Camille"),
     *         @OA\Property(property="lastName", type="string", example="Martin"),
     *         @OA\Property(property="guestNumber", type="integer", minimum=1, maximum=32767, example=2),
     *         @OA\Property(property="allergy", type="string", nullable=true, example="Arachides")
     *     )),
     *     @OA\Response(response=200, description="Profil modifié"),
     *     @OA\Response(response=400, description="JSON invalide"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=422, description="Données invalides")
     * )
     */
    #[Route('/account/edit', name: 'account_edit', methods: ['PUT'])]
    public function editAccount(Request $request): JsonResponse
    {
        try {
            $data = $request->toArray();
        } catch (JsonException $exception) {
            return $this->json(['error' => 'Corps JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        $errors = $this->validateProfileData($data);

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $user = $this->authenticatedUser();
        $user
            ->setFirstName(trim($data['firstName']))
            ->setLastName(trim($data['lastName']))
            ->setGuestNumber($data['guestNumber'])
            ->setAllergy($this->cleanAllergy($data))
            ->setUpdatedAt(new DateTimeImmutable());

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Compte modifié',
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/account/password", summary="Modifier son mot de passe",
     *     description="Vérifie l’ancien mot de passe et renouvelle le token.", tags={"Account"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"currentPassword","newPassword","newPasswordConfirmation"},
     *         @OA\Property(property="currentPassword", type="string", format="password", example="Ancien2026"),
     *         @OA\Property(property="newPassword", type="string", format="password", example="Nouveau2026"),
     *         @OA\Property(property="newPasswordConfirmation", type="string", format="password", example="Nouveau2026")
     *     )),
     *     @OA\Response(response=200, description="Mot de passe modifié"),
     *     @OA\Response(response=400, description="JSON invalide"),
     *     @OA\Response(response=401, description="Authentification requise"),
     *     @OA\Response(response=422, description="Données invalides")
     * )
     */
    #[Route('/account/password', name: 'account_password', methods: ['PUT'])]
    public function editPassword(Request $request): JsonResponse
    {
        try {
            $data = $request->toArray();
        } catch (JsonException $exception) {
            return $this->json(['error' => 'Corps JSON invalide'], Response::HTTP_BAD_REQUEST);
        }

        $errors = [];
        $user = $this->authenticatedUser();

        if (!isset($data['currentPassword'])
            || !is_string($data['currentPassword'])
            || !$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
            $errors['currentPassword'] = 'Le mot de passe actuel est incorrect';
        }

        if (!isset($data['newPassword']) || !$this->isStrongPassword($data['newPassword'])) {
            $errors['newPassword'] = $this->passwordMessage();
        }

        if (!isset($data['newPasswordConfirmation'])
            || !isset($data['newPassword'])
            || $data['newPasswordConfirmation'] !== $data['newPassword']) {
            $errors['newPasswordConfirmation'] = 'La confirmation du mot de passe ne correspond pas';
        }

        if ($errors !== []) {
            return $this->invalidDataResponse($errors);
        }

        $user
            ->setPassword($this->passwordHasher->hashPassword($user, $data['newPassword']))
            ->setApiToken($this->tokenGenerator->generate())
            ->setUpdatedAt(new DateTimeImmutable());
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Mot de passe modifié',
            'apiToken' => $user->getApiToken(),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/account", summary="Supprimer son compte",
     *     description="Supprime définitivement le compte authentifié.", tags={"Account"},
     *     security={{"X-AUTH-TOKEN"={}}},
     *     @OA\Response(response=204, description="Compte supprimé"),
     *     @OA\Response(response=401, description="Authentification requise")
     * )
     */
    #[Route('/account', name: 'account_delete', methods: ['DELETE'])]
    public function deleteAccount(): Response
    {
        $this->entityManager->remove($this->authenticatedUser());
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function validateRegistrationData(array $data): array
    {
        $errors = $this->validateProfileData($data);

        if (!isset($data['email'])
            || !is_string($data['email'])
            || trim($data['email']) === ''
            || filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL) === false) {
            $errors['email'] = 'L’adresse e-mail doit être valide';
        } elseif (mb_strlen(trim($data['email'])) > 180) {
            $errors['email'] = 'L’adresse e-mail ne doit pas dépasser 180 caractères';
        }

        if (!isset($data['password']) || !$this->isStrongPassword($data['password'])) {
            $errors['password'] = $this->passwordMessage();
        }

        if (!isset($data['passwordConfirmation'])
            || !isset($data['password'])
            || $data['passwordConfirmation'] !== $data['password']) {
            $errors['passwordConfirmation'] = 'La confirmation du mot de passe ne correspond pas';
        }

        return $errors;
    }

    private function validateProfileData(array $data): array
    {
        $errors = [];

        if (!isset($data['firstName']) || !is_string($data['firstName']) || trim($data['firstName']) === '') {
            $errors['firstName'] = 'Le prénom doit être une chaîne non vide';
        } elseif (mb_strlen(trim($data['firstName'])) > 32) {
            $errors['firstName'] = 'Le prénom ne doit pas dépasser 32 caractères';
        }

        if (!isset($data['lastName']) || !is_string($data['lastName']) || trim($data['lastName']) === '') {
            $errors['lastName'] = 'Le nom doit être une chaîne non vide';
        } elseif (mb_strlen(trim($data['lastName'])) > 64) {
            $errors['lastName'] = 'Le nom ne doit pas dépasser 64 caractères';
        }

        if (!isset($data['guestNumber'])
            || !is_int($data['guestNumber'])
            || $data['guestNumber'] < 1
            || $data['guestNumber'] > 32767) {
            $errors['guestNumber'] = 'Le nombre habituel de convives doit être un entier compris entre 1 et 32767';
        }

        if (array_key_exists('allergy', $data)
            && $data['allergy'] !== null
            && (!is_string($data['allergy']) || mb_strlen(trim($data['allergy'])) > 255)) {
            $errors['allergy'] = 'Les allergies doivent être une chaîne de 255 caractères maximum ou null';
        }

        return $errors;
    }

    private function isStrongPassword($password): bool
    {
        return is_string($password)
            && mb_strlen($password) >= 8
            && preg_match('/[a-z]/', $password) === 1
            && preg_match('/[A-Z]/', $password) === 1
            && preg_match('/\d/', $password) === 1;
    }

    private function passwordMessage(): string
    {
        return 'Le mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule et un chiffre';
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

    private function authenticatedUser(): User
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            throw $this->createAccessDeniedException();
        }
        return $user;
    }

    private function formatUser(User $user): array
    {
        $data = $this->serializer->normalize($user, null, ['groups' => ['user:read']]);
        return is_array($data) ? $data : [];
    }
}
