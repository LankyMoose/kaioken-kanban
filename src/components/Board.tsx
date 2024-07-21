import "./Board.css"
import type { Board as BoardType } from "../idb"
import { Link, Portal, useEffect, useRef, useState } from "kaioken"
import { ItemList } from "./ItemList"
import type { Vector2 } from "../types"
import { useGlobal } from "../state/global"
import { Button } from "./atoms/Button"
import { ItemEditorModal } from "./ItemEditor"
import { ListEditorModal } from "./ListEditor"
import { ListItemClone } from "./ListItemClone"
import { ListClone } from "./ListClone"
import { MouseCtx } from "../state/mouse"
import { BoardEditorDrawer } from "./BoardEditor"
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon"
import { MoreIcon } from "./icons/MoreIcon"
import { useListsStore } from "../state/lists"
import { useBoardStore } from "../state/board"
import { useItemsStore } from "../state/items"
import { ContextMenu } from "./ContextMenu"

const autoScrollSpeed = 10

export function Board({ boardId }: { boardId: string }) {
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
  const animFrameRef = useRef(-1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [autoScrollVec, setAutoScrollVec] = useState<Vector2>({ x: 0, y: 0 })
  const {
    value: { board },
    selectBoard,
  } = useBoardStore()
  const { handleItemDrop } = useItemsStore()
  const { handleListDrop } = useListsStore()
  const boardInnerRef = useRef<HTMLDivElement | null>(null)

  const { boards, boardsLoaded } = useGlobal()
  const {
    value: { lists },
  } = useListsStore()

  useEffect(() => {
    if (!boardsLoaded) return
    const board = boards.find(
      (b) => String(b.id) === boardId || b.uuid === boardId
    )
    if (!board) {
      // @ts-ignore
      window.location = "/"
      return
    }
    selectBoard(board)
  }, [boardsLoaded])

  useEffect(() => {
    const v = getAutoScrollVec()
    if (v.x !== autoScrollVec.x || v.y !== autoScrollVec.y) {
      setAutoScrollVec(v)
    }
  }, [mousePos, clickedItem, clickedList])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(applyAutoScroll)
    return () => {
      if (animFrameRef.current !== -1) {
        cancelAnimationFrame(animFrameRef.current!)
        animFrameRef.current = -1
      }
    }
  }, [rootElement, autoScrollVec])

  function applyAutoScroll() {
    if (rootElement) {
      if (autoScrollVec.x !== 0)
        rootElement.scrollLeft += autoScrollVec.x * autoScrollSpeed
      if (autoScrollVec.y !== 0)
        rootElement.scrollTop += autoScrollVec.y * autoScrollSpeed
    }

    animFrameRef.current = requestAnimationFrame(applyAutoScroll)
  }

  function getAutoScrollVec() {
    const scrollPadding = 100
    const res: Vector2 = { x: 0, y: 0 }
    if (!clickedItem?.dragging && !clickedList?.dragging) return res

    if (mousePos.x + scrollPadding > window.innerWidth) {
      res.x++
    } else if (mousePos.x - scrollPadding < 0) {
      res.x--
    }
    if (mousePos.y + scrollPadding > window.innerHeight) {
      res.y++
    } else if (mousePos.y - scrollPadding < 0) {
      res.y--
    }
    return res
  }

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

    // setAutoScrollVec({ x: 0, y: 0 })

    // board drag
    dragging && setDragging(false)
  }

  function handleMouseMove(e: MouseEvent) {
    setMousePos({
      x: e.clientX,
      y: e.clientY,
    })
    if (clickedList && !clickedList.dragging) {
      setClickedList({
        ...clickedList,
        dragging: true,
      })
    } else if (clickedList && clickedList.dragging) {
      handleListDrag(e, clickedList)
    }
    if (!dragging || !rootElement) return
    rootElement.scrollLeft -= e.movementX
    rootElement.scrollTop -= e.movementY
  }

  return (
    <MouseCtx.Provider value={{ current: mousePos, setValue: setMousePos }}>
      <Nav board={board} />
      <div
        id="board"
        onpointerdown={handleMouseDown}
        onpointerup={handleMouseUp}
        onpointermove={handleMouseMove}
        style={`${
          clickedItem
            ? "--selected-item-height:" +
              (clickedItem.domRect?.height || 0) +
              "px;"
            : ""
        }${
          clickedList
            ? "--selected-list-width:" + clickedList.domRect?.width + "px;"
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
          {lists
            .filter((list) => !list.archived)
            .sort((a, b) => a.order - b.order)
            .map((list) => (
              <ItemList key={list.id} list={list} />
            ))}
          <AddList />
        </div>
        <Portal container={document.getElementById("portal")!}>
          {clickedItem?.dragging && <ListItemClone item={clickedItem} />}
          {clickedList?.dragging && <ListClone list={clickedList} />}
          <ItemEditorModal />
          <ListEditorModal />
          <BoardEditorDrawer />
          <ContextMenu />
        </Portal>
      </div>
    </MouseCtx.Provider>
  )
}

function AddList() {
  const { setClickedList, clickedList, listDragTarget } = useGlobal()
  const {
    value: { lists },
    addList,
  } = useListsStore()
  return (
    <div
      style={
        clickedList &&
        !clickedList.dialogOpen &&
        listDragTarget &&
        listDragTarget.index === lists.length
          ? "margin-left: calc(var(--selected-list-width) + var(--lists-gap));"
          : ""
      }
      className="add-list"
    >
      <Button
        variant="primary"
        className="text-sm font-semibold py-4 border-2 border-transparent"
        onclick={async () => {
          const newList = await addList()
          setClickedList({
            list: newList,
            dialogOpen: true,
            dragging: false,
            id: newList.id,
            index: newList.order,
          })
        }}
      >
        Add a list...
      </Button>
    </div>
  )
}

function Nav({ board }: { board: BoardType | null }) {
  const { setBoardEditorOpen } = useGlobal()
  return (
    <nav className="p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Link to="/" className="p-2">
          <ChevronLeftIcon />
        </Link>
      </div>
      <h1 className="text-lg font-bold select-none">
        {board?.title || "(Unnamed board)"}
      </h1>
      <button onclick={() => setBoardEditorOpen(true)} className="p-2">
        <MoreIcon />
      </button>
    </nav>
  )
}
