import { ElementProps } from "kaioken"

export function DialogBody({ children }: ElementProps<"div">) {
  return <div className="p-2">{children}</div>
}
