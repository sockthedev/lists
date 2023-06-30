import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { H1 } from "@/components/ui/h1"
import { Input } from "@/components/ui/input"
import { PageLayout } from "@/components/ui/page-layout"
import { Seperator } from "@/components/ui/seperator"
import { useCreateList, useSubscribeLists } from "@/context/replicache"

const createListFormSchema = z.object({
  name: z.string().min(1, "Please enter a name for your list."),
})

export function UserDashboard() {
  const lists = useSubscribeLists()
  const createList = useCreateList()

  const createListForm = useForm<z.infer<typeof createListFormSchema>>({
    resolver: zodResolver(createListFormSchema),
    defaultValues: {
      name: "",
    },
  })

  React.useEffect(() => {
    if (createListForm.formState.isSubmitSuccessful) {
      createListForm.reset({ name: "" })
    }
  }, [createListForm, createListForm.formState.isSubmitSuccessful])

  return (
    <PageLayout.NarrowContent>
      <H1>My Lists</H1>

      {lists.map((list) => (
        <div key={list.id}>
          <p>{list.name}</p>
        </div>
      ))}

      <Seperator label="Create" />

      <Form {...createListForm}>
        <form onSubmit={createListForm.handleSubmit(createList)}>
          <FormField
            name="name"
            control={createListForm.control}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl onSubmit={createListForm.handleSubmit(createList)}>
                  <Input type="text" placeholder="Bucket List" {...field} />
                </FormControl>
                {!fieldState.error && (
                  <FormDescription>
                    Just type something and hit enter.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </PageLayout.NarrowContent>
  )
}
