'use client'

import Script from "next/script"

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
        onOrderComplete?: () => void
        promoCode?: string
      }) => void
    }
  }
}

/**
 * Opens Eventbrite's hosted checkout in a modal overlay, keyed by the numeric
 * event id. No token needed — embedded checkout is public. The event must have
 * embedded checkout enabled in Eventbrite (Manage event → Settings) or the
 * modal won't open.
 */
export default function CheckoutButton({
  eventId,
  label = "Register",
}: {
  eventId: string
  label?: string
}) {
  const triggerId = `eb-checkout-trigger-${eventId}`

  return (
    <>
      <Script
        src={EB_WIDGET_SRC}
        strategy="afterInteractive"
        // onReady (not onLoad) fires on every mount, even when the script was
        // already cached by another card — so each button registers its widget.
        onReady={() => {
          window.EBWidgets?.createWidget({
            widgetType: "checkout",
            eventId,
            modalTriggerElementId: triggerId,
          })
        }}
      />
      <Button id={triggerId} type="button" variant="ghost">
        {label} <span aria-hidden>&rarr;</span>
      </Button>
    </>
  )
}