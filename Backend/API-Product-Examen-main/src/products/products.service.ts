import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger("ProductServises");
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, q?: string) {
    limit = Math.min(limit, 50);
    const skip = (page - 1) * limit;

    const where = q ? { name: { contains: q } } : {};

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    if (page > totalPages && total > 0) {
      this.logger.error(`La página ${page} no existe`);
      throw new NotFoundException(`La página ${page} no existe`);
    }


    this.logger.log("Los Productos fueron encontrados");
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
  
    if (!product) {
      this.logger.error(`Producto con id ${id} no encontrado`)
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    this.logger.log("Producto Encontrado");
    return product;
  }

  async create(dto: ProductDto) {
  const product = await this.prisma.product.create({ data: dto });
  if(!product){
    this.logger.error("Error al crear producto");
    throw new InternalServerErrorException('No se pudo crear el producto')
  }
  this.logger.log("Producto Creado");
  return { message: 'Producto  creado correctamente', product };
}

  async update(id: number, dto: ProductDto) {

    const product = await this.prisma.product.update({ where: { id }, data: dto })
    if (!product) {
      
      this.logger.error(`Producto con id ${id} no encontrado`);
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    this.logger.log(`Producto con id ${id} actualizado correctamente`);
    return product;
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    await this.prisma.product.delete({ where: { id } });

    return { message: `Producto con id ${id} eliminado correctamente` };
  }
}