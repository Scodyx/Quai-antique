<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Entity\Restaurant;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

abstract class ApiTestCase extends WebTestCase
{
    protected function entityManager(): EntityManagerInterface
    {
        return self::getContainer()->get('doctrine')->getManager();
    }

    protected function restaurant(): Restaurant
    {
        $restaurant = $this->entityManager()
            ->getRepository(Restaurant::class)
            ->findOneBy(['name' => 'Quai Antique']);

        self::assertInstanceOf(Restaurant::class, $restaurant);
        return $restaurant;
    }

    protected function fixtureUser(string $email): User
    {
        $user = $this->entityManager()->getRepository(User::class)->findOneBy(['email' => $email]);
        self::assertInstanceOf(User::class, $user);
        return $user;
    }

    protected function tokenFor(string $email): string
    {
        $token = $this->fixtureUser($email)->getApiToken();
        self::assertNotNull($token);
        return $token;
    }

    protected function openDate(int $minimumDays = 7): DateTimeImmutable
    {
        $date = new DateTimeImmutable(sprintf('+%d days', $minimumDays));
        while ($date->format('N') === '1') {
            $date = $date->modify('+1 day');
        }
        return $date;
    }

    protected function futureMonday(): DateTimeImmutable
    {
        return new DateTimeImmutable('next monday');
    }

    protected function jsonRequest(
        KernelBrowser $client,
        string $method,
        string $uri,
        ?array $body = null,
        ?string $token = null,
        array $server = []
    ): void {
        $headers = array_merge(['CONTENT_TYPE' => 'application/json'], $server);
        if ($token !== null) {
            $headers['HTTP_X_AUTH_TOKEN'] = $token;
        }
        $client->request(
            $method,
            $uri,
            [],
            [],
            $headers,
            $body === null ? null : json_encode($body, JSON_THROW_ON_ERROR)
        );
    }

    protected function responseData(KernelBrowser $client): array
    {
        $data = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($data);
        return $data;
    }
}

