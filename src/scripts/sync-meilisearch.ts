import { MedusaContainer } from "@medusajs/medusa"
import { MeiliSearch } from "meilisearch"

interface Env {
  MEILISEARCH_HOST?: string
  MEILISEARCH_API_KEY?: string
}

interface ProductModuleService {
  list: (selector: any, config: any) => Promise<any[]>
}

async function syncProducts(container: MedusaContainer) {
  const env = process.env
  const client = new MeiliSearch({
    host: env.MEILISEARCH_HOST || "http://localhost:7700",
    apiKey: env.MEILISEARCH_API_KEY || "masterKey",
  })

  try {
    const productService = container.resolve(
      "productService"
    ) as ProductModuleService
    const products = await productService.list(
      {},
      {
        relations: [
          "variants",
          "variants.options",
          "variants.options.option",
          "options",
          "options.values",
          "images",
          "tags",
          "type",
          "collection",
        ],
      }
    )

    const documents = products.map((product) => ({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      description: product.description,
      handle: product.handle,
      is_giftcard: product.is_giftcard,
      discountable: product.discountable,
      thumbnail: product.thumbnail,
      collection_id: product.collection_id,
      type_id: product.type_id,
      weight: product.weight?.toString(),
      length: product.length?.toString(),
      height: product.height?.toString(),
      width: product.width?.toString(),
      hs_code: product.hs_code,
      origin_country: product.origin_country,
      mid_code: product.mid_code,
      material: product.material,
      created_at: product.created_at,
      updated_at: product.updated_at,
      options: product.options?.map((option) => ({
        id: option.id,
        title: option.title,
        metadata: option.metadata,
        product_id: option.product_id,
        created_at: option.created_at,
        updated_at: option.updated_at,
        deleted_at: option.deleted_at,
        values: option.values?.map((value) => ({
          id: value.id,
          value: value.value,
          metadata: value.metadata,
          option_id: value.option_id,
          created_at: value.created_at,
          updated_at: value.updated_at,
          deleted_at: value.deleted_at,
        })),
      })),
      tags: product.tags?.map((tag) => tag.value),
      images: product.images?.map((image) => ({
        id: image.id,
        url: image.url,
        metadata: image.metadata,
        rank: image.rank,
        product_id: image.product_id,
        created_at: image.created_at,
        updated_at: image.updated_at,
        deleted_at: image.deleted_at,
      })),
      variants: product.variants?.map((variant) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        ean: variant.ean,
        upc: variant.upc,
        allow_backorder: variant.allow_backorder,
        manage_inventory: variant.manage_inventory,
        hs_code: variant.hs_code,
        origin_country: variant.origin_country,
        mid_code: variant.mid_code,
        material: variant.material,
        weight: variant.weight?.toString(),
        length: variant.length?.toString(),
        height: variant.height?.toString(),
        width: variant.width?.toString(),
        metadata: variant.metadata,
        variant_rank: variant.variant_rank,
        product_id: variant.product_id,
        created_at: variant.created_at,
        updated_at: variant.updated_at,
        deleted_at: variant.deleted_at,
        calculated_price: variant.calculated_price?.amount || 0,
        inventory_quantity: variant.inventory_quantity || 0,
        options: variant.options?.map((option) => ({
          id: option.id,
          value: option.value,
          metadata: option.metadata,
          option_id: option.option_id,
          option: {
            id: option.option.id,
            title: option.option.title,
            metadata: option.option.metadata,
            product_id: option.option.product_id,
            created_at: option.option.created_at,
            updated_at: option.option.updated_at,
            deleted_at: option.option.deleted_at,
          },
          created_at: option.created_at,
          updated_at: option.updated_at,
          deleted_at: option.deleted_at,
        })),
      })),
      metadata: product.metadata,
    }))

    const index = client.index("products")
    await index.addDocuments(documents)

    console.log(
      `Successfully synced ${documents.length} products to MeiliSearch`
    )
  } catch (error) {
    console.error("Error syncing products to MeiliSearch:", error)
    throw error
  }
}

export default async function (container: MedusaContainer) {
  await syncProducts(container)
}
