// prisma.service.ts
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

class PrismaService {
	private prisma_: PrismaClient

	constructor() {
		this.prisma_ = new PrismaClient()
	}

	async listProducts(minPrice?: number, maxPrice?: number) {
		try {
			const where: any = {}

			if (minPrice !== undefined || maxPrice !== undefined) {
				where.product_variant = {
					some: {
						product_variant_price_set: {
							some: {
								price_set: {
									price: {
										some: {
											amount: {
												...(minPrice && { gte: new Decimal(minPrice) }),
												...(maxPrice && { lte: new Decimal(maxPrice) }),
											},
										},
									},
								},
							},
						},
					},
				}
			}

			const products = await this.prisma_.product.findMany({
				where,
				include: {
					product_variant: {
						include: {
							product_variant_price_set: {
								include: {
									price_set: {
										include: {
											price: {
												orderBy: {
													amount: 'asc',
												},
												take: 1,
											},
										},
									},
								},
							},
						},
					},
					images: true,
				},
				take: 10,
			})

			return products.map(product => ({
				...product,
				price: this.getCheapestPrice(product),
			}))
		} catch (error) {
			console.error('Prisma error:', error)
			throw error
		}
	}

	private getCheapestPrice(product: any) {
		if (!product.product_variant?.length) return null

		const prices = product.product_variant
			.flatMap(
				(v: any) =>
					v.product_variant_price_set?.[0]?.price_set?.price?.[0]?.amount
			)
			.filter(Boolean)
			.map((p: Decimal) => p.toNumber())

		return prices.length ? Math.min(...prices) : null
	}
}

export default PrismaService
