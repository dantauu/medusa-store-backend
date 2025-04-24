import { Button, Container, Heading } from "@medusajs/ui"
import { useState } from "react"
import { toast } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"

const SyncPage = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/admin/meilisearch/sync", {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      toast.success("Successfully triggered data sync to Meilisearch")
    } catch (err) {
      console.error(err)
      toast.error("Failed to sync data to Meilisearch")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <div className="flex flex-col gap-y-4">
        <Heading level="h1">Meilisearch Sync</Heading>
        <p className="text-gray-500">
          Manually trigger synchronization with Meilisearch.
        </p>
        <Button onClick={handleSync} isLoading={isLoading} variant="primary">
          Sync Now
        </Button>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Meilisearch",
})

export default SyncPage
