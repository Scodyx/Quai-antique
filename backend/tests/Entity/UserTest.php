<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\Booking;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function testUserAlwaysHasRoleUserWithoutExplicitRole(): void
    {
        self::assertSame(['ROLE_USER'], (new User())->getRoles());
    }

    public function testAdminAlsoHasRoleUserWithoutDuplicate(): void
    {
        $roles = (new User())->setRoles(['ROLE_ADMIN', 'ROLE_USER', 'ROLE_ADMIN'])->getRoles();

        self::assertContains('ROLE_ADMIN', $roles);
        self::assertContains('ROLE_USER', $roles);
        self::assertSame($roles, array_values(array_unique($roles)));
    }

    public function testProfileGettersAndSetters(): void
    {
        $user = (new User())
            ->setFirstName('Camille')
            ->setLastName('Martin')
            ->setGuestNumber(4)
            ->setAllergy(null)
            ->setEmail('camille@example.test');

        self::assertSame('Camille', $user->getFirstName());
        self::assertSame('Martin', $user->getLastName());
        self::assertSame(4, $user->getGuestNumber());
        self::assertNull($user->getAllergy());
        self::assertSame('camille@example.test', $user->getUserIdentifier());
        $user->eraseCredentials();
        self::assertTrue(true);
    }

    public function testBookingsCollectionCanAddAndRemoveBooking(): void
    {
        $user = new User();
        $booking = new Booking();

        self::assertCount(0, $user->getBookings());
        $user->addBooking($booking);
        self::assertCount(1, $user->getBookings());
        self::assertSame($user, $booking->getUser());

        $user->removeBooking($booking);
        self::assertCount(0, $user->getBookings());
        self::assertNull($booking->getUser());
    }
}

