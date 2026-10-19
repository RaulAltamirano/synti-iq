import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeedsStandaloneModule } from '../seeds/seeds-standalone.module';
import { PermissionsSeed } from '../seeds/permissions.seed';
import { PermissionGroupsSeed } from '../seeds/permission-groups.seed';
import { RolesSeed } from '../seeds/roles.seed';
import { SubscriptionPlansSeed } from '../seeds/subscription-plans.seed';
import { UsersSeed } from '../seeds/users.seed';

async function runSeeds() {
  const logger = new Logger('SeedRunner');
  const seedType = process.argv[2] || 'all';

  logger.log(`🌱 Starting seed process for: ${seedType}`);

  // Create NestJS application context
  const app = await NestFactory.createApplicationContext(SeedsStandaloneModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    // Get seed services from the module
    const permissionsSeed = app.get(PermissionsSeed);
    const permissionGroupsSeed = app.get(PermissionGroupsSeed);
    const rolesSeed = app.get(RolesSeed);
    const subscriptionPlansSeed = app.get(SubscriptionPlansSeed);
    const usersSeed = app.get(UsersSeed);

    switch (seedType.toLowerCase()) {
      case 'all':
        logger.log('📦 Running all seeds in order...');
        logger.log('1️⃣ Seeding permissions...');
        await permissionsSeed.seed();
        logger.log('✅ Permissions seeded successfully');

        logger.log('2️⃣ Seeding permission groups...');
        await permissionGroupsSeed.seed();
        logger.log('✅ Permission groups seeded successfully');

        logger.log('3️⃣ Seeding roles...');
        await rolesSeed.seed();
        logger.log('✅ Roles seeded successfully');

        logger.log('4️⃣ Seeding users...');
        await usersSeed.seed();
        logger.log('✅ Users seeded successfully');

        logger.log('5️⃣ Seeding subscription plans...');
        await subscriptionPlansSeed.seed();
        logger.log('✅ Subscription plans seeded successfully');
        break;

      case 'permissions':
        logger.log('📦 Seeding permissions...');
        await permissionsSeed.seed();
        logger.log('✅ Permissions seeded successfully');
        break;

      case 'groups':
        logger.log('📦 Seeding permission groups...');
        await permissionGroupsSeed.seed();
        logger.log('✅ Permission groups seeded successfully');
        break;

      case 'roles':
        logger.log('📦 Seeding roles...');
        await rolesSeed.seed();
        logger.log('✅ Roles seeded successfully');
        break;

      case 'users':
        logger.log('📦 Seeding users...');
        await usersSeed.seed();
        logger.log('✅ Users seeded successfully');
        break;

      case 'subscription_plans':
        logger.log('📦 Seeding subscription plans...');
        await subscriptionPlansSeed.seed();
        logger.log('✅ Subscription plans seeded successfully');
        break;

      default:
        logger.error(`❌ Unknown seed type: ${seedType}`);
        logger.log(
          'Available seed types: all, permissions, groups, roles, users, subscription_plans',
        );
        process.exit(1);
    }

    logger.log(`🎉 Seed process completed successfully for: ${seedType}`);
  } catch (error) {
    logger.error(`❌ Error during seed process: ${error.message}`, error.stack);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeeds();
