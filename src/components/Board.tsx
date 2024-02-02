import "./Board.css"
import { useRef } from "kaioken"
import { ItemList } from "./ItemList"
import type { Board } from "../types"
import { useGlobal } from "../state/global"
import { useBoard } from "../state/board"
import { Button } from "./atoms/Button"

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
  const { board, handleItemDrop, handleListDrop } = useBoard()
  const boardInnerRef = useRef<HTMLDivElement>(null)

  function handleMouseDown(e: MouseEvent) {
    if (e.buttons !== 1) return
    if (!boardInnerRef.current) return
    if (e.target !== boardInnerRef.current) return
    setDragging(true)
  }

  async function handleMouseUp() {
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
        {board?.lists &&
          board.lists
            .filter((list) => !list.archived)
            .sort((a, b) => a.order - b.order)
            .map((list) => <ItemList list={list} />)}
        <AddList />
      </div>
    </div>
  )
}

function AddList() {
  const { board, addList } = useBoard()
  const { clickedList, listDragTarget } = useGlobal()
  return (
    <div
      style={
        clickedList &&
        !clickedList.dialogOpen &&
        listDragTarget &&
        listDragTarget.index === board?.lists.length
          ? "margin-left: calc(var(--selected-list-width) + var(--lists-gap));"
          : ""
      }
      className="add-list"
    >
      <Button
        variant="primary"
        className="text-sm font-semibold py-4 border-2 border-transparent"
        onclick={() => addList()}
      >
        Add a list...
      </Button>
    </div>
  )
}
