<?php

declare(strict_types=1);

namespace App\DataFixtures;

final class FixtureReferences
{
    public const RESTAURANT = 'restaurant.quai_antique';
    public const USER_ADMIN = 'user.admin';
    public const USER_CLIENT = 'user.client.demo';
    public const USER_GENERATED_PREFIX = 'user.client.generated.';
    public const CATEGORY_ENTREES = 'category.entrees';
    public const CATEGORY_PLATS = 'category.plats';
    public const CATEGORY_DESSERTS = 'category.desserts';
    public const CATEGORY_BOISSONS = 'category.boissons';
    public const FOOD_PREFIX = 'food.';

    private function __construct()
    {
    }
}
