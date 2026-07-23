<?php

declare(strict_types=1);

namespace App\Tests\Controller;

class ApiSmokeTest extends ApiTestCase
{
    public function testPublicReadsAndProtectedRoutes(): void
    {
        $client = static::createClient();

        foreach (['restaurant', 'category', 'food', 'menu', 'picture'] as $resource) {
            $client->request('GET', '/api/'.$resource);
            self::assertResponseIsSuccessful();
            self::assertResponseHeaderSame('Content-Type', 'application/json');
        }

        $restaurant = $this->restaurant();
        $date = $this->openDate();
        $client->request('GET', sprintf(
            '/api/booking/availability?restaurantId=%d&date=%s&guestNumber=2',
            $restaurant->getId(),
            $date->format('Y-m-d')
        ));
        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('Content-Type', 'application/json');

        $client->request('GET', '/api/account/me');
        self::assertResponseStatusCodeSame(401);
        $client->request('GET', '/api/booking');
        self::assertResponseStatusCodeSame(401);
    }
}

