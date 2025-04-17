import { PrismaClient } from '@prisma/client'

class PrismaService {
	private prisma_: PrismaClient

	constructor() {
		this.prisma_ = new PrismaClient()
	}

	async listProducts() {
		try {
			const products = await this.prisma_.product.findMany({
				take: 10,
				select: {
					id: true,
					title: true,
					handle: true,
					description: true,
					discountable: true,
				},
			})
			return products
		} catch (error) {
			console.error('Prisma error:', error)
			throw error
		}
	}
}

export default PrismaService
