import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Scans a shortlist of key public pages for serious/critical a11y issues.
// We allow minor issues to be handled later, focusing the gate on severity "serious" and above.
const pages = ['/', '/about', '/contact', '/report']

test.describe('Accessibility scan (axe)', () => {
  for (const path of pages) {
    test(`axe: ${path}`, async ({ page }) => {
      await page.goto(path)

      // Ensure page is rendered and main landmark exists
      await expect(page.locator('main')).toBeVisible()

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('.Toastify')
        .analyze()

      const serious = results.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))

      if (serious.length) {
        console.error(`Axe serious/critical issues on ${path}:`)
        for (const v of serious) {
          console.error(`- ${v.id}: ${v.description} (impact: ${v.impact})`)
          for (const n of v.nodes.slice(0, 3)) {
            console.error(`  selector: ${n.target.join(' ')}`)
          }
        }
      }

      expect.soft(serious, `No serious/critical a11y issues on ${path}`).toHaveLength(0)
    })
  }
})
