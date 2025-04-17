import { Router, Request, Response } from 'express'
import PrismaService from '../services/prisma.service'

export default function (router: Router) {
	router.get('/store/prisma-products', async (req: Request, res: Response) => {
		const prismaService = new PrismaService()
		try {
			const products = await prismaService.listProducts()
			res.json({ products })
		} catch (error) {
			res.status(500).json({
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	})
}
