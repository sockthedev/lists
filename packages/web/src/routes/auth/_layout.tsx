import { Outlet } from "react-router-dom"

// TODO: Need to get images for this layout

export default function AuthLayout() {
  return (
    <>
      <div className="flex min-h-full flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center">
              <img
                className="inline h-20 w-20"
                src="/images/logo-v2.svg"
                alt="Lists"
              />
            </div>
            <div className="mt-10">
              <Outlet />
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/images/full-bg-budgie.svg"
            alt=""
          />
        </div>
      </div>
    </>
  )
}
