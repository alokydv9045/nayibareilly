import { test, expect } from '@playwright/test'
import { loginCitizen } from './helpers/auth'

test.describe('Notifications', () => {
  test('mark all notifications as read', async ({ page }) => {
    await loginCitizen(page)
    await page.goto('/app/notifications')

    // Check if mark all button exists
    const markAllButton = page.getByRole('button', { name: /mark all as read/i })
    
    // If there are notifications, test the mark all read function
    const notificationItems = page.locator('[data-testid="notification-item"]')
    const count = await notificationItems.count()
    
    if (count > 0) {
      await expect(markAllButton).toBeVisible()
      await markAllButton.click()
      
      // Verify notifications are marked as read or list is empty
      await expect(page.getByText(/no new notifications|all caught up/i)).toBeVisible({ timeout: 5000 })
    } else {
      // If no notifications, just verify the empty state
      await expect(page.getByText(/no notifications/i)).toBeVisible()
    }
  })
}) 