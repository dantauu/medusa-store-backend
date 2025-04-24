import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import MeilisearchService from "../../../services/meilisearch.service"
import getProducts from "../../../scripts/products"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const meilisearchService = new MeilisearchService()
  try {
    const productsWithMin = await getProducts({
      container: req.scope,
      args: [],
    })
    const minPriceMap = new Map<string, number>(
      productsWithMin.map((p: any) => [p.id, p.minPrice])
    )
    const {
      order,
      sortBy: sb,
      limit = "12",
      offset = "0",
      region_id,
    } = req.query

    const rawSort = (order as string) || (sb as string)
    let sortBy: "price_asc" | "price_desc" | "created_at" | undefined
    if (rawSort === "price_asc") {
      sortBy = "price_asc"
    } else if (rawSort === "price_desc") {
      sortBy = "price_desc"
    } else if (rawSort === "created_at") {
      sortBy = "created_at"
    }

    let products = await meilisearchService.listProducts(
      sortBy,
      region_id as string | undefined
    )
    // Здесь мы добавляем minPrice к каждому продукту
    products = products.map((p: any) => ({
      ...p,
      minPrice: minPriceMap.get(p.id) ?? null,
    }))

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
    console.error("Error in GET /store/meilisearch-products:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const meilisearchService = new MeilisearchService()
  try {
    const product = req.body
    const result = await meilisearchService.addProduct(product)
    res.json(result)
  } catch (error) {
    console.error("Error in POST /store/meilisearch-products:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const meilisearchService = new MeilisearchService()
  try {
    const product = req.body
    const result = await meilisearchService.updateProduct(product)
    res.json(result)
  } catch (error) {
    console.error("Error in PUT /store/meilisearch-products:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const meilisearchService = new MeilisearchService()
  try {
    const { product_id } = req.query
    if (!product_id) {
      return res.status(400).json({
        error: "Product ID is required",
      })
    }
    const result = await meilisearchService.deleteProduct(product_id as string)
    res.json(result)
  } catch (error) {
    console.error("Error in DELETE /store/meilisearch-products:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
