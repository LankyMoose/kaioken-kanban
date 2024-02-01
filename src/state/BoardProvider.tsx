import { useEffect, useReducer } from "kaioken"
import { boardStateReducer, BoardContext, BoardDispatchContext } from "./board"
import { useGlobal } from "./global"
import { loadItems, loadLists } from "../idb"
import { List, SelectedBoardList } from "../types"

export function BoardProvider({ children }: { children?: JSX.Element }) {
  const [value, dispatch] = useReducer(boardStateReducer, null)
  const { boards } = useGlobal()
  useEffect(() => {
    if (boards.length === 0) return
    const selectedBoard = {
      ...boards.at(-1)!,
      lists: [],
      archivedLists: [],
      dropArea: null,
    }
    loadLists(selectedBoard.id).then(async (res) => {
      const [lists, archivedLists] = res.reduce<[Array<List>, Array<List>]>(
        ([active, archived], item) => {
          ;(item.archived ? archived : active).push(item)
          return [active, archived]
        },
        [[], []]
      )

      const activeLists = await Promise.all(
        lists.map(async (list) => {
          const items = await loadItems(list.id)
          return {
            ...list,
            items,
            dropArea: null,
          } as SelectedBoardList
        })
      )
      dispatch({
        type: "UPDATE_LISTS",
        payload: {
          lists: activeLists,
          archivedLists,
        },
      })
    })
    dispatch({
      type: "SET_BOARD",
      payload: selectedBoard,
    })
  }, [boards.length])

  return (
    <BoardContext.Provider value={value}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardContext.Provider>
  )
}
