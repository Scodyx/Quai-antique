<?php

declare(strict_types=1);

namespace App\Tests\Controller;

class BookingAvailabilityTest extends ApiTestCase
{
    public function testAvailabilityValidationAndSlots(): void
    {
        $client = static::createClient();
        $restaurant = $this->restaurant();
        $base = '/api/booking/availability?restaurantId='.$restaurant->getId();

        $client->request('GET', $base.'&date='.$this->openDate()->format('Y-m-d').'&guestNumber=2');
        self::assertResponseIsSuccessful();
        $open = $this->responseData($client);
        self::assertFalse($open['closed']);
        self::assertSame('12:00', $open['services'][0]['slots'][0]['time']);
        self::assertSame('14:00', $open['services'][0]['slots'][8]['time']);
        self::assertSame('19:00', $open['services'][1]['slots'][0]['time']);
        self::assertSame('22:30', $open['services'][1]['slots'][14]['time']);
        foreach ($open['services'] as $service) {
            self::assertGreaterThanOrEqual(0, $service['remainingCapacity']);
        }

        $client->request('GET', $base.'&date='.$this->futureMonday()->format('Y-m-d').'&guestNumber=2');
        self::assertResponseIsSuccessful();
        self::assertTrue($this->responseData($client)['closed']);

        $client->request('GET', $base.'&date=incorrecte&guestNumber=2');
        self::assertResponseStatusCodeSame(422);
        $client->request('GET', '/api/booking/availability?restaurantId=999999&date='.$this->openDate()->format('Y-m-d'));
        self::assertResponseStatusCodeSame(404);
        $client->request('GET', $base.'&date='.$this->openDate()->format('Y-m-d').'&guestNumber=0');
        self::assertResponseStatusCodeSame(422);
    }
}

