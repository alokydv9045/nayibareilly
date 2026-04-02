import { Page } from '@playwright/test'

/**
 * Login as a test citizen user
 */
export async function loginCitizen(page: Page) {
  // Navigate to login page
  await page.goto('/login')
  
  // Fill in test credentials
  const emailInput = page.getByLabel(/email/i)
  const passwordInput = page.getByLabel(/password/i)
  
  await emailInput.fill(process.env.E2E_USER_EMAIL || 'test@example.com')
  await passwordInput.fill(process.env.E2E_USER_PASSWORD || 'Password123!')
  
  // Submit login form
  const loginButton = page.getByRole('button', { name: /sign in|login/i })
  await loginButton.click()
  
  // Wait for successful login (redirect or dashboard)
  await page.waitForURL('/app/**', { timeout: 10000 })
}

/**
 * Logout from the application
 */
export async function logout(page: Page) {
  // Click on user menu/avatar
  const userMenu = page.getByRole('button', { name: /user menu|profile/i })
  await userMenu.click()
  
  // Click logout
  const logoutButton = page.getByRole('menuitem', { name: /logout|sign out/i })
  await logoutButton.click()
  
  // Wait for redirect to login
  await page.waitForURL('/login', { timeout: 5000 })
}
