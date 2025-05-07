import { Link as RouterLink, type LinkProps } from "kaioken/router"

export function Link(props: LinkProps) {
  return (
    <RouterLink className="text-blue-500" {...props}>
      {props.children}
    </RouterLink>
  )
}
