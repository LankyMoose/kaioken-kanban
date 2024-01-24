import { createContext, useContext } from "kaioken"
import { Board, List, ListItem } from "../types"

export const BoardContext = createContext<Board>(null)
export const BoardDispatchContext =
  createContext<(action: BoardDispatchAction) => void>(null)

export function useBoard() {
  const dispatch = useContext(BoardDispatchContext)
  return {
    ...useContext(BoardContext),
    addList: (title: string) =>
      dispatch({ type: "ADD_LIST", payload: { title } }),
    removeList: (id: string) =>
      dispatch({ type: "REMOVE_LIST", payload: { id } }),
    updateList: (payload: Partial<List> & { id: string }) =>
      dispatch({ type: "UPDATE_LIST", payload }),
    updateItem: (payload: Partial<ListItem> & { id: string }) =>
      dispatch({ type: "UPDATE_ITEM", payload }),
  }
}

type BoardDispatchAction =
  | { type: "ADD_LIST"; payload: { title: string } }
  | { type: "REMOVE_LIST"; payload: { id: string } }
  | { type: "UPDATE_LIST"; payload: Partial<List> & { id: string } }
  | { type: "UPDATE_ITEM"; payload: Partial<ListItem> & { id: string } }

export function boardStateReducer(
  state: Board,
  action: BoardDispatchAction
): Board {
  switch (action.type) {
    case "ADD_LIST": {
      const { title } = action.payload
      const lists = [
        ...state.lists,
        {
          id: `${state.lists.length + 1}`,
          title,
          items: [],
          dropArea: null,
          order: state.lists.length,
          archived: false,
          created: new Date(),
        },
      ]
      localStorage.setItem("lists", JSON.stringify(lists))
      return {
        ...state,
        lists,
      }
    }
    case "REMOVE_LIST": {
      const { id } = action.payload
      const lists = state.lists.filter((list) => list.id !== id)
      localStorage.setItem("lists", JSON.stringify(lists))
      return {
        ...state,
        lists,
      }
    }
    case "UPDATE_LIST": {
      const { id, ...rest } = action.payload
      const list = state.lists.find((list) => list.id === id)
      if (!list) return state
      const lists = [
        ...state.lists.filter((list) => list.id !== id),
        {
          ...list,
          ...rest,
        },
      ]
      localStorage.setItem("lists", JSON.stringify(lists))
      return {
        ...state,
        lists,
      }
    }
    case "UPDATE_ITEM": {
      const { id, ...rest } = action.payload
      const item = state.lists
        .map((list) => list.items)
        .flat()
        .find((item) => item.id === id)
      if (!item) return state
      const lists = state.lists.map((list) => ({
        ...list,
        items: [
          ...list.items.filter((item) => item.id !== id),
          {
            ...item,
            ...rest,
          },
        ],
      }))
      localStorage.setItem("lists", JSON.stringify(lists))
      return {
        ...state,
        lists,
      }
    }
    default: {
      throw new Error(`Unhandled action: ${action}`)
    }
  }
}

const defaultBoard: Board = {
  lists: [
    {
      id: "1",
      title: "List 1 asdas ",
      items: [
        {
          id: crypto.randomUUID(),
          title: "Item 1",
          description: "Description 1",
          archived: false,
          created: new Date(),
          order: 0,
        },
        {
          id: crypto.randomUUID(),
          title: "Item 2",
          description: "Description 2",
          archived: false,
          created: new Date(),
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Item 3",
          description: "Description 3",
          archived: false,
          created: new Date(),
          order: 2,
        },
      ],
      dropArea: null,
      order: 0,
      archived: false,
      created: new Date(),
    },
    {
      id: "2",
      title: "List 2",
      items: [
        {
          id: crypto.randomUUID(),
          title: "Item 4",
          description: "Description 4",
          archived: false,
          created: new Date(),
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Item 5",
          description: "Description 5",
          archived: false,
          created: new Date(),
          order: 0,
        },
      ],
      dropArea: null,
      order: 1,
      archived: false,
      created: new Date(),
    },
  ],
  id: crypto.randomUUID(),
  title: "Board 1",
}

export function loadBoard(): Board {
  const lists = localStorage.getItem("lists")
  if (!lists) return defaultBoard
  return {
    ...defaultBoard,
    lists: JSON.parse(lists),
  }
}
