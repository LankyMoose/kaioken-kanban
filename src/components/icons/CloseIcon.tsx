import { ElementProps } from "kaioken"

export const CloseIcon = (props: ElementProps<"svg">) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1rem"
      viewBox="0 0 24 24"
      fill="none"
      stroke-width="2"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="stroke"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
