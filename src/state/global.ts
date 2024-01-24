import { createContext, useContext } from "kaioken"
import { ClickedItem, DragTarget, Vector2, GlobalState } from "../types"

export const GlobalCtx = createContext<GlobalState>(null)
export const GlobalDispatchCtx =
  createContext<(action: GlobalDispatchAction) => void>(null)

export function useGlobal() {
  const dispatch = useContext(GlobalDispatchCtx)
  return {
    ...useContext(GlobalCtx),
    updateMousePos: (payload: Vector2) =>
      dispatch({ type: "UPDATE_MOUSE_POS", payload }),
    updateDragStart: (payload: Vector2) =>
      dispatch({ type: "UPDATE_DRAG_START", payload }),
    updateDragCurrent: (payload: Vector2) =>
      dispatch({ type: "UPDATE_DRAG_CURRENT", payload }),
    setDragging: (dragging: boolean) =>
      dispatch({ type: "SET_DRAGGING", payload: { dragging } }),
    setClickedItem: (payload: ClickedItem | null) =>
      dispatch({ type: "SET_CLICKED_ITEM", payload }),
    setItemDragTarget: (payload: DragTarget | null) =>
      dispatch({ type: "SET_ITEM_DRAG_TARGET", payload }),
  }
}

type GlobalDispatchAction =
  | { type: "UPDATE_MOUSE_POS"; payload: Vector2 }
  | { type: "UPDATE_DRAG_START"; payload: Vector2 }
  | { type: "UPDATE_DRAG_CURRENT"; payload: Vector2 }
  | { type: "SET_DRAGGING"; payload: { dragging: boolean } }
  | { type: "SET_CLICKED_ITEM"; payload: ClickedItem | null }
  | { type: "SET_ITEM_DRAG_TARGET"; payload: DragTarget | null }

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

export const defaultGlobalState: GlobalState = {
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
}
