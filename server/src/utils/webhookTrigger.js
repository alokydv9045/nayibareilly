import prisma from '../config/prisma.js'

export const triggerWebhooks = async (event, payload) => {
  try {
    const webhooks = await prisma.webhookConfig.findMany({
      where: { isActive: true }
    })

    const matchingWebhooks = webhooks.filter(w => 
      w.events.includes(event) || w.events.includes('*')
    )

    if (matchingWebhooks.length === 0) return

    console.log(`Triggering ${matchingWebhooks.length} webhooks for event ${event}`)

    const promises = matchingWebhooks.map(async (webhook) => {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-NayiBareilly-Event': event,
            'X-NayiBareilly-Signature': 'mock_signature_sha256'
          },
          body: JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            data: payload
          })
        })

        console.log(`Webhook ${webhook.name} (${webhook.url}) response status: ${response.status}`)
      } catch (err) {
        console.error(`Failed to trigger webhook ${webhook.name} (${webhook.url}):`, err.message)
      }
    })

    // Dispatch asynchronously
    Promise.all(promises).catch(err => console.error('Error in webhook dispatch:', err))
  } catch (error) {
    console.error('Failed to trigger webhooks:', error)
  }
}
