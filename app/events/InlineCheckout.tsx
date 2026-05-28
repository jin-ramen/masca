'use client'

import { useEffect, useState } from "react"

const EB_WIDGET_SRC = "https://www.eventbrite.com/static/widgets/eb_widgets.js"
const LOAD_TIMEOUT_MS = 10_000

declare global {
  interface Window {
    EBWidgets?: {
      createWidget: (options: {
        widgetType: "checkout"
        eventId: string
        iframeContainerId?: string
        iframeContainerHeight?: number
        onOrderComplete?: () => void
        promoCode?: string
        themeSettings?: {
          brandColor?: string
          fontColor?: string
          background?: string
        }
      }) => void
    }
  }
}

// Load eb_widgets.js exactly once per page.
let widgetReady: Promise<void> | null = null
function loadEbWidgets(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.EBWidgets) return Promise.resolve()
  if (!widgetReady) {
    widgetReady = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script")
      s.src = EB_WIDGET_SRC
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error("Failed to load Eventbrite widgets"))
      document.body.appendChild(s)
    })
  }
  return widgetReady
}

type Status = "loading" | "ready" | "error"

/**
 * Embeds Eventbrite's inline checkout for a single event, with a loading
 * skeleton shown until the iframe finishes loading. No token needed — embedded
 * checkout is public and keyed only by the numeric event id.
 */
export default function InlineCheckout({ eventId }: { eventId: string }) {
  const containerId = `eb-checkout-container-${eventId}`
  const [status, setStatus] = useState<Status>("loading")

  useEffect(() => {
    let cancelled = false
    let observer: MutationObserver | null = null
    let timeout: ReturnType<typeof setTimeout> | null = null

    setStatus("loading")

    loadEbWidgets()
      .then(() => {
        const container = document.getElementById(containerId)
        if (cancelled || !window.EBWidgets || !container) return
        container.innerHTML = "" // reset on re-run so iframes don't stack

        // Eventbrite injects the iframe asynchronously; reveal it only once it
        // has actually loaded so the checkout doesn't pop in unstyled.
        observer = new MutationObserver(() => {
          const iframe = container.querySelector("iframe")
          if (!iframe) return
          observer?.disconnect()
          const reveal = () => {
            if (cancelled) return
            if (timeout) clearTimeout(timeout)
            setStatus("ready")
          }
          if (iframe.contentDocument?.readyState === "complete") reveal()
          else iframe.addEventListener("load", reveal, { once: true })
        })
        observer.observe(container, { childList: true, subtree: true })

        // Safety net: if nothing loads, surface a fallback instead of an
        // endless skeleton (e.g. embedded checkout disabled for this event).
        timeout = setTimeout(() => {
          if (!cancelled) setStatus("error")
        }, LOAD_TIMEOUT_MS)

        window.EBWidgets.createWidget({
          widgetType: "checkout",
          eventId,
          iframeContainerId: containerId,
          iframeContainerHeight: 700,
          themeSettings: {
            brandColor: "#010066", // --color-blue-600
            fontColor: "#000000", // --color-black
            background: "#ffffff", // --color-white
          },
        })
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })

    return () => {
      cancelled = true
      observer?.disconnect()
      if (timeout) clearTimeout(timeout)
    }
  }, [eventId, containerId])

  return (
    <div className="relative min-h-175 w-full">
      {/* Eventbrite injects its iframe here; kept mounted so the widget loads. */}
      <div id={containerId} className="w-full" />

      {status === "loading" && <CheckoutSkeleton />}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white text-center">
          <p className="text-body text-gray-700">
            The checkout couldn&apos;t load here.
          </p>
          <a
            href={`https://www.eventbrite.com/e/${eventId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-sm font-bold text-blue-600 hover:underline"
          >
            Register on Eventbrite <span aria-hidden>&rarr;</span>
          </a>
        </div>
      )}
    </div>
  )
}

/** On-brand skeleton resembling the checkout's ticket rows + CTA. */
function CheckoutSkeleton() {
  return (
    <div className="absolute inset-0 flex flex-col gap-6 rounded-2xl bg-white p-6">
      <div className="flex items-center gap-3 text-blue-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
        <span className="text-body-sm font-bold">Loading checkout…</span>
      </div>

      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border-2 border-blue-100 p-4"
          >
            <div className="flex flex-col gap-2">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="mt-auto h-12 w-full animate-pulse rounded-lg bg-blue-100" />
    </div>
  )
}