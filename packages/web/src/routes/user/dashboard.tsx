import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
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
import { useCreateListMutator, useSubscribe } from "@/context/replicache"
import { ListStore } from "@/data/list"

const formSchema = z.object({
  name: z.string().min(1, "Please enter a name for your list."),
})

export function UserDashboard() {
  const lists = useSubscribe(ListStore.all, [])
  const createList = useCreateListMutator()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  React.useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset({ name: "" })
    }
  }, [form, form.formState.isSubmitSuccessful])

  return (
    <PageLayout.NarrowContent>
      <H1>My Lists</H1>

      {lists.map((list) => (
        <div key={list.id}>
          <p>
            <Link to={`/user/lists/${list.id}`}>{list.name}</Link>
          </p>
        </div>
      ))}

      <Seperator label="Create List" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(createList)}>
          <FormField
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl onSubmit={form.handleSubmit(createList)}>
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
