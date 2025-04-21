import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
	projectConfig: {
		databaseUrl: process.env.DATABASE_URL,
		http: {
			storeCors: process.env.STORE_CORS!,
			adminCors: process.env.ADMIN_CORS!,
			authCors: process.env.AUTH_CORS!,
			jwtSecret: process.env.JWT_SECRET || 'supersecret',
			cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
		},
	},
	plugins: [
		{
			resolve: 'medusa-plugin-meilisearch',
			options: {
				config: {
					host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
					apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
				},
				settings: {
					products: {
						searchableAttributes: ['title', 'description', 'handle', 'tags'],
						filterableAttributes: [
							'region_id',
							'variants.calculated_price',
							'created_at',
						],
						sortableAttributes: ['variants.calculated_price', 'created_at'],
					},
				},
			},
		},
	],
})
