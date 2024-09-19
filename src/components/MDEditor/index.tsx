import "./md-editor.css"
import { useCallback, useEffect, useRef, useState } from "kaioken"
import { Editor, type ChangeEvent } from "tiny-markdown-editor"

type MDEditorProps = {
  initialValue?: string
  onChange?: (value: string) => void
}

function createStack<T>(current: T) {
  const stack: T[] = [current]

  let index = stack.length

  const state = {
    first: true,
    last: true,
    current,
  }

  function update() {
    //current = stack[index - 1]
    state.first = index === 1
    state.last = index === stack.length
    state.current = stack[index - 1]
  }

  return {
    push: (value: T | ((current: T) => T)) => {
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
  }
}

export function MDEditor(props: MDEditorProps) {
  const isHistoryEvt = useRef(false)
  const editorElementRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)
  const [stack] = useState(() => createStack(props.initialValue ?? ""))

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
        break
      }
      case "y": {
        e.preventDefault()
        stack.redo()
        // @ts-ignore
        editorInstance!.setContent(stack.state.current)
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
