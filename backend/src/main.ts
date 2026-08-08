import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import net from 'node:net';

async function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(startPort: number): Promise<number> {
  for (let port = startPort; port < startPort + 20; port += 1) {
    if (await isPortFree(port)) {
      return port;
    }
  }
  throw new Error(`No available port found from ${startPort} to ${startPort + 19}`);
}

async function bootstrap() {
  const requestedPort = Number(process.env.PORT || process.env.npm_config_port || 3000);
  const port = (await isPortFree(requestedPort))
    ? requestedPort
    : await findAvailablePort(requestedPort + 1);

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  await app.listen(port);
  console.log(`Nest application listening on port ${port}`);
}

void bootstrap();
