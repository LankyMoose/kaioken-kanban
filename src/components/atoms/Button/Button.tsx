import "./Button.css"
import { type ElementProps } from "kaioken"

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "link"
  | "default"

export function Button({
  variant,
  children,
  ...props
}: ElementProps<"button"> & { variant?: ButtonVariant }) {
  switch (variant) {
    case "primary":
      return <PrimaryButton {...props}>{children}</PrimaryButton>
    case "secondary":
      return <SecondaryButton {...props}>{children}</SecondaryButton>
    default:
      return <DefaultButton {...props}>{children}</DefaultButton>
  }
}

function ButtonBase({ className, ...props }: ElementProps<"button">) {
  return <button className={"button" + ` ${className || ""}`} {...props} />
}

function PrimaryButton({ className, ...props }: ElementProps<"button">) {
  return (
    <ButtonBase
      className={
        `bg-primary hover:bg-primary-highlight dark:hover:bg-primary-highlight-dark` +
        ` ${className || ""}`
      }
      {...props}
    />
  )
}

function SecondaryButton({ className, ...props }: ElementProps<"button">) {
  return (
    <ButtonBase
      className={`bg-gray-500 hover:bg-gray-700` + ` ${className || ""}`}
      {...props}
    />
  )
}

function DefaultButton({ className, ...props }: ElementProps<"button">) {
  return (
    <ButtonBase
      className={`bg-gray-200 hover:bg-gray-400` + ` ${className || ""}`}
      {...props}
    />
  )
}
