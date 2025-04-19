const { MeiliSearch } = require('meilisearch')

class MeilisearchService {
	private client: any
	private index: string

	constructor() {
		this.client = new MeiliSearch({
			host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
			apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
		})
		this.index = 'products'
	}

	async listProducts(sortBy?: 'price_asc' | 'price_desc' | 'created_at') {
		try {
			let sort = ['created_at:desc']

			if (sortBy === 'price_asc') {
				sort = ['variants.calculated_price:asc']
			} else if (sortBy === 'price_desc') {
				sort = ['variants.calculated_price:desc']
			}

			const searchResults = await this.client.index(this.index).search('', {
				sort,
				limit: 100,
				attributesToRetrieve: [
					'id',
					'title',
					'handle',
					'description',
					'thumbnail',
					'images',
					'variants',
					'metadata',
					'tags',
					'created_at',
					'updated_at',
				],
			})

			const products = searchResults.hits.map((product: any) => {
				const variants = product.variants.map((variant: any) => ({
					id: variant.id,
					title: variant.title,
					inventory_quantity: variant.inventory_quantity || 0,
					calculated_price: {
						amount: variant.calculated_price || 0,
						currency_code: 'usd',
					},
				}))

				const images = product.images.map((image: any) => ({
					id: image.id,
					url: image.url,
				}))

				return {
					id: product.id,
					title: product.title,
					handle: product.handle,
					description: product.description,
					thumbnail: product.thumbnail,
					images,
					variants,
					metadata: product.metadata || {},
					tags: product.tags || [],
					created_at: product.created_at,
					updated_at: product.updated_at,
				}
			})

			return products
		} catch (error) {
			console.error('Meilisearch error:', error)
			throw error
		}
	}

	async updateProduct(product: any) {
		try {
			await this.client!.index(this.index).addDocuments([
				{
					...product,
					variants: product.variants.map((variant: any) => ({
						...variant,
						calculated_price: variant.calculated_price?.amount || 0,
					})),
				},
			])
		} catch (error) {
			console.error('Meilisearch update error:', error)
			throw error
		}
	}

	async deleteProduct(productId: string) {
		try {
			await this.client!.index(this.index).deleteDocument(productId)
		} catch (error) {
			console.error('Meilisearch delete error:', error)
			throw error
		}
	}
}

export default MeilisearchService
