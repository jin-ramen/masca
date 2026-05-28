'use client'

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import Button from "@/components/Button"

const EB_WIDGET_SRC = "https://www.eventbrite.com/static/widgets/eb_widgets.js"

declare global {
  interface Window {
    EBWidgets?: {
      createWidget: (options: {
        widgetType: "checkout"
        eventId: string
        modalTriggerElementId?: string
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

// Load eb_widgets.js exactly once, shared across every card on the page.
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

/**
 * Renders Eventbrite's *inline* embedded checkout inside our own modal — the
 * widget no longer honours `modalTriggerElementId`, so we recreate the popup
 * UX ourselves. The dialog is portaled to <body> so the card's GSAP transforms
 * don't break `position: fixed`. No token needed; embedded checkout is public.
 */
export default function CheckoutButton({
  eventId,
  label = "Register",
}: {
  eventId: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const containerId = `eb-checkout-container-${eventId}`

  // Build the checkout iframe once the modal (and its container) is mounted.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    loadEbWidgets()
      .then(() => {
        const container = document.getElementById(containerId)
        if (cancelled || !window.EBWidgets || !container) return
        container.innerHTML = "" // reset so reopening builds a fresh iframe
        window.EBWidgets.createWidget({
          widgetType: "checkout",
          eventId,
          iframeContainerId: containerId,
          iframeContainerHeight: 640,
          themeSettings: {
            brandColor: "#010066", // --color-blue-600
            fontColor: "#000000", // --color-black
            background: "#ffffff", // --color-white
          },
        })
      })
      .catch(() => {
        /* network/embed failure — modal just shows an empty container */
      })
    return () => {
      cancelled = true
    }
  }, [open, eventId, containerId])

  // Lock body scroll + close on Escape while the modal is open.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <>
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
        {label} <span aria-hidden>&rarr;</span>
      </Button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Event checkout"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close checkout"
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 shadow-md transition-colors hover:bg-blue-50"
              >
                <span aria-hidden>&times;</span>
              </button>
              <div id={containerId} />
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}