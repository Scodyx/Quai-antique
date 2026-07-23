<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260723094757 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE UNIQUE INDEX UNIQ_16DB4F89989D9B62 ON picture (slug)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_EB95123F5E237E06 ON restaurant (name)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_16DB4F89989D9B62 ON picture');
        $this->addSql('DROP INDEX UNIQ_EB95123F5E237E06 ON restaurant');
    }
}
