import type { LinkProps } from "react-router-dom"
import { Link } from "react-router-dom"

import { cn } from "@/lib/cn"

export const ActionLink: React.FC<LinkProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <Link
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1 text-sm font-semibold text-primary duration-200 hover:text-brand focus:outline-none focus-visible:outline-gray-600",
        className,
      )}
    >
      {children} <span aria-hidden="true"> &rarr; </span>
    </Link>
  )
}
