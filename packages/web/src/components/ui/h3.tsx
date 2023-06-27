// https://ui.shadcn.com/docs/components/typography

import { cn } from "@/lib/cn"

export const H3: React.FC<React.ComponentProps<"h3">> = (props) => {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        props.className,
      )}
    >
      {props.children}
    </h2>
  )
}
