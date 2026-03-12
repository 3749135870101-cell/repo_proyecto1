import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class GatoController {

   @Get('/gato')
   gato(){
    return "hola";
   }
}
