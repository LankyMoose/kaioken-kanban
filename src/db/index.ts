import { idb } from "async-idb-orm"
import * as schema from "./schema"
export type * from "./types"

export const db = idb("kanban", {
  schema,
  version: 4,
})
