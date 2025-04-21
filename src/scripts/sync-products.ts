import axios from 'axios'
import MeilisearchService from '../services/meilisearch.service'

const MEDUSA_BACKEND_URL =
	process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const ADMIN_API_KEY = process.env.MEDUSA_ADMIN_API_KEY

async function syncProducts() {
	const meilisearchService = new MeilisearchService()

	try {
		// Получаем все продукты через API Medusa
		const response = await axios.get(`${MEDUSA_BACKEND_URL}/admin/products`, {
			headers: {
				Authorization: `Bearer ${ADMIN_API_KEY}`,
			},
			params: {
				limit: 100,
				offset: 0,
				expand: 'variants,images,tags',
			},
		})

		const products = response.data.products
		console.log(`Found ${products.length} products in Medusa`)

		// Синхронизируем каждый продукт в Meilisearch
		for (const product of products) {
			try {
				await meilisearchService.addProduct({
					id: product.id,
					title: product.title,
					handle: product.handle,
					description: product.description,
					thumbnail: product.thumbnail,
					images: product.images,
					variants: product.variants,
					metadata: product.metadata,
					tags: product.tags,
					created_at: product.created_at,
					updated_at: product.updated_at,
					region_id: product.region_id,
				})
				console.log(`Synced product ${product.id} to Meilisearch`)
			} catch (error) {
				console.error(`Error syncing product ${product.id}:`, error)
			}
		}

		console.log('Sync completed successfully')
	} catch (error) {
		console.error('Error during sync:', error)
	}
}

// Запускаем синхронизацию
syncProducts()
