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
import { useCreateItemMutator, useSubscribe } from "@/context/replicache"
import { ItemStore } from "@/data/item"
import { ListStore } from "@/data/list"

import { useZodParams } from "../lib/use-zod-params"

const formSchema = z.object({
  description: z.string().min(1, "Please enter description for your item"),
})

export function ListDetail() {
  const params = useZodParams(z.object({ listId: z.string() }))

  const list = useSubscribe(
    (tx) => ListStore.fromId(tx, { id: params.listId }),
    undefined,
    [params.listId],
  )

  const items = useSubscribe(
    (tx) => ItemStore.byListId(tx, { listId: params.listId }),
    [],
    [params.listId],
  )

  const createItem = useCreateItemMutator()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  })

  React.useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset({ description: "" })
    }
  }, [form, form.formState.isSubmitSuccessful])

  const handleSubmit = React.useCallback(
    (input: { description: string }) => {
      createItem({ listId: params.listId, description: input.description })
    },
    [params.listId, createItem],
  )

  if (!list) {
    return null
  }

  return (
    <PageLayout.NarrowContent>
      <H1>{list.name}</H1>

      {items.map((item) => (
        <div key={item.id}>
          <p>{item.description}</p>
        </div>
      ))}

      <Seperator label="Add Item" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl onSubmit={form.handleSubmit(handleSubmit)}>
                  <Input type="text" placeholder="Buy cheese" {...field} />
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
