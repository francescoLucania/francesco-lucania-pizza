import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import {UserModule} from "./modules/user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '..', '..', '.env'),
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL')?.replace(/^"|"$/g, '') || '';
        const databaseLogin = configService.get<string>('DATABASE_LOGIN')?.replace(/^"|"$/g, '') || '';
        const databasePass = configService.get<string>('DATABASE_PASS')?.replace(/^"|"$/g, '') || '';

        // Формируем connection string с авторизацией
        let connectionString = databaseUrl;
        if (databaseLogin && databasePass && !databaseUrl.includes('@')) {
          const host = databaseUrl.replace('mongodb://', '').replace(/\/.*$/, '');
          connectionString = `mongodb://${databaseLogin}:${encodeURIComponent(databasePass)}@${host}`;
        }

        return {
          uri: connectionString,
        };
      },
      inject: [ConfigService],
    }),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
