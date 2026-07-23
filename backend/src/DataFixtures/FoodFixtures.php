<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\Food;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Uid\Uuid;

class FoodFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $foods = [
            ['salade-savoyarde', 'Salade savoyarde', 'Salade, jambon cru de Savoie, noix et tomme', 1550, FixtureReferences::CATEGORY_ENTREES],
            ['oeuf-parfait', 'Œuf parfait aux champignons', 'Œuf parfait, crème de champignons et noisettes torréfiées', 1450, FixtureReferences::CATEGORY_ENTREES],
            ['truite-fumee', 'Truite fumée des Alpes', 'Truite fumée, condiment citronné et jeunes pousses', 1700, FixtureReferences::CATEGORY_ENTREES],
            ['filet-truite', 'Filet de truite, beurre citronné', 'Filet de truite, légumes de saison et beurre citronné', 2800, FixtureReferences::CATEGORY_PLATS],
            ['supreme-volaille', 'Suprême de volaille fermière', 'Volaille fermière, jus réduit et pommes de terre fondantes', 2700, FixtureReferences::CATEGORY_PLATS],
            ['risotto', 'Risotto crémeux aux champignons', 'Risotto arborio, champignons et parmesan affiné', 2400, FixtureReferences::CATEGORY_PLATS],
            ['tarte-myrtilles', 'Tarte aux myrtilles', 'Tarte fine aux myrtilles et crème légère à la vanille', 1100, FixtureReferences::CATEGORY_DESSERTS],
            ['moelleux-chocolat', 'Moelleux au chocolat', 'Chocolat noir, cœur fondant et glace artisanale', 1150, FixtureReferences::CATEGORY_DESSERTS],
            ['faisselle', 'Faisselle de Savoie', 'Faisselle, miel de montagne et noix', 950, FixtureReferences::CATEGORY_DESSERTS],
            ['jus-pomme', 'Jus de pomme artisanal', 'Jus de pomme de Savoie', 600, FixtureReferences::CATEGORY_BOISSONS],
            ['eau-petillante', 'Eau pétillante', 'Eau minérale pétillante', 450, FixtureReferences::CATEGORY_BOISSONS],
            ['the-montagnes', 'Thé des montagnes', 'Infusion aux plantes alpines', 500, FixtureReferences::CATEGORY_BOISSONS],
        ];

        foreach ($foods as [$reference, $title, $description, $price, $categoryReference]) {
            $category = $this->getReference($categoryReference, Category::class);
            $food = (new Food())
                ->setUuid(Uuid::v4()->toRfc4122())
                ->setTitle($title)
                ->setDescription($description)
                ->setPrice($price)
                ->setCreatedAt(new DateTimeImmutable())
                ->addCategory($category);
            $manager->persist($food);
            $this->addReference(FixtureReferences::FOOD_PREFIX.$reference, $food);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [CategoryFixtures::class];
    }
}
