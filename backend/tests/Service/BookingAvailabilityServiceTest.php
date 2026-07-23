<?php

declare(strict_types=1);

namespace App\Tests\Service;

use App\Entity\Booking;
use App\Entity\Restaurant;
use App\Repository\BookingRepository;
use App\Service\BookingAvailabilityService;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

class BookingAvailabilityServiceTest extends TestCase
{
    private function restaurant(): Restaurant
    {
        return (new Restaurant())
            ->setAmOpeningTime(['open' => '12:00', 'close' => '14:00'])
            ->setPmOpeningTime(['open' => '19:00', 'close' => '22:30'])
            ->setMaxGuest(45);
    }

    public function testMondayIsClosedAndTuesdayIsOpen(): void
    {
        $service = new BookingAvailabilityService($this->createMock(BookingRepository::class));

        self::assertFalse($service->isOpenDate(new DateTimeImmutable('2026-07-27')));
        self::assertTrue($service->isOpenDate(new DateTimeImmutable('2026-07-28')));
    }

    public function testAmAndPmSlotsHaveExpectedBoundsAndCounts(): void
    {
        $service = new BookingAvailabilityService($this->createMock(BookingRepository::class));
        $am = $service->generateSlots('12:00', '14:00');
        $pm = $service->generateSlots('19:00', '22:30');

        self::assertCount(9, $am);
        self::assertSame('12:00', $am[0]);
        self::assertSame('14:00', $am[8]);
        self::assertCount(15, $pm);
        self::assertSame('19:00', $pm[0]);
        self::assertSame('22:30', $pm[14]);
    }

    public function testHoursAreAssignedToExpectedServices(): void
    {
        $service = new BookingAvailabilityService($this->createMock(BookingRepository::class));
        $restaurant = $this->restaurant();
        $date = new DateTimeImmutable('2026-07-28');

        self::assertSame('am', $service->findService($restaurant, $date, '12:30')['name']);
        self::assertSame('pm', $service->findService($restaurant, $date, '20:15')['name']);
        self::assertNull($service->findService($restaurant, $date, '15:00'));
    }

    public function testAvailabilityReportsFiveRemainingPlaces(): void
    {
        $repository = $this->createMock(BookingRepository::class);
        $repository->method('sumGuestsForService')->willReturn(40);
        $availability = (new BookingAvailabilityService($repository))->availability(
            $this->restaurant(),
            new DateTimeImmutable('2026-07-28'),
            6
        );

        self::assertSame(5, $availability[0]['remainingCapacity']);
        self::assertFalse($availability[0]['slots'][0]['available']);
    }

    public function testExactRemainingCapacityIsAcceptedButExcessIsRefused(): void
    {
        $repository = $this->createMock(BookingRepository::class);
        $repository->method('sumGuestsForService')->willReturn(40);
        $service = new BookingAvailabilityService($repository);
        $restaurant = $this->restaurant();
        $date = new DateTimeImmutable('2026-07-28');

        self::assertSame(
            ['guestNumber' => 'La capacité maximale du service est dépassée'],
            $service->validateBooking($restaurant, $date, '12:00', 6)
        );
        self::assertSame([], $service->validateBooking($restaurant, $date, '12:00', 5));
    }

    public function testEditingPassesExcludedBookingToRepository(): void
    {
        $restaurant = $this->restaurant();
        $date = new DateTimeImmutable('2026-07-28');
        $excluded = new Booking();
        $repository = $this->createMock(BookingRepository::class);
        $repository->expects(self::once())
            ->method('sumGuestsForService')
            ->with(
                self::identicalTo($restaurant),
                self::equalTo($date),
                self::isInstanceOf(DateTimeImmutable::class),
                self::isInstanceOf(DateTimeImmutable::class),
                self::identicalTo($excluded)
            )
            ->willReturn(0);

        self::assertSame(
            [],
            (new BookingAvailabilityService($repository))
                ->validateBooking($restaurant, $date, '12:00', 2, $excluded)
        );
    }
}
