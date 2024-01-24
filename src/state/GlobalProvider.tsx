import { createContext, useReducer } from "kaioken"
import { ClickedItem, DragTarget } from "../types"

type Vector2 = {
  x: number
  y: number
}

interface GlobalState {
  drag: {
    start: Vector2
    current: Vector2
  }
  rootElement: HTMLElement
  mousePos: Vector2
  clickedItem: ClickedItem | null
  itemDragTarget: DragTarget | null
  dragging: boolean
}

type GlobalDispatchAction =
  | {
      type: "UPDATE_MOUSE_POS"
      payload: {
        x: number
        y: number
      }
    }
  | {
      type: "UPDATE_DRAG_START"
      payload: {
        x: number
        y: number
      }
    }
  | {
      type: "UPDATE_DRAG_CURRENT"
      payload: {
        x: number
        y: number
      }
    }
  | {
      type: "UPDATE_ROOT_ELEMENT"
      payload: {
        rootElement: HTMLElement
      }
    }
  | { type: "SET_DRAGGING"; payload: { dragging: boolean } }
  | { type: "SET_CLICKED_ITEM"; payload: ClickedItem | null }
  | { type: "SET_ITEM_DRAG_TARGET"; payload: DragTarget | null }

export const GlobalCtx = createContext<GlobalState>(null)
export const GlobalDispatchCtx =
  createContext<(action: GlobalDispatchAction) => void>(null)

export function globalStateReducer(
  state: GlobalState,
  action: GlobalDispatchAction
): GlobalState {
  switch (action.type) {
    case "UPDATE_MOUSE_POS": {
      const { x, y } = action.payload
      return {
        ...state,
        mousePos: {
          x,
          y,
        },
      }
    }
    case "UPDATE_DRAG_START": {
      const { x, y } = action.payload
      return {
        ...state,
        drag: {
          ...state.drag,
          start: {
            x,
            y,
          },
        },
      }
    }
    case "UPDATE_DRAG_CURRENT": {
      const { x, y } = action.payload
      return {
        ...state,
        drag: {
          ...state.drag,
          current: {
            x,
            y,
          },
        },
      }
    }
    case "UPDATE_ROOT_ELEMENT": {
      const { rootElement } = action.payload
      return {
        ...state,
        rootElement,
      }
    }
    case "SET_DRAGGING": {
      const { dragging } = action.payload
      return {
        ...state,
        dragging,
      }
    }
    case "SET_CLICKED_ITEM": {
      return {
        ...state,
        clickedItem: action.payload,
      }
    }
    case "SET_ITEM_DRAG_TARGET": {
      return {
        ...state,
        itemDragTarget: action.payload,
      }
    }
    default: {
      return state
    }
  }
}

export function GlobalProvider({ children }: { children?: JSX.Element[] }) {
  const [state, dispatch] = useReducer(globalStateReducer, {
    drag: {
      start: {
        x: 0,
        y: 0,
      },
      current: {
        x: 0,
        y: 0,
      },
    },
    rootElement: document.getElementById("app")!,
    mousePos: {
      x: 0,
      y: 0,
    },
    clickedItem: null,
    dragging: false,
    itemDragTarget: null,
  })

  return (
    <GlobalCtx.Provider value={state}>
      <GlobalDispatchCtx.Provider value={dispatch}>
        {children}
      </GlobalDispatchCtx.Provider>
    </GlobalCtx.Provider>
  )
}
