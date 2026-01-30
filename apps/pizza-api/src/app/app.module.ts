import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import * as path from 'path';
import * as fs from 'fs';
import { UserModule } from './modules/user/user.module';
import { MenuModule } from './modules/menu/menu.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '..', '..', '.env'),
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      // Всегда используем корень проекта для раздачи статики
      // Находим корень проекта, поднимаясь вверх от __dirname до nx.json (не в dist)
      rootPath: (() => {
        let currentDir = __dirname;

        // Если мы в dist, поднимаемся выше dist
        if (currentDir.includes(path.sep + 'dist' + path.sep)) {
          while (currentDir.includes(path.sep + 'dist' + path.sep)) {
            currentDir = path.dirname(currentDir);
          }
          // Теперь ищем nx.json выше dist
          while (currentDir !== path.dirname(currentDir)) {
            const nxJsonPath = join(currentDir, 'nx.json');
            if (fs.existsSync(nxJsonPath)) {
              return join(currentDir, 'static');
            }
            currentDir = path.dirname(currentDir);
          }
        } else {
          // В dev-режиме ищем nx.json
          while (currentDir !== path.dirname(currentDir)) {
            const nxJsonPath = join(currentDir, 'nx.json');
            if (fs.existsSync(nxJsonPath)) {
              return join(currentDir, 'static');
            }
            currentDir = path.dirname(currentDir);
          }
        }

        return join(process.cwd(), 'static');
      })(),
      serveRoot: '/static',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl =
          configService.get<string>('DATABASE_URL')?.replace(/^"|"$/g, '') ||
          '';
        const databaseLogin =
          configService.get<string>('DATABASE_LOGIN')?.replace(/^"|"$/g, '') ||
          '';
        const databasePass =
          configService.get<string>('DATABASE_PASS')?.replace(/^"|"$/g, '') ||
          '';

        // Формируем connection string с авторизацией
        let connectionString = databaseUrl;
        if (databaseLogin && databasePass && !databaseUrl.includes('@')) {
          const host = databaseUrl
            .replace('mongodb://', '')
            .replace(/\/.*$/, '');
          connectionString = `mongodb://${databaseLogin}:${encodeURIComponent(databasePass)}@${host}`;
        }

        return {
          uri: connectionString,
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    MenuModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
