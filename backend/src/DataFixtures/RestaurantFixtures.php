<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Restaurant;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Uid\Uuid;

class RestaurantFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $restaurant = (new Restaurant())
            ->setUuid(Uuid::v4()->toRfc4122())
            ->setName('Quai Antique')
            ->setDescription('Restaurant gastronomique savoyard du chef Arnaud Michant')
            ->setAmOpeningTime(['open' => '12:00', 'close' => '14:00'])
            ->setPmOpeningTime(['open' => '19:00', 'close' => '22:30'])
            ->setMaxGuest(45)
            ->setCreatedAt(new DateTimeImmutable());

        $manager->persist($restaurant);
        $manager->flush();
        $this->addReference(FixtureReferences::RESTAURANT, $restaurant);
    }
}
