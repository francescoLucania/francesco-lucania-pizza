import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export enum FileType {
  IMAGE = 'image',
}

@Injectable()
export class FileService {
  createFile(type: FileType, picture): string {
    try {
      const fileExtension = picture.originalname.split('.').pop();
      const fileName = uuidv4() + '.' + fileExtension;
      const filePath = path.resolve(__dirname, '../../', 'static', type);

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      fs.writeFileSync(path.resolve(filePath, fileName), picture.buffer);
      return type + '/' + fileName;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // removeFile(fileName: string) {}
}
