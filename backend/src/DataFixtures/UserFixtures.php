<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\User;
use App\Security\ApiTokenGenerator;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Uid\Uuid;

class UserFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;
    private ApiTokenGenerator $tokenGenerator;

    public function __construct(
        UserPasswordHasherInterface $passwordHasher,
        ApiTokenGenerator $tokenGenerator
    ) {
        $this->passwordHasher = $passwordHasher;
        $this->tokenGenerator = $tokenGenerator;
    }

    public function load(ObjectManager $manager): void
    {
        $this->createUser(
            $manager,
            'Admin',
            'Quai Antique',
            'admin@quai-antique.test',
            'AdminQa2026!',
            ['ROLE_ADMIN'],
            2,
            null,
            FixtureReferences::USER_ADMIN
        );
        $this->createUser(
            $manager,
            'Camille',
            'Martin',
            'client@quai-antique.test',
            'ClientQa2026!',
            [],
            4,
            'Arachides',
            FixtureReferences::USER_CLIENT
        );

        $faker = Factory::create('fr_FR');
        $faker->seed(20260723);
        $allergies = [null, 'Gluten', 'Lactose', 'Fruits à coque', 'Fruits de mer'];

        for ($index = 1; $index <= 3; ++$index) {
            $this->createUser(
                $manager,
                $faker->firstName(),
                $faker->lastName(),
                mb_strtolower($faker->unique()->safeEmail()),
                'ClientQa2026!',
                [],
                $faker->numberBetween(1, 6),
                $faker->randomElement($allergies),
                FixtureReferences::USER_GENERATED_PREFIX.$index
            );
        }
    }

    private function createUser(
        ObjectManager $manager,
        string $firstName,
        string $lastName,
        string $email,
        string $plainPassword,
        array $roles,
        int $guestNumber,
        ?string $allergy,
        string $reference
    ): void {
        $user = (new User())
            ->setUuid(Uuid::v4()->toRfc4122())
            ->setEmail(mb_strtolower($email))
            ->setRoles($roles)
            ->setApiToken($this->tokenGenerator->generate())
            ->setFirstName($firstName)
            ->setLastName($lastName)
            ->setGuestNumber($guestNumber)
            ->setAllergy($allergy)
            ->setCreatedAt(new DateTimeImmutable());
        $user->setPassword($this->passwordHasher->hashPassword($user, $plainPassword));

        $manager->persist($user);
        $manager->flush();
        $this->addReference($reference, $user);
    }
}
