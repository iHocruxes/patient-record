import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresOption, redisClientOption } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { RecordModule } from './record/record.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...postgresOption,
      autoLoadEntities: true
    }),
    // CacheModule.register<RedisClientOptions>({
    //   isGlobal: true,
    //   ...redisClientOption
    // }),
    AuthModule,
    // RecordModule
  ],
})
export class AppModule { }
