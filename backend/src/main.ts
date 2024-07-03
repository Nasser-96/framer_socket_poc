import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import ReturnResponse from './helper/returnResponse';
import { SocketIOAdapter } from './socket/socket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        throw new BadRequestException(
          ReturnResponse({
            response: validationErrors?.map((error) => ({
              field: error?.property,
              error: Object?.values(error?.constraints)?.join(', '),
            })),
            is_successful: false,
            error_msg: '',
            success: '',
          }),
        );
      },
    }),
  );

  const socketAdapter = new SocketIOAdapter(app);
  app.useWebSocketAdapter(socketAdapter);

  await app.listen(9000);
}
bootstrap();
