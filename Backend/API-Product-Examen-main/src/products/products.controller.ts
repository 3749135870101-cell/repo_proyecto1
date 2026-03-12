import { Body, Controller, Delete, Get, HttpCode, Logger, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
import { validateMetaDataPipe } from './pipes/validate-meta-data/validate-meta-data.pipe';

@Controller('api/products')
export class ProductsController {
    private readonly logger = new Logger("ProductsController"); 

    constructor(private productService: ProductsService) {}

    @Get()
    @HttpCode(200)
    getAllProducts(
        @Query(validateMetaDataPipe) query: { page: number; limit: number; q: string },
    ) {
        this.logger.log(`GET /products - page:${query.page} limit:${query.limit} q:${query.q}`);
        return this.productService.findAll(query.page, query.limit, query.q);
    }

    @Get('/:id')
    @HttpCode(200)
    getProduct(@Param('id', ParseIntPipe) id: number) {
        this.logger.log(`GET /products/${id}`);
        return this.productService.findOne(id);
    }

    @Post()
    @HttpCode(201)
    createProduct(@Body() dto: ProductDto) {
        this.logger.log(`POST /products - body: ${JSON.stringify(dto)}`);
        return this.productService.create(dto);
    }

    @Put('/:id')
    @HttpCode(200)
    updateProduct(
        @Body() dto: ProductDto,
        @Param('id', ParseIntPipe) id: number,
    ) {
        this.logger.log(`PUT /products/${id} - body: ${JSON.stringify(dto)}`);
        return this.productService.update(id, dto);
    }

    @Delete('/:id')
    @HttpCode(200)
    deleteProduct(@Param('id', ParseIntPipe) id: number) {
        this.logger.log(`DELETE /products/${id}`);
        return this.productService.remove(id);
    }
}
