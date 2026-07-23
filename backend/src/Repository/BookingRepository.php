<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\Restaurant;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Booking>
 */
class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    public function sumGuestsForService(
        Restaurant $restaurant,
        DateTimeImmutable $date,
        DateTimeImmutable $serviceStart,
        DateTimeImmutable $serviceEnd,
        ?Booking $excludedBooking = null
    ): int {
        $queryBuilder = $this->createQueryBuilder('booking')
            ->select('COALESCE(SUM(booking.guestNumber), 0)')
            ->andWhere('booking.restaurant = :restaurant')
            ->andWhere('booking.orderDate = :date')
            ->andWhere('booking.orderHour BETWEEN :serviceStart AND :serviceEnd')
            ->setParameter('restaurant', $restaurant)
            ->setParameter('date', $date)
            ->setParameter('serviceStart', $serviceStart)
            ->setParameter('serviceEnd', $serviceEnd);

        if ($excludedBooking !== null) {
            $queryBuilder
                ->andWhere('booking != :excludedBooking')
                ->setParameter('excludedBooking', $excludedBooking);
        }

        return (int) $queryBuilder->getQuery()->getSingleScalarResult();
    }

    public function findForUserAndDate(?User $user, ?DateTimeImmutable $date): array
    {
        $queryBuilder = $this->createQueryBuilder('booking')
            ->orderBy('booking.orderDate', 'ASC')
            ->addOrderBy('booking.orderHour', 'ASC');

        if ($user !== null) {
            $queryBuilder
                ->andWhere('booking.user = :user')
                ->setParameter('user', $user);
        }

        if ($date !== null) {
            $queryBuilder
                ->andWhere('booking.orderDate = :date')
                ->setParameter('date', $date);
        }

        return $queryBuilder->getQuery()->getResult();
    }
}
