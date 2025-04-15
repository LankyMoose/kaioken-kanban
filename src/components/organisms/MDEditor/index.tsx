import "./md-editor.css"
import { useCallback, useEffect, useRef, useState } from "kaioken"
import { Editor, type ChangeEvent } from "tiny-markdown-editor"

type MDEditorProps = {
  initialValue?: string
  onChange?: (value: string) => void
}

function createEditorStack(current: string) {
  const stack: string[] = [current]

  let index = stack.length

  const state = {
    first: true,
    last: true,
    current,
  }

  function update() {
    state.first = index === 1
    state.last = index === stack.length
    state.current = stack[index - 1]
  }

  return {
    push: (value: string | ((current: string) => string)) => {
      stack.length = index
      stack[index++] = value instanceof Function ? value(current) : value
      update()
    },
    undo: () => {
      if (index > 1) {
        index -= 1
        update()
      }
    },
    redo: () => {
      if (index < stack.length) {
        index += 1
        update()
      }
    },
    state,
    get lastCharChanged() {
      if (state.last) return null
      const prev = stack[index]
      if (!prev) return null
      const maxLen = Math.max(state.current.length, prev.length)

      for (let i = 0; i < maxLen; i++) {
        const prevc = prev[i]
        const curc = state.current[i]
        if (prevc !== curc) {
          console.log("dif char", prevc, curc)
          return i
        }
      }
      return null
    },
  }
}

export function MDEditor(props: MDEditorProps) {
  const isHistoryEvt = useRef(false)
  const editorElementRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)
  const [stack] = useState(() => createEditorStack(props.initialValue ?? ""))

  const handleEditorChange = useCallback((e: ChangeEvent) => {
    if (isHistoryEvt.current) {
      isHistoryEvt.current = false
      return
    }
    isHistoryEvt.current = false
    stack.push(e.content)
    props.onChange?.(e.content)
  }, [])

  useEffect(() => {
    const editor = new Editor({
      element: editorElementRef.current!,
      textarea: textareaRef.current!,
      content: props.initialValue || "",
    })
    editor.addEventListener("change", handleEditorChange)
    setEditorInstance(editor)
  }, [])

  const setCursorPosition = () => {
    const lastCharChanged = stack.lastCharChanged
    if (lastCharChanged !== null) {
      let row = 0,
        col = 0

      for (let i = 0; i < stack.state.current.length; i++) {
        if (i === lastCharChanged) break
        if (stack.state.current[i] === "\n") {
          row++
          col = 0
          continue
        }
        col++
      }
      editorInstance?.setSelection({ col, row })
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!e.ctrlKey) return
    switch (e.key) {
      case "z": {
        e.preventDefault()
        isHistoryEvt.current = true
        break
      }
      case "y": {
        e.preventDefault()
        isHistoryEvt.current = true
      }
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!e.ctrlKey) return
    switch (e.key) {
      case "z": {
        e.preventDefault()
        stack.undo()
        // @ts-ignore
        editorInstance!.setContent(stack.state.current)
        setCursorPosition()
        break
      }
      case "y": {
        e.preventDefault()
        stack.redo()
        // @ts-ignore
        editorInstance!.setContent(stack.state.current)
        setCursorPosition()
        break
      }
    }
  }

  return (
    <>
      <textarea ref={textareaRef} />
      <div
        ref={editorElementRef}
        //onkeypress={handleKeyPress}
        onkeydown={handleKeyDown}
        onkeyup={handleKeyUp}
      ></div>
    </>
  )
}
