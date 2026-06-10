// Committee member directory.
//
// Source of truth is a Notion database. When NOTION_TOKEN and
// NOTION_COMMITTEE_DB_ID are set, `getCommittee()` queries Notion; otherwise it
// falls back to the hand-written MOCK below so the page still renders in local
// dev before the integration is wired up.
//
// Notion database property names (must match exactly, case-sensitive):
//   name         Title    — member's full name
//   role         Select   — committee position
//   img          URL      — Cloudinary image URL
//   year         Select   — committee term, e.g. "2026/2027"
//   order        Number   — sort key within a year's grid
//   linkedin_url URL      — optional LinkedIn profile
//   bio          Text     — shown in the expanded modal

export type CommitteeMember = {
  id: string
  name: string
  role: string
  img: string
  year: string
  order: number
  linkedin_url?: string
  bio: string
}

// Cloudinary's public demo cloud — stand-in portraits until the real assets
// are uploaded. Cropped to a portrait frame, focused on faces.
const portrait = (asset: string) =>
  `https://res.cloudinary.com/demo/image/upload/c_fill,g_face,w_640,h_800,q_auto,f_auto/${asset}.jpg`

const MOCK: CommitteeMember[] = [
  {
    id: "ava-tan",
    name: "Ava Tan",
    role: "President",
    img: portrait("woman"),
    year: "2026/2027",
    order: 1,
    linkedin_url: "https://www.linkedin.com/in/example-ava",
    bio: "Final-year Commerce student at the University of Melbourne. Ava leads MASCA's national strategy and represents Malaysian students to partners and government. She believes the council's job is to make a big country feel a little smaller for everyone who's just arrived.",
  },
  {
    id: "daniel-lim",
    name: "Daniel Lim",
    role: "Vice President",
    img: portrait("face_left"),
    year: "2026/2027",
    order: 2,
    linkedin_url: "https://www.linkedin.com/in/example-daniel",
    bio: "Engineering student at UNSW and MASCA's second-in-command. Daniel keeps the chapters in sync, chairs the monthly council, and quietly makes sure nothing falls through the cracks between Perth and Auckland.",
  },
  {
    id: "mei-wong",
    name: "Mei Wong",
    role: "Secretary General",
    img: portrait("lady"),
    year: "2026/2027",
    order: 3,
    linkedin_url: "https://www.linkedin.com/in/example-mei",
    bio: "Law student at Monash with a memory like a steel trap. Mei runs the paperwork, the minutes, and the institutional memory that keeps MASCA's handover smooth year after year.",
  },
  {
    id: "ryan-cheah",
    name: "Ryan Cheah",
    role: "Treasurer",
    img: portrait("model"),
    year: "2026/2027",
    order: 4,
    linkedin_url: "https://www.linkedin.com/in/example-ryan",
    bio: "Accounting student at the University of Sydney. Ryan stewards the council's finances and sponsorship relationships, and is the reason every chapter event still breaks even.",
  },
  {
    id: "sarah-ng",
    name: "Sarah Ng",
    role: "President",
    img: portrait("lady"),
    year: "2025/2026",
    order: 1,
    linkedin_url: "https://www.linkedin.com/in/example-sarah",
    bio: "Led MASCA through its 24th year, growing the council to seven active chapters and laying the groundwork for the national welfare program.",
  },
]

/**
 * Returns committee members sorted by `order` ascending, optionally filtered to
 * a single `year`. Reads from Notion when configured, otherwise the mock.
 */
export async function getCommittee(year?: string): Promise<CommitteeMember[]> {
  const members = await loadMembers()
  return members
    .filter((m) => year === undefined || m.year === year)
    .sort((a, b) => a.order - b.order)
}

/** Unique years present in the data, newest first — drives the tab nav. */
export function getCommitteeYears(members: CommitteeMember[]): string[] {
  return [...new Set(members.map((m) => m.year))].sort((a, b) => b.localeCompare(a))
}

// ---------------------------------------------------------------------------
// Notion integration
// ---------------------------------------------------------------------------

async function loadMembers(): Promise<CommitteeMember[]> {
  const token = process.env.NOTION_TOKEN
  const databaseId = process.env.NOTION_COMMITTEE_DB_ID
  if (!token || !databaseId) return MOCK

  const members: CommitteeMember[] = []
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
      console.error(`Notion query failed: ${res.status} ${await res.text()}`)
      return members.length ? members : MOCK
    }

    const data = (await res.json()) as { results: NotionPage[]; has_more: boolean; next_cursor: string | null }
    for (const page of data.results) members.push(mapPage(page))
    cursor = data.has_more ? data.next_cursor ?? undefined : undefined
  } while (cursor)

  return members
}

// Minimal shapes for just the Notion property types this database uses.
type NotionText = { plain_text: string }
type NotionPage = {
  id: string
  properties: Record<string, {
    title?: NotionText[]
    rich_text?: NotionText[]
    select?: { name: string } | null
    number?: number | null
    url?: string | null
  }>
}

function mapPage(page: NotionPage): CommitteeMember {
  const p = page.properties
  const text = (v?: NotionText[]) => (v ?? []).map((t) => t.plain_text).join("")

  return {
    id: page.id,
    name: text(p.name?.title),
    role: p.role?.select?.name ?? text(p.role?.rich_text),
    img: p.img?.url ?? text(p.img?.rich_text),
    year: p.year?.select?.name ?? text(p.year?.rich_text),
    order: p.order?.number ?? 0,
    // Stored as rich_text in this DB; fall back to a real url-type too. Empty
    // string coalesces to undefined so the link is hidden when unset.
    linkedin_url: (p.linkedin_url?.url ?? text(p.linkedin_url?.rich_text)) || undefined,
    bio: text(p.bio?.rich_text),
  }
}
