<?php

namespace App\Security;

use App\Repository\UserRepository;

class ApiTokenGenerator
{
    private UserRepository $repository;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    public function generate(): string
    {
        do {
            $token = bin2hex(random_bytes(32));
        } while ($this->repository->findOneBy(['apiToken' => $token]) !== null);

        return $token;
    }
}
