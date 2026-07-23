<?php

namespace App\Service;

use App\Entity\Booking;
use App\Entity\Restaurant;
use App\Repository\BookingRepository;
use DateTimeImmutable;

class BookingAvailabilityService
{
    private BookingRepository $repository;

    public function __construct(BookingRepository $repository)
    {
        $this->repository = $repository;
    }

    public function validateSchedule(array $schedule): ?string
    {
        if (!array_key_exists('open', $schedule) || !array_key_exists('close', $schedule)) {
            return 'Les horaires doivent contenir les propriétés open et close';
        }

        if (!is_string($schedule['open']) || !$this->isStrictTime($schedule['open'])) {
            return 'L’heure d’ouverture doit respecter le format HH:MM';
        }

        if (!is_string($schedule['close']) || !$this->isStrictTime($schedule['close'])) {
            return 'L’heure de fermeture doit respecter le format HH:MM';
        }

        if (!$this->isQuarterHour($schedule['open']) || !$this->isQuarterHour($schedule['close'])) {
            return 'Les horaires doivent correspondre à des créneaux de 15 minutes';
        }

        if ($this->timeToMinutes($schedule['open']) >= $this->timeToMinutes($schedule['close'])) {
            return 'L’heure d’ouverture doit être antérieure à l’heure de fermeture';
        }

        return null;
    }

    public function isOpenDate(DateTimeImmutable $date): bool
    {
        return $date->format('N') !== '1';
    }

    public function findService(
        Restaurant $restaurant,
        DateTimeImmutable $date,
        string $hour
    ): ?array {
        foreach ($this->services($restaurant, $date) as $service) {
            if ($hour >= $service['open'] && $hour <= $service['close']) {
                return $service;
            }
        }

        return null;
    }

    public function generateSlots(string $open, string $close): array
    {
        $slots = [];
        $current = $this->timeToMinutes($open);
        $end = $this->timeToMinutes($close);

        while ($current <= $end) {
            $slots[] = sprintf('%02d:%02d', intdiv($current, 60), $current % 60);
            $current += 15;
        }

        return $slots;
    }

    public function validateBooking(
        Restaurant $restaurant,
        DateTimeImmutable $date,
        string $hour,
        int $guestNumber,
        ?Booking $excludedBooking = null
    ): array {
        if (!$this->isOpenDate($date)) {
            return ['orderDate' => 'Le restaurant est fermé le lundi'];
        }

        $service = $this->findService($restaurant, $date, $hour);

        if ($service === null) {
            return [
                'orderHour' => 'L’heure sélectionnée ne correspond à aucun service du restaurant',
            ];
        }

        $reservedGuests = $this->repository->sumGuestsForService(
            $restaurant,
            $date,
            $service['start'],
            $service['end'],
            $excludedBooking
        );

        if ($reservedGuests + $guestNumber > (int) $restaurant->getMaxGuest()) {
            return ['guestNumber' => 'La capacité maximale du service est dépassée'];
        }

        return [];
    }

    public function availability(
        Restaurant $restaurant,
        DateTimeImmutable $date,
        int $guestNumber
    ): array {
        if (!$this->isOpenDate($date)) {
            return [];
        }

        $availability = [];

        foreach ($this->services($restaurant, $date) as $service) {
            $reservedGuests = $this->repository->sumGuestsForService(
                $restaurant,
                $date,
                $service['start'],
                $service['end']
            );
            $remainingCapacity = max(0, (int) $restaurant->getMaxGuest() - $reservedGuests);
            $slots = [];

            foreach ($this->generateSlots($service['open'], $service['close']) as $time) {
                $slots[] = [
                    'time' => $time,
                    'available' => $remainingCapacity >= $guestNumber,
                ];
            }

            $availability[] = [
                'name' => $service['name'],
                'open' => $service['open'],
                'close' => $service['close'],
                'reservedGuests' => $reservedGuests,
                'remainingCapacity' => $remainingCapacity,
                'slots' => $slots,
            ];
        }

        return $availability;
    }

    private function services(Restaurant $restaurant, DateTimeImmutable $date): array
    {
        return [
            $this->createService('am', $restaurant->getAmOpeningTime(), $date),
            $this->createService('pm', $restaurant->getPmOpeningTime(), $date),
        ];
    }

    private function createService(string $name, array $schedule, DateTimeImmutable $date): array
    {
        $dateValue = $date->format('Y-m-d');

        return [
            'name' => $name,
            'open' => $schedule['open'],
            'close' => $schedule['close'],
            'start' => new DateTimeImmutable($dateValue.' '.$schedule['open']),
            'end' => new DateTimeImmutable($dateValue.' '.$schedule['close']),
        ];
    }

    private function isStrictTime(string $time): bool
    {
        return preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time) === 1;
    }

    private function isQuarterHour(string $time): bool
    {
        return ((int) substr($time, 3, 2)) % 15 === 0;
    }

    private function timeToMinutes(string $time): int
    {
        return ((int) substr($time, 0, 2) * 60) + (int) substr($time, 3, 2);
    }
}
