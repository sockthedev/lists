import mitt from "mitt"

type Events = {
  poke: {
    workspaceId: string
  }
}

export const bus = mitt<Events>()
