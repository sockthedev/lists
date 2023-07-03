import { useParams } from "react-router-dom"
import type { z } from "zod"

export function useZodParams<Schema extends z.ZodObject<any>>(
  schema: Schema,
): z.infer<Schema> {
  const params = useParams()
  const result = schema.safeParse(params)
  if (!result.success) {
    throw new Error(result.error.message)
  }
  return result.data
}
