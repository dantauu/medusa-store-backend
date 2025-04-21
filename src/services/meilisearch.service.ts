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
		this.initializeIndex()
	}

	private async initializeIndex() {
		try {
			// Проверяем существует ли индекс
			await this.client.getIndex(this.index)
		} catch (error) {
			if (error.code === 'index_not_found') {
				// Создаем индекс если его нет
				await this.client.createIndex(this.index, { primaryKey: 'id' })

				// Настраиваем поисковые атрибуты
				await this.client.index(this.index).updateSettings({
					searchableAttributes: ['title', 'description', 'handle', 'tags'],
					filterableAttributes: [
						'region_id',
						'variants.calculated_price',
						'created_at',
					],
					sortableAttributes: ['variants.calculated_price', 'created_at'],
				})
			} else {
				throw error
			}
		}
	}

	async listProducts(
		sortBy?: 'price_asc' | 'price_desc' | 'created_at',
		regionId?: string
	) {
		try {
			let sort: string[] = ['created_at:desc']
			let filter: string[] = []

			if (sortBy === 'price_asc') {
				sort = ['variants.calculated_price:asc']
			} else if (sortBy === 'price_desc') {
				sort = ['variants.calculated_price:desc']
			}

			if (regionId) {
				filter = [`region_id = ${regionId}`]
			}

			const searchResults = await this.client.index(this.index).search('', {
				sort,
				filter,
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
					'region_id',
				],
			})

			const products = searchResults.hits.map((product: any) => {
				const variants = (product.variants || []).map((variant: any) => ({
					id: variant.id,
					title: variant.title,
					inventory_quantity: variant.inventory_quantity || 0,
					calculated_price: {
						amount: variant.calculated_price || 0,
						currency_code: 'usd',
					},
				}))

				const images = (product.images || []).map((image: any) => ({
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
					region_id: product.region_id,
				}
			})

			return products
		} catch (error) {
			console.error('Meilisearch error:', error)
			throw error
		}
	}

	async addProduct(product: any) {
		try {
			const document = {
				...product,
				variants: (product.variants || []).map((variant: any) => ({
					...variant,
					calculated_price: variant.calculated_price?.amount || 0,
				})),
			}

			await this.client.index(this.index).addDocuments([document])
			return document
		} catch (error) {
			console.error('Meilisearch add error:', error)
			throw error
		}
	}

	async updateProduct(product: any) {
		try {
			const document = {
				...product,
				variants: (product.variants || []).map((variant: any) => ({
					...variant,
					calculated_price: variant.calculated_price?.amount || 0,
				})),
			}

			await this.client.index(this.index).updateDocuments([document])
			return document
		} catch (error) {
			console.error('Meilisearch update error:', error)
			throw error
		}
	}

	async deleteProduct(productId: string) {
		try {
			await this.client.index(this.index).deleteDocument(productId)
			return { id: productId }
		} catch (error) {
			console.error('Meilisearch delete error:', error)
			throw error
		}
	}
}

export default MeilisearchService
