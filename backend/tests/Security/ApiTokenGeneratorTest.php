<?php

declare(strict_types=1);

namespace App\Tests\Security;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\ApiTokenGenerator;
use PHPUnit\Framework\TestCase;

class ApiTokenGeneratorTest extends TestCase
{
    public function testGeneratedTokenIsNonEmptyHexadecimalAndHasExpectedLength(): void
    {
        $repository = $this->createMock(UserRepository::class);
        $repository->expects(self::once())->method('findOneBy')->willReturn(null);

        $token = (new ApiTokenGenerator($repository))->generate();

        self::assertNotSame('', $token);
        self::assertSame(64, strlen($token));
        self::assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $token);
    }

    public function testGeneratorRetriesWhenTokenAlreadyExists(): void
    {
        $repository = $this->createMock(UserRepository::class);
        $repository->expects(self::exactly(2))
            ->method('findOneBy')
            ->willReturnOnConsecutiveCalls(new User(), null);

        $token = (new ApiTokenGenerator($repository))->generate();

        self::assertSame(64, strlen($token));
        self::assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $token);
    }
}

