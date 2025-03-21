import { ElementProps } from "kaioken"
import "./Spinner.css"
export function Spinner(props: ElementProps<"div">) {
  return <div className="spinner" {...props}></div>
}
