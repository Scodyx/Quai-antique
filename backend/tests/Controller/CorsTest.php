<?php

declare(strict_types=1);

namespace App\Tests\Controller;

class CorsTest extends ApiTestCase
{
    public function testAllowedAndForbiddenPreflightOrigins(): void
    {
        $client = static::createClient();
        $server = [
            'HTTP_ORIGIN' => 'http://localhost:5500',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Content-Type,X-AUTH-TOKEN',
        ];
        $client->request('OPTIONS', '/api/booking', [], [], $server);
        self::assertContains($client->getResponse()->getStatusCode(), [200, 204]);
        self::assertResponseHeaderSame('Access-Control-Allow-Origin', 'http://localhost:5500');
        self::assertStringContainsString('POST', (string) $client->getResponse()->headers->get('Access-Control-Allow-Methods'));
        $allowedHeaders = strtolower((string) $client->getResponse()->headers->get('Access-Control-Allow-Headers'));
        self::assertStringContainsString('content-type', $allowedHeaders);
        self::assertStringContainsString('x-auth-token', $allowedHeaders);

        $server['HTTP_ORIGIN'] = 'https://example-malicious.test';
        $client->request('OPTIONS', '/api/booking', [], [], $server);
        self::assertNotSame(
            'https://example-malicious.test',
            $client->getResponse()->headers->get('Access-Control-Allow-Origin')
        );
    }
}
