import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import ValidationException from '../../exception/validation/validation';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  public async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    // Если тип не указан или это примитив/обычный Object (например, multipart/form-data),
    // валидацию не запускаем
    const metatype = metadata.metatype as any;
    const isPrimitive =
      !metatype || [String, Boolean, Number, Array, Object].includes(metatype);

    if (isPrimitive) {
      return value;
    }

    const obj = plainToInstance(metatype, value);
    const errors = await validate(obj, {
      forbidUnknownValues: false,
    });

    if (errors.length) {
      const messages = errors.map((error) => ({
        name: error.property,
        message: Object.values(error.constraints)[0],
      }));

      if (messages.length === 1) {
        throw new ValidationException(messages[0]);
      } else {
        throw new ValidationException(messages);
      }
    }
    return value;
  }
}
