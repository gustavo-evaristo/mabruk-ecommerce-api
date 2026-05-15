import { Injectable, Logger } from '@nestjs/common';
import { IAdminRepository } from 'src/domain/repositories/admin.repository';
import { AdminEntity } from 'src/domain/entities/admin.entity';

/**
 * Garante que existe pelo menos um admin OWNER no banco.
 * Executado no boot do app via OnModuleInit do AdminAuthModule.
 *
 * Lê credenciais do .env (SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD/SEED_ADMIN_NAME).
 * Se já houver algum OWNER, no-op.
 */
@Injectable()
export class EnsureOwnerSeedUseCase {
  private readonly logger = new Logger(EnsureOwnerSeedUseCase.name);

  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<void> {
    const count = await this.adminRepository.countOwners();
    if (count > 0) {
      this.logger.log(`Já existem ${count} admin(s) OWNER cadastrado(s) — seed pulado.`);
      return;
    }

    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const name = process.env.SEED_ADMIN_NAME ?? 'Owner';

    if (!email || !password) {
      this.logger.warn(
        'Nenhum admin cadastrado e SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD não definidos. Painel B2B ficará inacessível até criar um admin manualmente.',
      );
      return;
    }

    try {
      const admin = new AdminEntity({ name, email, password, role: 'OWNER' });
      await this.adminRepository.create(admin);
      this.logger.log(`Admin OWNER seed criado: ${email}`);
    } catch (err) {
      this.logger.error(`Falha ao criar admin seed: ${err}`);
    }
  }
}
