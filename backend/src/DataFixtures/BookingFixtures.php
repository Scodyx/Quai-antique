<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Booking;
use App\Entity\Restaurant;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Uid\Uuid;

class BookingFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $restaurant = $this->getReference(FixtureReferences::RESTAURANT, Restaurant::class);
        $users = [
            $this->getReference(FixtureReferences::USER_CLIENT, User::class),
            $this->getReference(FixtureReferences::USER_GENERATED_PREFIX.'1', User::class),
            $this->getReference(FixtureReferences::USER_GENERATED_PREFIX.'2', User::class),
            $this->getReference(FixtureReferences::USER_GENERATED_PREFIX.'3', User::class),
        ];
        $tuesday = new DateTimeImmutable('next tuesday');
        $saturday = new DateTimeImmutable('next saturday');
        $bookings = [
            [$users[0], $tuesday, '12:00', 2, 'Arachides'],
            [$users[1], $tuesday, '12:30', 4, null],
            [$users[2], $tuesday, '19:00', 3, 'Gluten'],
            [$users[3], $tuesday, '19:30', 2, null],
            [$users[0], $saturday, '12:45', 4, 'Arachides'],
            [$users[1], $saturday, '13:15', 2, 'Lactose'],
            [$users[2], $saturday, '20:15', 5, null],
            [$users[3], $saturday, '21:00', 3, 'Fruits de mer'],
        ];

        foreach ($bookings as [$user, $date, $hour, $guestNumber, $allergy]) {
            $orderHour = new DateTimeImmutable($date->format('Y-m-d').' '.$hour);
            $manager->persist(
                (new Booking())
                    ->setUuid(Uuid::v4()->toRfc4122())
                    ->setUser($user)
                    ->setRestaurant($restaurant)
                    ->setGuestNumber($guestNumber)
                    ->setOrderDate($date)
                    ->setOrderHour($orderHour)
                    ->setAllergy($allergy)
                    ->setCreatedAt(new DateTimeImmutable())
            );
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [RestaurantFixtures::class, UserFixtures::class];
    }
}
