import mitt from "mitt"

type Events = {
  poke: {
    listId: string
  }
}

export const bus = mitt<Events>()
