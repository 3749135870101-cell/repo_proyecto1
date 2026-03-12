import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class validateMetaDataPipe implements PipeTransform {
  transform(value: any) {
    const page = value.page ? parseInt(value.page) : 1;      
    const limit = value.limit ? parseInt(value.limit) : 10;  
    const q = value.q ?? undefined;

    if (isNaN(page) || page < 1) {
      throw new BadRequestException('page debe ser un número mayor a 0');
    }

    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new BadRequestException('limit debe ser un número entre 1 y 50');
    }

    return { page, limit, q };
  }
}