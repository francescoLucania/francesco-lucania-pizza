/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import cookieParser from 'cookie-parser';

/**
 * Находит корень проекта, поднимаясь вверх от текущей директории
 * Ищет nx.json в корне проекта (не в dist)
 */
function findProjectRoot(): string {
  let currentDir = __dirname;

  // Если мы в dist, поднимаемся выше dist
  if (currentDir.includes(path.sep + 'dist' + path.sep)) {
    while (currentDir.includes(path.sep + 'dist' + path.sep)) {
      currentDir = path.dirname(currentDir);
    }
    // Теперь ищем nx.json выше dist
    while (currentDir !== path.dirname(currentDir)) {
      const nxJsonPath = path.join(currentDir, 'nx.json');
      if (fs.existsSync(nxJsonPath)) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
  } else {
    // В dev-режиме ищем nx.json
    while (currentDir !== path.dirname(currentDir)) {
      const nxJsonPath = path.join(currentDir, 'nx.json');
      if (fs.existsSync(nxJsonPath)) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
  }

  return process.cwd();
}

async function bootstrap() {
  // Создаем папку static в корне проекта при старте
  const projectRoot = findProjectRoot();
  const staticPath = path.join(projectRoot, 'static');
  const staticImagePath = path.join(staticPath, 'image');
  const staticImageUserAvatarPath = path.join(
    staticImagePath,
    'user',
    'avatar',
  );

  if (!fs.existsSync(staticPath)) {
    fs.mkdirSync(staticPath, { recursive: true });
    Logger.log(`📁 Created static directory: ${staticPath}`);
  }
  if (!fs.existsSync(staticImagePath)) {
    fs.mkdirSync(staticImagePath, { recursive: true });
    Logger.log(`📁 Created static/image directory: ${staticImagePath}`);
  }
  if (!fs.existsSync(staticImageUserAvatarPath)) {
    fs.mkdirSync(staticImageUserAvatarPath, { recursive: true });
    Logger.log(
      `📁 Created static/image/user/avatar directory: ${staticImageUserAvatarPath}`,
    );
  }

  const app = await NestFactory.create(AppModule);

  // Настраиваем cookie parser для работы с httpOnly cookies
  app.use(cookieParser());

  const configService = app.get(ConfigService);
  const mode = configService.get<string>('MODE');

  // В DEV режиме разрешаем все источники для CORS
  if (mode === 'DEV') {
    app.enableCors({
      origin: true,
      credentials: true,
    });
    Logger.log('🔓 CORS enabled for all origins (DEV mode)');
  }

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
