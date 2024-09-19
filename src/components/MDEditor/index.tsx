import "./md-editor.css"
import { useCallback, useEffect, useRef } from "kaioken"
import { Editor, type ChangeEvent } from "tiny-markdown-editor"

type MDEditorProps = {
  initialValue?: string
  onChange?: (value: string) => void
}

export function MDEditor(props: MDEditorProps) {
  const elementRef = useRef<any>(null)
  //const historyStack = useRef()

  const handleEditorChange = useCallback((e: ChangeEvent) => {
    props.onChange?.(e.content)
  }, [])

  useEffect(() => {
    if (!elementRef.current) return
    const editor = new Editor({
      element: elementRef.current!,
      content: props.initialValue || "",
    })
    editor.addEventListener("change", handleEditorChange)
  }, [])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!e.ctrlKey) return
    switch (e.key) {
      case "z": {
        e.preventDefault()
        console.log("undo")
        break
      }
      case "y": {
        e.preventDefault()
        console.log("redo")
        break
      }
    }
  }, [])

  return <div ref={elementRef} onkeyup={handleKeyUp}></div>
}
