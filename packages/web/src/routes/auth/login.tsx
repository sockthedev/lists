import { faGoogle, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
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
import { Input } from "@/components/ui/input"
import { Seperator } from "@/components/ui/seperator"
import { useAuth } from "@/context/auth"

const emailFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export function Login() {
  const auth = useAuth()

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  })

  function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    console.log(values)
  }

  return (
    <>
      <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-primary">
        Sign in to Lists
      </h2>

      <div>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <div className="mt-2">
              <FormField
                name="email"
                control={emailForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please provide your email address to sign in
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            <a href={auth.loginUrls.google()}>
              <FontAwesomeIcon
                icon={faGoogle}
                className="h-4 w-4"
                aria-hidden="true"
              />
              Google
            </a>
          </Button>

          <Button asChild size="sm" className="gap-3">
            <a href={auth.loginUrls.twitter()}>
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
