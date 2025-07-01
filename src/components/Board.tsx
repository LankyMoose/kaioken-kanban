import "./Board.css"
import type { Board as BoardType } from "../idb"
import {
  Portal,
  signal,
  Transition,
  useAsync,
  useEffect,
  useRef,
} from "kaioken"
import { Link } from "kaioken/router"
import { ItemList } from "./ItemList"
import type { Vector2 } from "../types"
import { useGlobal } from "../state/global"
import { Button } from "./atoms/Button"
import { ItemEditorModal } from "./ItemEditor"
import { ListEditorModal } from "./ListEditor"
import { ListItemClone } from "./ListItemClone"
import { ListClone } from "./ListClone"
import { mousePos } from "../state/mouse"
import { BoardEditorDrawer } from "./BoardEditor"
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon"
import { MoreIcon } from "./icons/MoreIcon"
import { useListsStore } from "../state/lists"
import { useItemsStore } from "../state/items"
import { ContextMenu } from "./ContextMenu"
import { useBoardStore } from "../state/board"

const autoScrollSpeed = 10

const autoScrollVec = signal<Vector2>({ x: 0, y: 0 })

export function Board({ board }: { board: BoardType }) {
  const { selectBoard } = useBoardStore()
  useAsync(() => selectBoard(board), [board.id])

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
  const { handleItemDrop } = useItemsStore()
  const { handleListDrop } = useListsStore()
  const boardInnerRef = useRef<HTMLDivElement | null>(null)

  const {
    value: { lists },
  } = useListsStore()

  useEffect(() => {
    const v = getAutoScrollVec()
    if (v.x !== autoScrollVec.value.x || v.y !== autoScrollVec.value.y) {
      autoScrollVec.value = v
    }
  }, [clickedItem, clickedList])

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
      if (autoScrollVec.value.x !== 0)
        rootElement.scrollLeft += autoScrollVec.value.x * autoScrollSpeed
      if (autoScrollVec.value.y !== 0)
        rootElement.scrollTop += autoScrollVec.value.y * autoScrollSpeed
    }

    animFrameRef.current = requestAnimationFrame(applyAutoScroll)
  }

  function getAutoScrollVec() {
    const scrollPadding = 100
    const res: Vector2 = { x: 0, y: 0 }
    if (!clickedItem?.dragging && !clickedList?.dragging) return res

    if (mousePos.value.x + scrollPadding > window.innerWidth) {
      res.x++
    } else if (mousePos.value.x - scrollPadding < 0) {
      res.x--
    }
    if (mousePos.value.y + scrollPadding > window.innerHeight) {
      res.y++
    } else if (mousePos.value.y - scrollPadding < 0) {
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
    clickedItem &&
      itemDragTarget &&
      (await handleItemDrop(clickedItem, itemDragTarget))
    clickedItem && setClickedItem(null)
    itemDragTarget && setItemDragTarget(null)

    // list drag
    clickedList &&
      listDragTarget &&
      (await handleListDrop(clickedList, listDragTarget))
    clickedList && setClickedList(null)
    listDragTarget && setListDragTarget(null)

    // setAutoScrollVec({ x: 0, y: 0 })

    // board drag
    dragging && setDragging(false)
  }

  function handleMouseMove(e: MouseEvent) {
    mousePos.value = {
      x: e.clientX,
      y: e.clientY,
    }
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
    <>
      <Nav />
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
        <Transition
          in={true}
          duration={10}
          element={(state) => {
            const opacity = state === "entered" ? "1" : "0"
            return (
              <div
                style={{
                  opacity,
                }}
                className={`inner transition-all ${
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
            )
          }}
        />

        <Portal container={document.getElementById("portal")!}>
          {clickedItem?.dragging && <ListItemClone item={clickedItem} />}
          {clickedList?.dragging && <ListClone list={clickedList} />}
          <ItemEditorModal />
          <ListEditorModal />
          <BoardEditorDrawer />
          <ContextMenu />
        </Portal>
      </div>
    </>
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

function Nav() {
  const { setBoardEditorOpen } = useGlobal()
  const {
    value: { board },
  } = useBoardStore()
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
