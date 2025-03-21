import { idb } from "async-idb-orm"
import * as schema from "./schema"
export type * from "./types"
export * from "./methods"

export const db = idb("kanban", schema, 4)
