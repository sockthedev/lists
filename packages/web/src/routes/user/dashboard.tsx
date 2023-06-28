import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { H1 } from "@/components/ui/h1"
import { Input } from "@/components/ui/input"
import { PageLayout } from "@/components/ui/page-layout"
import { Seperator } from "@/components/ui/seperator"

const createListFormSchema = z.object({
  name: z.string().min(1, "Please enter a name for your list."),
})

export function UserDashboard() {
  const createListForm = useForm<z.infer<typeof createListFormSchema>>({
    resolver: zodResolver(createListFormSchema),
    defaultValues: {
      name: "",
    },
  })

  function onCreateListSubmit(values: z.infer<typeof createListFormSchema>) {
    console.log(values)
    throw new Error("Not implemented")
  }

  return (
    <PageLayout.NarrowContent>
      <H1>My Lists</H1>

      <Seperator label="Create a new list" />

      <Form {...createListForm}>
        <form onSubmit={createListForm.handleSubmit(onCreateListSubmit)}>
          <FormField
            name="name"
            control={createListForm.control}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                {!fieldState.error && (
                  <FormDescription>
                    Provide a descriptive name for your new list
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button type="submit" size="sm" className="gap-3">
              Create
            </Button>
            <span />
          </div>
        </form>
      </Form>
    </PageLayout.NarrowContent>
  )
}
