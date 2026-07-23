<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Entity\Category;

class AuthorizationTest extends ApiTestCase
{
    public function testCategoryWriteAuthorization(): void
    {
        $client = static::createClient();
        $title = 'Catégorie test '.bin2hex(random_bytes(5));

        try {
            $this->jsonRequest($client, 'POST', '/api/category', ['title' => $title]);
            self::assertResponseStatusCodeSame(401);

            $this->jsonRequest(
                $client,
                'POST',
                '/api/category',
                ['title' => $title],
                $this->tokenFor('client@quai-antique.test')
            );
            self::assertResponseStatusCodeSame(403);

            $this->jsonRequest(
                $client,
                'POST',
                '/api/category',
                ['title' => $title],
                $this->tokenFor('admin@quai-antique.test')
            );
            self::assertResponseStatusCodeSame(201);
            $categoryId = $this->responseData($client)['category']['id'];

            $this->jsonRequest(
                $client,
                'DELETE',
                '/api/category/'.$categoryId,
                null,
                $this->tokenFor('admin@quai-antique.test')
            );
            self::assertResponseStatusCodeSame(204);
        } finally {
            $manager = $this->entityManager();
            $category = $manager->getRepository(Category::class)->findOneBy(['title' => $title]);
            if ($category !== null) {
                $manager->remove($category);
                $manager->flush();
            }
        }
    }
}

