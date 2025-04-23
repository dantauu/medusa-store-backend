import { PrismaClient } from "@prisma/client"

class PrismaService {
  private prisma_: PrismaClient

  constructor() {
    this.prisma_ = new PrismaClient()
  }

  async listProducts(sortBy?: "price_asc" | "price_desc" | "created_at") {
    try {
      let orderClause = "ORDER BY p.created_at DESC"

      if (sortBy === "price_asc") {
        orderClause = "ORDER BY min_price ASC"
      } else if (sortBy === "price_desc") {
        orderClause = "ORDER BY min_price DESC"
      }

      const query = `
                SELECT 
                    p.*,
                    MIN(pr.amount) as min_price
                FROM product p
                LEFT JOIN product_variant pv ON p.id = pv.product_id
                LEFT JOIN product_variant_price_set pvps ON pv.id = pvps.variant_id
                LEFT JOIN price_set ps ON pvps.price_set_id = ps.id
                LEFT JOIN price pr ON ps.id = pr.price_set_id
                GROUP BY p.id
                ${orderClause}
                LIMIT 10
            `
      const products = await this.prisma_.$queryRawUnsafe(query)

      return products
    } catch (error) {
      console.error("Prisma error:", error)
      throw error
    }
  }
}

export default PrismaService
