import { cn } from "@/lib/cn.ts"

const StandardShell: React.FC<{
  children: React.ReactNode
  className?: string
}> = (props) => {
  return (
    <div
      className={cn(
        "mx-auto flex h-full max-w-7xl flex-col px-8 lg:px-16",
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}

const Main: React.FC<{ children: React.ReactNode; className?: string }> = (
  props,
) => {
  return (
    <main className={cn("my-8 flex flex-grow flex-col", props.className)}>
      {props.children}
    </main>
  )
}

const NarrowContent: React.FC<{ children: React.ReactNode }> = (props) => {
  return <div className="mx-auto max-w-2xl">{props.children}</div>
}

const Section: React.FC<{ children: React.ReactNode }> = (props) => {
  return <section className="my-8">{props.children}</section>
}

export const PageLayout = {
  StandardShell,
  Main,
  NarrowContent,
  Section,
}
