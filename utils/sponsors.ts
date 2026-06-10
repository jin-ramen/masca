// Sponsor logos for the homepage marquee.
//
// Source of truth is a Notion database. When NOTION_TOKEN and
// NOTION_SPONSORS_DB_ID are set, `getSponsors()` queries Notion; otherwise it
// returns an empty list (the marquee simply renders nothing).
//
// Notion database property names (must match exactly, case-sensitive):
//   name  Title  — sponsor name (used as the logo's alt text)
//   date  Date   — when they came on board; sorts newest first
//   img   URL    — logo image URL (Cloudinary, etc.)

export type Sponsor = {
  id: string
  name: string
  date: string
  img: string
}

/**
 * Returns sponsors sorted by `date` (newest first). Reads from Notion when
 * configured, otherwise an empty list.
 */
export async function getSponsors(): Promise<Sponsor[]> {
  const sponsors = await loadSponsors()
  return sponsors.sort((a, b) => b.date.localeCompare(a.date))
}

// ---------------------------------------------------------------------------
// Notion integration
// ---------------------------------------------------------------------------

async function loadSponsors(): Promise<Sponsor[]> {
  const token = process.env.NOTION_TOKEN
  const databaseId = process.env.NOTION_SPONSORS_DB_ID
  if (!token || !databaseId) return []

  const sponsors: Sponsor[] = []
  let cursor: string | undefined

  do {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cursor ? { start_cursor: cursor } : {}),
        // In production, cache the response and refresh every 30 min so edits
        // appear without a redeploy and Notion isn't hit per request. In dev,
        // skip the cache entirely so Notion changes show on the next reload.
        ...(process.env.NODE_ENV === "development"
          ? { cache: "no-store" as const }
          : { next: { revalidate: 1800 } }),
      },
    )

    if (!res.ok) {
      // Don't take the whole page down if Notion hiccups — log and fall back.
      console.error(`Notion sponsors query failed: ${res.status} ${await res.text()}`)
      return sponsors
    }

    const data = (await res.json()) as { results: NotionPage[]; has_more: boolean; next_cursor: string | null }
    for (const page of data.results) sponsors.push(mapPage(page))
    cursor = data.has_more ? data.next_cursor ?? undefined : undefined
  } while (cursor)

  return sponsors
}

// Minimal shapes for just the Notion property types this database uses.
type NotionText = { plain_text: string }
type NotionPage = {
  id: string
  properties: Record<string, {
    title?: NotionText[]
    rich_text?: NotionText[]
    date?: { start: string } | null
    url?: string | null
  }>
}

function mapPage(page: NotionPage): Sponsor {
  const p = page.properties
  const text = (v?: NotionText[]) => (v ?? []).map((t) => t.plain_text).join("")

  return {
    id: page.id,
    name: text(p.name?.title),
    // Date property, with a rich_text fallback in case it's stored as text.
    date: p.date?.date?.start ?? text(p.date?.rich_text),
    // URL property, with a rich_text fallback in case it's stored as text.
    img: p.img?.url ?? text(p.img?.rich_text),
  }
}
