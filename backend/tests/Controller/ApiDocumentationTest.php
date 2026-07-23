<?php

declare(strict_types=1);

namespace App\Tests\Controller;

class ApiDocumentationTest extends ApiTestCase
{
    public function testSwaggerUiAndOpenApiDocumentArePublicAndComplete(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/doc');
        self::assertResponseIsSuccessful();
        self::assertStringContainsString('text/html', (string) $client->getResponse()->headers->get('Content-Type'));
        self::assertStringContainsStringIgnoringCase('swagger', $client->getResponse()->getContent());

        $client->request('GET', '/api/doc.json');
        self::assertResponseIsSuccessful();
        self::assertStringContainsString('application/json', (string) $client->getResponse()->headers->get('Content-Type'));
        $document = $this->responseData($client);
        self::assertStringStartsWith('3.', $document['openapi']);
        self::assertArrayHasKey('paths', $document);
        self::assertArrayHasKey('X-AUTH-TOKEN', $document['components']['securitySchemes']);

        foreach ([
            '/api/registration',
            '/api/login',
            '/api/booking/availability',
            '/api/booking',
            '/api/restaurant',
        ] as $path) {
            self::assertArrayHasKey($path, $document['paths']);
        }

        $serialized = json_encode($document, JSON_THROW_ON_ERROR);
        self::assertStringNotContainsString('AdminQa2026!', $serialized);
        self::assertStringNotContainsString('ClientQa2026!', $serialized);
        foreach (['admin@quai-antique.test', 'client@quai-antique.test'] as $email) {
            self::assertStringNotContainsString((string) $this->fixtureUser($email)->getApiToken(), $serialized);
            self::assertStringNotContainsString((string) $this->fixtureUser($email)->getPassword(), $serialized);
        }
    }
}
