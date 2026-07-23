<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Entity\User;

class AuthenticationTest extends ApiTestCase
{
    public function testAuthenticationLifecycle(): void
    {
        $client = static::createClient();

        $this->jsonRequest($client, 'POST', '/api/login', [
            'email' => 'admin@quai-antique.test',
            'password' => 'AdminQa2026!',
        ]);
        self::assertResponseIsSuccessful();
        $admin = $this->responseData($client);
        self::assertContains('ROLE_ADMIN', $admin['user']['roles']);
        self::assertContains('ROLE_USER', $admin['user']['roles']);

        $this->jsonRequest($client, 'POST', '/api/login', [
            'email' => 'client@quai-antique.test',
            'password' => 'ClientQa2026!',
        ]);
        self::assertResponseIsSuccessful();

        $this->jsonRequest($client, 'POST', '/api/login', [
            'email' => 'client@quai-antique.test',
            'password' => 'Incorrect1',
        ]);
        self::assertResponseStatusCodeSame(401);

        $email = 'functional.'.bin2hex(random_bytes(6)).'@example.test';
        $registration = [
            'firstName' => 'Test',
            'lastName' => 'Fonctionnel',
            'email' => $email,
            'password' => 'Temporary2026!',
            'passwordConfirmation' => 'Temporary2026!',
            'guestNumber' => 2,
            'allergy' => null,
        ];

        try {
            $this->jsonRequest($client, 'POST', '/api/registration', $registration);
            self::assertResponseStatusCodeSame(201);
            $created = $this->responseData($client);
            self::assertArrayNotHasKey('password', $created['user']);
            self::assertArrayNotHasKey('apiToken', $created['user']);
            self::assertArrayHasKey('apiToken', $created);
            $token = $created['apiToken'];

            $this->jsonRequest($client, 'POST', '/api/registration', $registration);
            self::assertResponseStatusCodeSame(409);

            $this->jsonRequest($client, 'GET', '/api/account/me', null, $token);
            self::assertResponseIsSuccessful();

            $this->jsonRequest($client, 'GET', '/api/account/me', null, str_repeat('0', 64));
            self::assertResponseStatusCodeSame(401);

            $this->jsonRequest($client, 'DELETE', '/api/account', null, $token);
            self::assertResponseStatusCodeSame(204);
        } finally {
            $manager = $this->entityManager();
            $remaining = $manager->getRepository(User::class)->findOneBy(['email' => $email]);
            if ($remaining !== null) {
                $manager->remove($remaining);
                $manager->flush();
            }
        }
    }
}

