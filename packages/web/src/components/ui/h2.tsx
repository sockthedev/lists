// https://ui.shadcn.com/docs/components/typography

import { cn } from "@/lib/cn.ts"

export const H2: React.FC<React.ComponentProps<"h2">> = (props) => {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
        props.className,
      )}
    >
      {props.children}
    </h2>
  )
}
