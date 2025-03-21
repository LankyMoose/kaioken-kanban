import { ElementProps } from "kaioken"
import "./Card.css"
export const Card: Kaioken.FC<ElementProps<"div">> = ({
  children,
  ...props
}) => {
  const { className } = props

  return (
    <div {...props} className={`card ${className || ""}`}>
      {children}
    </div>
  )
}
