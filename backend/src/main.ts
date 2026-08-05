import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT || process.env.npm_config_port || 3000);
  await app.listen(port);
}
bootstrap();
