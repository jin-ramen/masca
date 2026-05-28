import Button from "@/components/Button"
import { getUpcomingEvents } from "@/utils/events"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const

/** Parse Eventbrite's "local" ISO ("2026-07-03T09:00:00") into y/m/d. */
function ymd(local: string) {
  const [y, m, d] = local.split("T")[0].split("-").map(Number)
  return { y, m, d }
}

/** "3 July 2026" (single day) or "3–5 July 2026" (multi-day in one month). */
function dateRange(startLocal: string, endLocal: string) {
  const s = ymd(startLocal)
  const e = ymd(endLocal)
  if (s.y === e.y && s.m === e.m) {
    const days = s.d === e.d ? `${s.d}` : `${s.d}–${e.d}`
    return `${days} ${MONTHS[s.m - 1]} ${s.y}`
  }
  return `${s.d} ${MONTHS[s.m - 1]} – ${e.d} ${MONTHS[e.m - 1]} ${e.y}`
}

export default async function UpcomingEvent() {
  // Ordered start_asc in getUpcomingEvents, so the first is the next one up.
  const [event] = await getUpcomingEvents()
  if (!event) return null

  const location = event.venue?.name ?? "Online"
  const when = dateRange(event.start.local, event.end.local)
  const host = event.organizer?.name ?? "MASCA"
  const soldOut = event.ticket_availability?.is_sold_out === true

  return (
    <div className="flex flex-col gap-4 items-start border border-blue-100/20 rounded-lg bg-blue-500 mx-8 p-8">
      <span className="eyebrow text-yellow-500">Next Major Event</span>
      <span className="text-white text-xl font-bold">{event.name.text}</span>
      <div className="flex flex-col gap-1">
        <span className="text-caption text-gray-300">
          {location} &middot; {when}
        </span>
        <span className="text-caption text-gray-300">Hosted by {host}</span>
      </div>
      <a href={event.url} target="_blank" rel="noopener noreferrer">
        <Button variant="secondary" className="py-1">
          {soldOut ? "Sold out" : "Register now"}
        </Button>
      </a>
    </div>
  )
}