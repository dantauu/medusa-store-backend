import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import MeilisearchService from '../../../services/meilisearch.service'

export async function GET(req: MedusaRequest, res: MedusaResponse) {
	const meilisearchService = new MeilisearchService()
	try {
		const { order, limit = '12', offset = '0', region_id } = req.query

		if (!region_id) {
			return res.status(400).json({
				error: 'Region ID is required',
			})
		}

		let sortBy: 'price_asc' | 'price_desc' | 'created_at' | undefined
		if (order === 'price_asc') {
			sortBy = 'price_asc'
		} else if (order === 'price_desc') {
			sortBy = 'price_desc'
		} else if (order === 'created_at') {
			sortBy = 'created_at'
		}

		const products = await meilisearchService.listProducts(sortBy)

		// Применяем пагинацию
		const parsedLimit = parseInt(limit as string, 10)
		const parsedOffset = parseInt(offset as string, 10)
		const paginatedProducts = products.slice(
			parsedOffset,
			parsedOffset + parsedLimit
		)

		res.json({
			products: paginatedProducts,
			count: products.length,
		})
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}
