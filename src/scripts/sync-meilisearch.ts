import { MeiliSearch } from 'meilisearch'
import { loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

async function syncProducts(container: any) {
	const productModuleService = container.resolve('productModuleService')
	const meiliClient = new MeiliSearch({
		host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
		apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
	})

	try {
		// Получаем все продукты
		const products = await productModuleService.list(
			{},
			{
				relations: ['variants', 'images', 'tags'],
			}
		)

		// Преобразуем продукты в формат для MeiliSearch
		const documents = products.map(product => ({
			id: product.id,
			title: product.title,
			handle: product.handle,
			description: product.description,
			thumbnail: product.thumbnail,
			images: product.images?.map(img => ({
				id: img.id,
				url: img.url,
			})),
			variants: product.variants?.map(variant => ({
				id: variant.id,
				title: variant.title,
				inventory_quantity: variant.inventory_quantity || 0,
				calculated_price: variant.calculated_price?.amount || 0,
			})),
			tags: product.tags?.map(tag => tag.value),
			created_at: product.created_at,
			updated_at: product.updated_at,
			region_id: product.region_id,
		}))

		// Добавляем документы в MeiliSearch
		await meiliClient.index('products').addDocuments(documents)
		console.log(
			`Successfully synced ${documents.length} products to MeiliSearch`
		)
	} catch (error) {
		console.error('Error syncing products to MeiliSearch:', error)
		throw error
	}
}

export default async function ({ container }: { container: any }) {
	await syncProducts(container)
}
