<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Entity\Booking;
use App\Entity\User;

class BookingOwnershipTest extends ApiTestCase
{
    public function testOwnerOtherClientAndAdminPermissions(): void
    {
        $client = static::createClient();
        $manager = $this->entityManager();
        $owner = $this->fixtureUser('client@quai-antique.test');
        $other = $manager->getRepository(User::class)->createQueryBuilder('u')
            ->andWhere('u.email NOT IN (:emails)')
            ->setParameter('emails', ['admin@quai-antique.test', 'client@quai-antique.test'])
            ->setMaxResults(1)
            ->getQuery()
            ->getSingleResult();
        self::assertInstanceOf(User::class, $other);

        $ownerToken = (string) $owner->getApiToken();
        $otherToken = (string) $other->getApiToken();
        $adminToken = $this->tokenFor('admin@quai-antique.test');
        $restaurant = $this->restaurant();
        $date = $this->openDate(21)->format('Y-m-d');
        $body = [
            'guestNumber' => 2,
            'orderDate' => $date,
            'orderHour' => '12:15',
            'allergy' => null,
            'restaurantId' => $restaurant->getId(),
        ];
        $bookingId = null;

        try {
            $this->jsonRequest($client, 'POST', '/api/booking', $body, $ownerToken);
            self::assertResponseStatusCodeSame(201);
            $created = $this->responseData($client)['booking'];
            $bookingId = $created['id'];
            self::assertSame($owner->getId(), $created['user']['id']);

            $this->jsonRequest($client, 'GET', '/api/booking/'.$bookingId, null, $ownerToken);
            self::assertResponseIsSuccessful();
            $this->jsonRequest($client, 'GET', '/api/booking/'.$bookingId, null, $otherToken);
            self::assertResponseStatusCodeSame(403);
            $this->jsonRequest($client, 'PUT', '/api/booking/'.$bookingId, $body, $otherToken);
            self::assertResponseStatusCodeSame(403);
            $this->jsonRequest($client, 'DELETE', '/api/booking/'.$bookingId, null, $otherToken);
            self::assertResponseStatusCodeSame(403);

            $this->jsonRequest($client, 'GET', '/api/booking/'.$bookingId, null, $adminToken);
            self::assertResponseIsSuccessful();
            $body['guestNumber'] = 3;
            $this->jsonRequest($client, 'PUT', '/api/booking/'.$bookingId, $body, $adminToken);
            self::assertResponseIsSuccessful();
            self::assertSame($owner->getId(), $this->responseData($client)['booking']['user']['id']);

            $this->jsonRequest($client, 'DELETE', '/api/booking/'.$bookingId, null, $ownerToken);
            self::assertResponseStatusCodeSame(204);
            $bookingId = null;
        } finally {
            if ($bookingId !== null) {
                $manager->clear();
                $booking = $manager->getRepository(Booking::class)->find($bookingId);
                if ($booking !== null) {
                    $manager->remove($booking);
                    $manager->flush();
                }
            }
        }
    }
}

