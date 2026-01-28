import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export enum FileType {
  IMAGE = 'image',
}

@Injectable()
export class FileService {
  /**
   * Находит корень проекта, поднимаясь вверх от текущей директории
   * Ищет nx.json в корне проекта (не в dist)
   */
  private findProjectRoot(): string {
    let currentDir = __dirname;

    // В dev: __dirname = apps/pizza-api/src/app/modules/user/file
    // В prod: __dirname = dist/apps/pizza-api/src/app/modules/user/file
    // Нужно подняться до корня проекта (где находится nx.json)

    // Если мы в dist, сразу поднимаемся выше dist
    if (currentDir.includes(path.sep + 'dist' + path.sep)) {
      // Поднимаемся до корня dist, затем выше
      while (currentDir.includes(path.sep + 'dist' + path.sep)) {
        currentDir = path.dirname(currentDir);
      }
      // Теперь мы выше dist, поднимаемся до корня проекта
      while (currentDir !== path.dirname(currentDir)) {
        const nxJsonPath = path.join(currentDir, 'nx.json');
        if (fs.existsSync(nxJsonPath)) {
          return currentDir;
        }
        currentDir = path.dirname(currentDir);
      }
    } else {
      // В dev-режиме просто ищем nx.json
      while (currentDir !== path.dirname(currentDir)) {
        const nxJsonPath = path.join(currentDir, 'nx.json');
        if (fs.existsSync(nxJsonPath)) {
          return currentDir;
        }
        currentDir = path.dirname(currentDir);
      }
    }

    // Если не нашли, возвращаем process.cwd() как fallback
    return process.cwd();
  }

  public createFile(type: FileType, picture, subPath?: string): string {
    try {
      const fileExtension = picture.originalname.split('.').pop();
      const fileName = uuidv4() + '.' + fileExtension;
      // Всегда сохраняем в корневой static/<type> проекта, например {project_root}/static/image
      const projectRoot = this.findProjectRoot();
      // Если указан subPath, добавляем его к пути (например, 'user/avatar')
      const fullPath = subPath
        ? path.resolve(projectRoot, 'static', type, subPath)
        : path.resolve(projectRoot, 'static', type);
      const staticPath = fullPath;

      if (!fs.existsSync(staticPath)) {
        fs.mkdirSync(staticPath, { recursive: true });
      }
      fs.writeFileSync(path.resolve(staticPath, fileName), picture.buffer);
      // Возвращаем путь относительно корня static с начальным слэшем
      // Например: '/image/xxx.jpg' или '/image/user/avatar/xxx.jpg'
      const relativePath = subPath
        ? '/' + type + '/' + subPath + '/' + fileName
        : '/' + type + '/' + fileName;
      return relativePath;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // removeFile(fileName: string) {}
}
