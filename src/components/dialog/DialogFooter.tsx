import { ElementProps } from "kaioken"

export function DialogFooter({ children, ...rest }: ElementProps<"div">) {
  const { className, ...props } = rest
  return (
    <div
      className={`pt-2 border-t border-white border-opacity-15 flex justify-between items-center ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  )
}
