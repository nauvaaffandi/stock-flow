import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { readFileSync } from 'fs'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

const apiDescription = readFileSync(
	join(process.cwd(), 'docs', 'bisnis-flow.md'),
	'utf-8',
)

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)

	app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))

	const config = new DocumentBuilder()
		.setTitle('Fund Manager API')
		.setDescription('Api Documentation')
		.setVersion('1.0')
		.addServer('http://localhost:3000/api')
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('docs', app, document)
    
    app.setBaseViewsDir(join(process.cwd(), 'src/views'))
    app.setViewEngine('pug')
    
	app.use(cors())
	app.use(express.json())
	app.use(cookieParser())
	app.setGlobalPrefix('api')

	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
