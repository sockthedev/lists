import mitt from "mitt"

type Events = {
  poke: {}
}

export const bus = mitt<Events>()
