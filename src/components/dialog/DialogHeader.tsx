import { ElementProps } from "kaioken"
import { H2 } from "../atoms/Heading"

export function DialogHeader({ children, className }: ElementProps<"div">) {
  return (
    <div
      className={`mb-2 pb-2 border-b border-white border-opacity-15 flex justify-between items-center ${
        className || ""
      }`}
    >
      <H2 className="text-xl w-full flex gap-2 justify-between">{children}</H2>
    </div>
  )
}
