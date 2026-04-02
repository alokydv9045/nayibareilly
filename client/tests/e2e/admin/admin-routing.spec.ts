import { test, expect } from '@playwright/test'

// These tests assert basic guard behavior without real login
// They rely on middleware redirects and public pages loading.

test.describe('Admin routing guards', () => {
  test('unauthenticated /admin redirects to /login', async ({ page }) => {
    const res = await page.goto('/admin')
    // Should redirect
    expect(res?.status()).toBeLessThan(400)
    await page.waitForURL('**/login')
    await expect(page.getByText(/welcome back/i)).toBeVisible()
  })

  test('login page is accessible', async ({ page }) => {
    const res = await page.goto('/login')
    expect(res?.status()).toBeLessThan(400)
    await expect(page.getByText(/welcome back/i)).toBeVisible()
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/password/i)).toBeVisible()
  })

  test('non-admin protected page redirects unauthenticated to login', async ({ page }) => {
    const res = await page.goto('/admin/super-admin')
    expect(res?.status()).toBeLessThan(400)
    await page.waitForURL('**/login')
  })
})
