import { cn } from "@/lib/cn"

export type SeperatorProps = {
  className?: string
  label?: string
}

export const Seperator: React.FC<SeperatorProps> = (props) => {
  return (
    <div className={cn("relative mb-5 mt-8 font-medium", props.className)}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm leading-6">
        {props.label && (
          <span className="bg-background px-6 text-center text-primary">
            {props.label}
          </span>
        )}
        {!props.label && (
          <span className="px-6 text-primary opacity-0">foo</span>
        )}
      </div>
    </div>
  )
}
