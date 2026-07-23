<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Category;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Uid\Uuid;

class CategoryFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $categories = [
            FixtureReferences::CATEGORY_ENTREES => 'Entrées',
            FixtureReferences::CATEGORY_PLATS => 'Plats',
            FixtureReferences::CATEGORY_DESSERTS => 'Desserts',
            FixtureReferences::CATEGORY_BOISSONS => 'Boissons',
        ];

        foreach ($categories as $reference => $title) {
            $category = (new Category())
                ->setUuid(Uuid::v4()->toRfc4122())
                ->setTitle($title)
                ->setCreatedAt(new DateTimeImmutable());
            $manager->persist($category);
            $this->addReference($reference, $category);
        }

        $manager->flush();
    }
}
