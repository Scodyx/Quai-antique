<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\Menu;
use App\Entity\Restaurant;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Uid\Uuid;

class MenuFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $restaurant = $this->getReference(FixtureReferences::RESTAURANT, Restaurant::class);
        $categories = [
            $this->getReference(FixtureReferences::CATEGORY_ENTREES, Category::class),
            $this->getReference(FixtureReferences::CATEGORY_PLATS, Category::class),
            $this->getReference(FixtureReferences::CATEGORY_DESSERTS, Category::class),
        ];
        $menus = [
            ['Menu du Marché', 'Entrée du jour, plat du jour et dessert du jour', 3900],
            ['Menu Savoyard', 'Sélection de spécialités savoyardes en trois services', 4900],
            ['Menu Découverte', 'Parcours gastronomique imaginé par le chef Arnaud Michant', 6500],
        ];

        foreach ($menus as [$title, $description, $price]) {
            $menu = (new Menu())
                ->setUuid(Uuid::v4()->toRfc4122())
                ->setTitle($title)
                ->setDescription($description)
                ->setPrice($price)
                ->setRestaurant($restaurant)
                ->setCreatedAt(new DateTimeImmutable());
            foreach ($categories as $category) {
                $menu->addCategory($category);
            }
            $manager->persist($menu);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [RestaurantFixtures::class, CategoryFixtures::class];
    }
}
