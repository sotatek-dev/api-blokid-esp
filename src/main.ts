import { VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { corsOptions } from 'server-config/cors';
import { ServerConfig } from 'server-config/index';
import { AppModule, AppService } from 'src/app';
import { ServerLogger } from 'src/core/logger';
import { HttpExceptionFilter } from 'src/exceptions/filters';
import { TimeoutInterceptor } from 'src/interceptors';
import { PayloadValidationPipe } from 'src/pipes';

/**
 * Note:
 * 1. Be careful with useGlobalFilters(), the filters order is not correct base on nestjs doc, but it seems to work
 **/
(async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapter = app.get(HttpAdapterHost);
  const { APP_VERSION, APP_NAME, SERVER_PORT, SWAGGER_ENDPOINT, API_PREFIX } =
    ServerConfig.get();

  // security
  app.enableCors(corsOptions);

  // global resources
  app.useGlobalPipes(new PayloadValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalInterceptors(new TimeoutInterceptor());

  // versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // swagger documentation
  const appService = app.get(AppService);
  await appService.injectCustomMetadataToSwaggerEndpoints();
  const config = new DocumentBuilder()
    .setTitle(`${APP_NAME} Apis Documentation`)
    .setVersion(APP_VERSION)
    .addBearerAuth()
    .setDescription(
      `The API description</br>
      **Small note:** The ResponseDto may return more fields than necessary, but it will always be accurate with the fields declared in Swagger.</br>
      **Number of endpoints:** ${appService.endpointCount}
      `,
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_ENDPOINT, app, document, {
    explorer: true,
    customSiteTitle: APP_NAME,
    swaggerOptions: { initOAuth: { appName: APP_NAME }, persistAuthorization: true },
  });

  // start server
  await app.listen(SERVER_PORT);
  ServerLogger.info({
    context: `NestApplication.main`,
    message: `Application is ready. View Swagger at http://localhost:${SERVER_PORT}/${SWAGGER_ENDPOINT}`,
  });
})();
