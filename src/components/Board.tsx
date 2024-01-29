import "./Board.css"
import { useRef, Portal, useEffect } from "kaioken"
import { ItemList } from "./ItemList"
import type { Board, ClickedItem, ClickedList } from "../types"
import { useGlobal } from "../state/global"
import { useBoard } from "../state/board"
import { ItemEditorModal } from "./ItemEditor"
import { ListEditorModal } from "./ListEditor"

export function Board() {
  const {
    rootElement,
    clickedItem,
    setClickedItem,
    dragging,
    setDragging,
    itemDragTarget,
    setItemDragTarget,
    clickedList,
    setClickedList,
    listDragTarget,
    setListDragTarget,
    handleListDrag,
  } = useGlobal()
  const { lists, handleItemDrop, handleListDrop } = useBoard()
  const boardInnerRef = useRef<HTMLDivElement>(null)

  function handleMouseDown(e: MouseEvent) {
    if (e.buttons !== 1) return
    if (!boardInnerRef.current) return
    if (e.target !== boardInnerRef.current) return
    setDragging(true)
  }

  function handleMouseUp() {
    // item drag
    clickedItem && itemDragTarget && handleItemDrop(clickedItem, itemDragTarget)
    clickedItem && setClickedItem(null)
    itemDragTarget && setItemDragTarget(null)

    // list drag
    clickedList && listDragTarget && handleListDrop(clickedList, listDragTarget)
    clickedList && setClickedList(null)
    listDragTarget && setListDragTarget(null)

    // board drag
    dragging && setDragging(false)
  }

  function handleMouseMove(e: MouseEvent) {
    if (clickedList && !clickedList.dragging) {
      setClickedList({
        ...clickedList,
        dragging: true,
      })
    } else if (clickedList && clickedList.dragging) {
      handleListDrag(e, clickedList)
    }
    if (!dragging) return
    rootElement.scrollLeft -= e.movementX
    rootElement.scrollTop -= e.movementY
  }

  return (
    <div
      id="board"
      className="xd"
      onmousedown={handleMouseDown}
      onmouseup={handleMouseUp}
      onmousemove={handleMouseMove}
      style={`${
        clickedItem
          ? "--selected-item-height:" +
            (clickedItem.domRect.height || 0) +
            "px;"
          : ""
      }${
        clickedList
          ? "--selected-list-width:" + clickedList.domRect.width + "px;"
          : ""
      }`}
    >
      <div
        className={`inner ${
          dragging || clickedItem?.dragging || clickedList?.dragging
            ? "dragging"
            : ""
        }`}
        ref={boardInnerRef}
      >
        {lists &&
          lists
            .sort((a, b) => a.order - b.order)
            .map((list) => <ItemList list={list} />)}
      </div>
      <Portal container={document.getElementById("portal")!}>
        {clickedItem?.dragging && <ListItemClone item={clickedItem} />}
        {clickedList?.dragging && <ListClone list={clickedList} />}
        <ItemEditorModal />
        <ListEditorModal />
      </Portal>
    </div>
  )
}

function ListItemClone({ item }: { item: ClickedItem }) {
  const { mousePos } = useGlobal()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = item.element.outerHTML || ""
  }, [ref.current])

  function getStyle() {
    const x = mousePos.x - item.mouseOffset.x || 0
    const y = mousePos.y - item.mouseOffset.y || 0
    return `transform: translate(${x}px, ${y}px); width: ${
      item.domRect.width || 0
    }px; height: ${item.domRect.height || 0}px;`
  }

  return <div ref={ref} id="item-clone" style={getStyle()}></div>
}

function ListClone({ list }: { list: ClickedList }) {
  const { mousePos } = useGlobal()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = list.element.outerHTML || ""
  }, [ref.current])

  function getStyle() {
    const x = mousePos.x - list.mouseOffset.x || 0
    const y = mousePos.y - list.mouseOffset.y || 0
    return `transform: translate(calc(${x}px - var(--list-header-padding)), calc(${y}px - var(--list-header-padding))); width: ${list.domRect.width}px; height: ${list.domRect.height}px;`
  }

  return <div ref={ref} id="list-clone" style={getStyle()}></div>
}
