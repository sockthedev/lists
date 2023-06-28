// https://ui.shadcn.com/docs/components/typography

import { cn } from "@/lib/cn.ts"

export type H1Props = React.ComponentProps<"h1">

export const H1: React.FC<H1Props> = (props) => {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        props.className,
      )}
    >
      {props.children}
    </h1>
  )
}
