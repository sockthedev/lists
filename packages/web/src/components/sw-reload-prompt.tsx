import { useRegisterSW } from "virtual:pwa-register/react"

export function SwReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
      console.log("SW Registered: " + r)
    },
    onRegisterError(error) {
      console.log("SW registration error", error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="h-0 w-0">
      {(offlineReady || needRefresh) && (
        <div className="border-primary fixed bottom-0 right-0 z-10 m-4 border p-3">
          <div className="mb-2">
            {offlineReady ? (
              <span>App ready to work offline</span>
            ) : (
              <span>
                New content available, click on reload button to update.
              </span>
            )}
          </div>
          {needRefresh && (
            <button className="" onClick={() => updateServiceWorker(true)}>
              Reload
            </button>
          )}
          <button className="" onClick={() => close()}>
            Close
          </button>
        </div>
      )}
    </div>
  )
}
