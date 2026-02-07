"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const express = require("express");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use('/subscriptions/webhook', express.raw({ type: 'application/json' }));
    app.use((req, res, next) => {
        if (req.method === 'GET') {
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Pragma', 'no-cache');
        }
        next();
    });
    app.enableCors({
        origin: process.env.APP_URL ?? 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validationError: { target: false, value: false },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Budget SaaS API')
        .setDescription('API do zarządzania budżetem osobistym')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    await app.listen(port);
    console.log(`API uruchomione na porcie ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map