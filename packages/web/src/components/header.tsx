import { faBars, faX } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as Dialog from "@radix-ui/react-dialog"
import { Link } from "react-router-dom"

import { ActionLink } from "./ui/action-link"
import { PageLayout } from "./ui/page-layout"

const mainNavigation = {
  anonymous: [{ name: "About", href: "/about" }],
  loggedIn: [{ name: "My Lists", href: "/user" }],
}

const rightNavigation = {
  anonymous: [{ name: "Sign in", href: "/auth/login" }],
  loggedIn: [{ name: "Sign out", href: "/auth/sign-out" }],
}

export type HeaderProps = {
  loggedIn?: boolean
}

export const Header: React.FC<HeaderProps> = (props) => {
  const mainNav = props.loggedIn
    ? mainNavigation.loggedIn
    : mainNavigation.anonymous

  const rightNav = props.loggedIn
    ? rightNavigation.loggedIn
    : rightNavigation.anonymous

  return (
    <header>
      <Dialog.Root>
        <nav
          className="flex items-center justify-between pb-6 lg:pb-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Lists</span>
              <img className="h-14 w-auto" src="/images/logo-v2.svg" alt="" />
            </Link>
          </div>

          <div className="flex lg:hidden">
            <Dialog.Trigger>
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Open main menu</span>
                <FontAwesomeIcon
                  icon={faBars}
                  className="h-6 w-6"
                  aria-hidden
                />
              </button>
            </Dialog.Trigger>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            {rightNav.map((item) => (
              <ActionLink key={item.name} to={item.href}>
                {item.name}
              </ActionLink>
            ))}
          </div>
        </nav>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-10 w-full max-w-full overflow-y-auto bg-white">
            <PageLayout.StandardShell>
              <div className="flex items-center justify-between">
                <Link to="/" className="-m-1.5 p-1.5">
                  <span className="sr-only">Lists</span>
                  <img
                    className="h-14 w-auto"
                    src="/images/logo-v2.svg"
                    alt=""
                  />
                </Link>
                <Dialog.Close>
                  <button
                    type="button"
                    className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  >
                    <span className="sr-only">Close menu</span>
                    <FontAwesomeIcon
                      icon={faX}
                      className="h-6 w-6"
                      aria-hidden
                    />
                  </button>
                </Dialog.Close>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    {mainNav.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6">
                    {rightNav.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </PageLayout.StandardShell>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  )
}
