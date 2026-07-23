<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\ApiTokenGenerator;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Uid\Uuid;

class CreateAdminCommand extends Command
{
    protected static $defaultName = 'app:create-admin';

    private EntityManagerInterface $entityManager;
    private UserRepository $repository;
    private UserPasswordHasherInterface $passwordHasher;
    private ApiTokenGenerator $tokenGenerator;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserRepository $repository,
        UserPasswordHasherInterface $passwordHasher,
        ApiTokenGenerator $tokenGenerator
    ) {
        parent::__construct();
        $this->entityManager = $entityManager;
        $this->repository = $repository;
        $this->passwordHasher = $passwordHasher;
        $this->tokenGenerator = $tokenGenerator;
    }

    protected function configure(): void
    {
        $this
            ->setDescription('Crée un compte administrateur.')
            ->addArgument('email', InputArgument::REQUIRED)
            ->addArgument('password', InputArgument::REQUIRED)
            ->addArgument('firstName', InputArgument::REQUIRED)
            ->addArgument('lastName', InputArgument::REQUIRED)
            ->addArgument('guestNumber', InputArgument::REQUIRED)
            ->addArgument('allergy', InputArgument::OPTIONAL);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $email = mb_strtolower(trim((string) $input->getArgument('email')));
        $password = (string) $input->getArgument('password');
        $firstName = trim((string) $input->getArgument('firstName'));
        $lastName = trim((string) $input->getArgument('lastName'));
        $guestNumber = filter_var($input->getArgument('guestNumber'), FILTER_VALIDATE_INT);
        $allergyValue = $input->getArgument('allergy');
        $allergy = $allergyValue === null ? null : trim((string) $allergyValue);
        $allergy = $allergy === '' ? null : $allergy;

        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || mb_strlen($email) > 180
            || $firstName === '' || mb_strlen($firstName) > 32
            || $lastName === '' || mb_strlen($lastName) > 64
            || $guestNumber === false || $guestNumber < 1 || $guestNumber > 32767
            || ($allergy !== null && mb_strlen($allergy) > 255)
            || !$this->isStrongPassword($password)) {
            $output->writeln('<error>Données administrateur invalides.</error>');
            return Command::INVALID;
        }

        if ($this->repository->findOneBy(['email' => $email]) !== null) {
            $output->writeln('<error>Un compte utilisant cette adresse e-mail existe déjà.</error>');
            return Command::FAILURE;
        }

        $user = new User();
        $user
            ->setUuid(Uuid::v4()->toRfc4122())
            ->setEmail($email)
            ->setRoles(['ROLE_ADMIN'])
            ->setApiToken($this->tokenGenerator->generate())
            ->setFirstName($firstName)
            ->setLastName($lastName)
            ->setGuestNumber($guestNumber)
            ->setAllergy($allergy)
            ->setCreatedAt(new DateTimeImmutable());
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $output->writeln('<info>Administrateur créé.</info>');
        $output->writeln('E-mail : '.$user->getEmail());
        $output->writeln('UUID : '.$user->getUuid());

        return Command::SUCCESS;
    }

    private function isStrongPassword(string $password): bool
    {
        return mb_strlen($password) >= 8
            && preg_match('/[a-z]/', $password) === 1
            && preg_match('/[A-Z]/', $password) === 1
            && preg_match('/\d/', $password) === 1;
    }
}
