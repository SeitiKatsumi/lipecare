import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  app.set("trust proxy", "loopback, linklocal, uniquelocal");
  app.useBodyParser("json", { limit: "6mb" });
  const webUrl = config.get<string>("WEB_URL") ?? "http://localhost:3000";
  const allowedOrigins = new Set([webUrl, "http://localhost:3009"]);

  app.enableCors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const port = config.get<number>("PORT") ?? 4000;
  await app.listen(port);
}

void bootstrap();

