import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresOption } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { RecordModule } from './record/record.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...postgresOption,
      autoLoadEntities: true
    }),
    AuthModule,
    RecordModule
  ],
})
export class AppModule { }
