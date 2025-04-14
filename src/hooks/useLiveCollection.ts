import { useAsync, useEffect } from "kaioken"
import { db } from "$/db"
export const useLiveCollection = <T extends keyof (typeof db)["collections"]>(
  name: T
) => {
  const collection = db.collections[name]
  const { invalidate, ...rest } = useAsync(() => collection.all(), [])

  useEffect(() => {
    collection.addEventListener("write|delete", invalidate)
    return () => collection.removeEventListener("write|delete", invalidate)
  }, [])
  return { ...rest, invalidate }
}
