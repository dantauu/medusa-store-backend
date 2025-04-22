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
			resolve: '@rokmohar/medusa-plugin-meilisearch',
			options: {
				config: {
					host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
					apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
				},
				settings: {
					products: {
						type: 'products',
						enabled: true,
						fields: [
							'id',
							'title',
							'description',
							'handle',
							'variant_sku',
							'thumbnail',
							'region_id',
						],
						indexSettings: {
							searchableAttributes: ['title', 'description', 'variant_sku'],
							displayedAttributes: [
								'id',
								'handle',
								'title',
								'description',
								'variant_sku',
								'thumbnail',
								'region_id',
							],
							filterableAttributes: ['id', 'handle', 'region_id', 'price'],
							sortableAttributes: ['title', 'created_at'],
						},
						primaryKey: 'id',
					},
				},
			},
		},
	],
})
