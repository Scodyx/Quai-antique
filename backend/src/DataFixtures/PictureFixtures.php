<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Picture;
use App\Entity\Restaurant;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class PictureFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $restaurant = $this->getReference(FixtureReferences::RESTAURANT, Restaurant::class);
        $pictures = [
            ['Salle du Quai Antique', '/images/gallery/salle-quai-antique.jpg'],
            ['Filet de truite', '/images/gallery/filet-truite.jpg'],
            ['Salade savoyarde', '/images/gallery/salade-savoyarde.jpg'],
            ['Dessert aux myrtilles', '/images/gallery/dessert-myrtilles.jpg'],
            ['Table gastronomique', '/images/gallery/table-gastronomique.jpg'],
            ['Produits de Savoie', '/images/gallery/produits-savoie.jpg'],
            ['Menu du marché', '/images/gallery/menu-marche.jpg'],
            ['Création du chef', '/images/gallery/creation-chef.jpg'],
        ];

        foreach ($pictures as [$title, $slug]) {
            $manager->persist(
                (new Picture())
                    ->setTitle($title)
                    ->setSlug($slug)
                    ->setRestaurant($restaurant)
                    ->setCreatedAt(new DateTimeImmutable())
            );
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [RestaurantFixtures::class];
    }
}
