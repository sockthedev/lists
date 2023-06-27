import type { StackContext } from "sst/constructs"

export function DNS(ctx: StackContext) {
  const zone = "sockthedev.com"

  return {
    zone: zone,
    domain:
      ctx.app.stage === "production"
        ? `pwa.${zone}`
        : `pwa.${ctx.app.stage}.${zone}`,
  }
}
