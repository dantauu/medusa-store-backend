import { loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

async function syncProducts(container: any) {
	const meilisearchService = container.resolve('meilisearchService')
	const productService = container.resolve('productService')

	try {
		const products = await productService.list(
			{},
			{
				relations: ['variants', 'images', 'tags'],
			}
		)

		await meilisearchService.addDocuments(products)
		console.log(
			`Successfully synced ${products.length} products to MeiliSearch`
		)
	} catch (error) {
		console.error('Error syncing products to MeiliSearch:', error)
		throw error
	}
}

export default async function ({ container }: { container: any }) {
	await syncProducts(container)
}
