type Key = string | number

type SelectOption =
  | {
      key: Key
      text: string
    }
  | string

interface SelectProps {
  value?: number
  options: SelectOption[]
  onchange?: (value: string) => void
}

export function Select(props: SelectProps) {
  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement
    props.onchange?.(target.value)
  }

  return (
    <select className="p-2" onchange={handleChange}>
      {props.options.map((item) => {
        const key = typeof item === "object" ? String(item.key) : item
        return (
          <option value={key} selected={String(props.value) === key}>
            {typeof item === "object" ? item.text : item}
          </option>
        )
      })}
    </select>
  )
}
