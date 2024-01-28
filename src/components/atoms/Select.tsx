type Key = string | number

type SelectOption =
  | {
      key: Key
      text: string
    }
  | string

interface SelectProps {
  value?: Key
  options: SelectOption[]
  onChange?: (value: string) => void
}

export function Select(props: SelectProps) {
  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement
    props.onChange?.(target.value)
  }
  return (
    <select className="p-2" onchange={handleChange}>
      {props.options.map((item) => (
        <option
          value={typeof item === "object" ? String(item.key) : item}
          selected={props.value === item}
        >
          {typeof item === "object" ? item.text : item}
        </option>
      ))}
      <option value="create-new">Create New Board</option>
    </select>
  )
}
