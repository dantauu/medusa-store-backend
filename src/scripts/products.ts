import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils"
import { RemoteQueryFunctionReturnPagination } from "@medusajs/types/dist/modules-sdk/remote-query"
type GraphResultSet<T> = {
  data: T
  metadata?: RemoteQueryFunctionReturnPagination
}

export default async function getProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["*"],
    pagination: {
      take: 1,
      skip: 0,
    },
  })
  const [region] = regions
  if (!region) {
    throw new Error("No regions found")
  }

  type ProductsWithCalcPrice = {
    id: string
    variants: { calculated_price: { calculated_amount: number } }[]
  }[]

  const { data: products } = (await query.graph({
    entity: "product",
    fields: ["id", "title", "variants.calculated_price.calculated_amount"],
    pagination: {
      take: 1000,
      skip: 0,
    },
    context: {
      variants: {
        calculated_price: QueryContext({
          region_id: region.id,
          currency_code: region.currency_code,
        }),
      },
    },
  })) as unknown as GraphResultSet<ProductsWithCalcPrice>

  const productsWithMinPrice = products.map(({ variants, ...product }) => {
    const prices = variants.map(
      (variant) => variant.calculated_price.calculated_amount
    )
    const minPrice = Math.min(...prices)
    return {
      ...product,
      minPrice,
    }
  })

  console.log(productsWithMinPrice)
}
