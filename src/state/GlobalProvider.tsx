import { createContext, useReducer } from "kaioken"

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
  })

  return (
    <GlobalCtx.Provider value={state}>
      <GlobalDispatchCtx.Provider value={dispatch}>
        {children}
      </GlobalDispatchCtx.Provider>
    </GlobalCtx.Provider>
  )
}
