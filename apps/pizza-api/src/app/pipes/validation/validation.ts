import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import ValidationException from '../../exception/validation/validation';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  public async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    console.log('value', value);
    const obj = plainToInstance(metadata.metatype, value);
    const errors = await validate(obj);
    console.log('errors', errors);

    if (errors.length) {
      const messages = errors.map((error) => {
        return {
          name: error.property,
          message: Object.values(error.constraints)[0],
        };
      });

      if (messages.length === 1) {
        throw new ValidationException(messages[0]);
      } else {
        throw new ValidationException(messages);
      }
    }
    return value;
  }
}
