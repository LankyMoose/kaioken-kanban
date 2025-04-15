import "./Dialog.css"
import { ElementProps } from "kaioken"

export default {
  Root,
  Header,
  Body,
  Footer,
}

function Root({ children, ...props }: ElementProps<"div">) {
  return (
    <div {...props} className="dialog">
      {children}
    </div>
  )
}

function Header({ children, className }: ElementProps<"div">) {
  return (
    <div
      className={`mb-2 pb-2 border-b border-white/15 flex grow justify-between items-center ${
        className || ""
      }`}
    >
      <h2 className="text-2xl w-full flex gap-2 justify-between">{children}</h2>
    </div>
  )
}

function Body({ children }: ElementProps<"div">) {
  return <div className="p-2">{children}</div>
}

function Footer({ children, className, ...rest }: ElementProps<"div">) {
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
