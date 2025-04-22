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
			await this.client.getIndex(this.index)
		} catch (error) {
			if (error.code === 'index_not_found') {
				await this.client.createIndex(this.index, { primaryKey: 'id' })

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
			} else if (sortBy === 'created_at') {
				sort = ['created_at:desc']
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
					'subtitle',
					'description',
					'handle',
					'is_giftcard',
					'discountable',
					'thumbnail',
					'collection_id',
					'type_id',
					'weight',
					'length',
					'height',
					'width',
					'hs_code',
					'origin_country',
					'mid_code',
					'material',
					'created_at',
					'updated_at',
					'options',
					'tags',
					'images',
					'variants',
					'metadata',
				],
			})

			return searchResults.hits.map((product: any) => ({
				...product,
				weight: product.weight?.toString() || null,
				length: product.length?.toString() || null,
				height: product.height?.toString() || null,
				width: product.width?.toString() || null,
				type: null,
				collection: null,
				options: (product.options || []).map((option: any) => ({
					...option,
					values: (option.values || []).map((value: any) => ({
						...value,
						metadata: value.metadata || null,
						deleted_at: value.deleted_at || null,
					})),
				})),
				images: (product.images || []).map((image: any) => ({
					...image,
					metadata: image.metadata || null,
					rank: image.rank || 0,
					deleted_at: image.deleted_at || null,
				})),
				variants: (product.variants || []).map((variant: any) => ({
					...variant,
					weight: variant.weight?.toString() || null,
					length: variant.length?.toString() || null,
					height: variant.height?.toString() || null,
					width: variant.width?.toString() || null,
					options: (variant.options || []).map((option: any) => ({
						...option,
						option: {
							...option.option,
							metadata: option.option?.metadata || null,
							deleted_at: option.option?.deleted_at || null,
						},
					})),
				})),
			}))
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
