import { faGoogle, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button.tsx"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Seperator } from "@/components/ui/seperator.tsx"
import { useLoginUrls } from "@/context/auth"

const emailFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export function Login() {
  const loginUrls = useLoginUrls()

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  })

  function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    console.log(values)
    throw new Error("Not implemented")
  }

  return (
    <>
      <h2 className="text-primary mt-8 text-2xl font-bold leading-9 tracking-tight">
        Sign in to Lists
      </h2>

      <div className="mt-6">
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <FormField
              name="email"
              control={emailForm.control}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  {!fieldState.error && (
                    <FormDescription>
                      We'll send you an email with a sign in link.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button type="submit" size="sm" className="gap-3">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Sign in
              </Button>
              <span />
            </div>
          </form>
        </Form>
      </div>

      <div className="mt-10">
        <Seperator label="Or continue with" />

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button asChild size="sm" className="gap-3">
            <a href={loginUrls.google()}>
              <FontAwesomeIcon
                icon={faGoogle}
                className="h-4 w-4"
                aria-hidden="true"
              />
              Google
            </a>
          </Button>

          <Button asChild size="sm" className="gap-3">
            <a href={loginUrls.twitter()}>
              <FontAwesomeIcon
                icon={faTwitter}
                className="h-4 w-4"
                aria-hidden="true"
              />
              Twitter
            </a>
          </Button>
        </div>
      </div>
    </>
  )
}
