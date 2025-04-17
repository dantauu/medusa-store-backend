import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import PrismaService from '../../../services/prisma.service'

export async function GET(req: MedusaRequest, res: MedusaResponse) {
	const prismaService = new PrismaService()
	try {
		const products = await prismaService.listProducts()
		res.json({ products })
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}
