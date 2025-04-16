import { idb } from "async-idb-orm"
import * as schema from "./schema"
import { migrate_3_4 } from "./migrations"
import { VERSION } from "./constants"
export type * from "./types"

export const db = idb("kanban", {
  schema,
  version: VERSION,
  onUpgrade: async (ctx, evt) => {
    let v = evt.oldVersion
    while (v < VERSION) {
      switch (v) {
        case 3:
          await migrate_3_4(ctx)
          break
      }
      v++
    }
  },
})
