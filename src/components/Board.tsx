import { useContext, useRef, Portal, useEffect } from "kaioken"
import { BoardContext, BoardDispatchContext } from "../state/BoardProvider"
import { ItemList } from "./ItemList"
import "./Board.css"
import { GlobalCtx } from "../state/GlobalProvider"
import { Board } from "../types"

export function Board() {
  const { rootElement } = useContext(GlobalCtx)
  const { lists, clickedItem, dragging, itemDragTarget } =
    useContext(BoardContext)
  const dispatch = useContext(BoardDispatchContext)
  const boardInnerRef = useRef<HTMLDivElement>(null)

  function handleMouseDown(e: MouseEvent) {
    if (e.buttons !== 1) return
    if (!boardInnerRef.current) return
    if (e.target !== boardInnerRef.current) return
    dispatch({
      type: "SET_DRAGGING",
      payload: {
        dragging: true,
      },
    })
  }

  function handleMouseUp() {
    if (clickedItem && itemDragTarget) {
      const itemList = lists.find((list) => list.id === clickedItem.listId)!
      const targetList = lists.find(
        (list) => list.id === itemDragTarget.listId
      )!
      const isOriginList = clickedItem.listId === itemDragTarget.listId
      const item = itemList.items.find((item) => item.id === clickedItem.id)!
      const targetIdx =
        isOriginList && clickedItem.index <= itemDragTarget.index
          ? itemDragTarget.index - 1
          : itemDragTarget.index

      const moved = item.order !== targetIdx || itemList !== targetList
      if (moved) {
        itemList.items.splice(clickedItem.index, 1)

        if (isOriginList) {
          itemList.items.splice(targetIdx, 0, item)
          itemList.items.forEach((item, i) => {
            item.order = i
          })
          dispatch({
            type: "UPDATE_LIST",
            payload: itemList,
          })
        } else {
          targetList.items.splice(targetIdx, 0, item)
          itemList.items.forEach((item, i) => {
            item.order = i
          })
          targetList.items.forEach((item, i) => {
            item.order = i
          })
          dispatch({
            type: "UPDATE_LIST",
            payload: itemList,
          })
          dispatch({
            type: "UPDATE_LIST",
            payload: targetList,
          })
        }
      }
    }
    if (clickedItem) {
      dispatch({
        type: "SET_CLICKED_ITEM",
        payload: null,
      })
    }
    if (itemDragTarget) {
      dispatch({
        type: "SET_ITEM_DRAG_TARGET",
        payload: null,
      })
    }
    if (dragging) {
      dispatch({
        type: "SET_DRAGGING",
        payload: {
          dragging: false,
        },
      })
    }
  }
  function handleMouseMove(e: MouseEvent) {
    if (!dragging) return
    rootElement.scrollLeft -= e.movementX
    rootElement.scrollTop -= e.movementY
  }

  return (
    <div
      id="board"
      onmousedown={handleMouseDown}
      onmouseup={handleMouseUp}
      onmousemove={handleMouseMove}
      style={
        clickedItem
          ? `--selected-item-height:${clickedItem.domRect.height}px;`
          : ""
      }
    >
      <div
        className={`inner ${
          dragging || clickedItem?.dragging ? "dragging" : ""
        }`}
        ref={boardInnerRef}
      >
        {lists
          .sort((a, b) => a.order - b.order)
          .map((list) => (
            <ItemList list={list} />
          ))}
      </div>
      <Portal container={document.getElementById("portal")!}>
        {clickedItem?.dragging && <ListItemClone item={clickedItem} />}
      </Portal>
    </div>
  )
}

function ListItemClone({ item }: { item: Board["clickedItem"] }) {
  const { mousePos } = useContext(GlobalCtx)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = item?.element?.outerHTML || ""
  }, [ref.current])

  function getStyle() {
    return `transform: translate(${mousePos.x - item!.mouseOffset.x || 0}px, ${
      mousePos.y - item!.mouseOffset.y || 0
    }px); width: ${item!.domRect.width}px; height: ${item!.domRect.height}px;`
  }

  return <div ref={ref} id="item-clone" style={getStyle()}></div>
}
