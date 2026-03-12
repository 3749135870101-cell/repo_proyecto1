import { IsString, IsNotEmpty, IsNumber, MinLength, Min, IsInt, IsOptional} from 'class-validator';

export class ProductDto {
    @IsNotEmpty()
    @MinLength(2)
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price!: number;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    stock!: number;

}