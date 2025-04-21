import { MeiliSearch } from 'meilisearch'
import { loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

async function initMeiliSearch() {
	const client = new MeiliSearch({
		host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
		apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
	})

	try {
		// Проверяем существование индекса
		await client.getIndex('products')
		console.log('Index "products" already exists')
	} catch (error) {
		if (error.code === 'index_not_found') {
			// Создаем индекс, если он не существует
			await client.createIndex('products', { primaryKey: 'id' })
			console.log('Created index "products"')

			// Настраиваем параметры индекса
			await client.index('products').updateSettings({
				searchableAttributes: ['title', 'description', 'handle', 'tags'],
				filterableAttributes: [
					'region_id',
					'variants.calculated_price',
					'created_at',
				],
				sortableAttributes: ['variants.calculated_price', 'created_at'],
			})
			console.log('Updated settings for index "products"')
		} else {
			throw error
		}
	}
}

initMeiliSearch()
	.then(() => {
		console.log('MeiliSearch initialization completed')
		process.exit(0)
	})
	.catch(error => {
		console.error('Error initializing MeiliSearch:', error)
		process.exit(1)
	})
