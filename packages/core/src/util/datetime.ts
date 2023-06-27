import day from "dayjs"
import timezonePlugin from "dayjs/plugin/timezone.js"
import utcPlugin from "dayjs/plugin/utc.js"

day.extend(utcPlugin)
day.extend(timezonePlugin)

export function dbNow(): string {
  return day().utc().format("YYYY-MM-DDTHH:mm:ss")
}
