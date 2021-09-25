import { SwaggerConfig } from '@ioc:Adonis/Addons/Swagger'

export default {
	uiEnabled: true, //disable or enable swaggerUi route
	uiUrl: '/docs', // url path to swaggerUI
	specEnabled: true, //disable or enable swagger.json route
	specUrl: '/swagger.json',

	middleware: [], // middlewares array, for protect your swagger docs and spec endpoints

	options: {
		definition: {
			openapi: '3.0.0',
			info: {
				title: 'Main Bersama API',
				version: '1.0.0',
				description: 'Documentation of Main Bersama API'
			},
			tags: [
				{
					name: 'Auth',
					description: 'Authentication and OTP Verification'
				},
				{
					name: 'Booking',
					description: 'CRD and Join or Unjoin Booking (User Only)'
				},
				{
					name: 'Field',
					description: 'CRUD Field (Owner Only)'
				},
				{
					name: 'Venue',
					description: 'CRU Venue (Owner Only)'
				}
			],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: 'http',
						scheme: 'bearer'
					}
				}
			}
		},

		apis: [
			'app/**/*.ts',
			'docs/swagger/**/*.yml',
			'start/routes.ts'
		],
		basePath: '/api/v1'
	},
	mode: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'RUNTIME',
	specFilePath: 'docs/swagger.json'
} as SwaggerConfig
