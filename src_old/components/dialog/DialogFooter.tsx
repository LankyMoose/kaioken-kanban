import { ElementProps } from "kaioken"

export function DialogFooter({
  children,
  className,
  ...rest
}: ElementProps<"div">) {
  return (
    <div
      className={`pt-2 border-t border-white/15 flex justify-between items-center ${
        className || ""
      }`}
      {...rest}
    >
      {children}
    </div>
  )
}
