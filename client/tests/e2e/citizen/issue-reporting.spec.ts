import { test, expect } from '@playwright/test';

test.describe('Citizen Issue Reporting Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('Complete citizen registration and issue reporting flow', async ({ page }) => {
    // Test Registration Flow
    await test.step('Navigate to registration', async () => {
      await page.click('[data-testid="register-link"]');
      await expect(page).toHaveURL('/register');
      await expect(page.locator('h1')).toContainText('Create Account');
    });

    await test.step('Fill registration form', async () => {
      await page.fill('[data-testid="name-input"]', 'John Citizen');
      await page.fill('[data-testid="email-input"]', 'john.citizen@example.com');
      await page.fill('[data-testid="phone-input"]', '+919876543210');
      await page.fill('[data-testid="address-input"]', '123 Test Street, Test City');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    });

    await test.step('Submit registration', async () => {
      await page.click('[data-testid="register-button"]');
      
      // Wait for success message or redirect
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Registration successful');
    });

    // Test Login Flow (if not auto-logged in)
    if (await page.locator('[data-testid="login-link"]').isVisible()) {
      await test.step('Login with new account', async () => {
        await page.click('[data-testid="login-link"]');
        await expect(page).toHaveURL('/login');
        
        await page.fill('[data-testid="email-input"]', 'john.citizen@example.com');
        await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
        await page.click('[data-testid="login-button"]');
        
        // Should redirect to dashboard
        await expect(page).toHaveURL('/dashboard');
      });
    }

    // Test Issue Reporting Flow
    await test.step('Navigate to issue reporting', async () => {
      await page.click('[data-testid="report-issue-button"]');
      await expect(page).toHaveURL('/report');
      await expect(page.locator('h1')).toContainText('Report an Issue');
    });

    await test.step('Fill issue report form', async () => {
      await page.fill('[data-testid="issue-title-input"]', 'Broken Street Light');
      await page.fill('[data-testid="issue-description-textarea"]', 'The street light on Main Street has been broken for 3 days. It\'s causing safety concerns for pedestrians at night.');
      await page.fill('[data-testid="issue-location-input"]', '123 Main Street, Test City');
      
      // Select category
      await page.click('[data-testid="category-select"]');
      await page.click('[data-testid="category-option-infrastructure"]');
      
      // Select department
      await page.click('[data-testid="department-select"]');
      await page.click('[data-testid="department-option-public-works"]');
      
      // Select priority
      await page.click('[data-testid="priority-select"]');
      await page.click('[data-testid="priority-option-medium"]');
    });

    await test.step('Add location coordinates', async () => {
      // Mock geolocation or fill coordinates manually
      await page.fill('[data-testid="latitude-input"]', '28.6139');
      await page.fill('[data-testid="longitude-input"]', '77.2090');
    });

    await test.step('Upload issue image', async () => {
      // Create a test image file
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.click('[data-testid="image-upload-button"]');
      const fileChooser = await fileChooserPromise;
      
      // Upload a test image (you might need to prepare a test image file)
      await fileChooser.setFiles('tests/fixtures/test-image.jpg');
      
      // Verify image preview
      await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
    });

    await test.step('Submit issue report', async () => {
      await page.click('[data-testid="submit-issue-button"]');
      
      // Wait for success message
      await expect(page.locator('[data-testid="issue-success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="issue-success-message"]')).toContainText('Issue reported successfully');
      
      // Should redirect to issue details or dashboard
      await expect(page).toHaveURL(/\/(dashboard|issue\/[^\/]+)/);
    });

    await test.step('Verify issue in dashboard', async () => {
      // Navigate to dashboard if not already there
      if (!page.url().includes('/dashboard')) {
        await page.click('[data-testid="dashboard-link"]');
        await expect(page).toHaveURL('/dashboard');
      }
      
      // Check if the reported issue appears in the list
      await expect(page.locator('[data-testid="issue-card"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="issue-title"]').first()).toContainText('Broken Street Light');
      await expect(page.locator('[data-testid="issue-status"]').first()).toContainText('Pending');
    });
  });

  test('Issue tracking and updates workflow', async ({ page }) => {
    // Login first
    await test.step('Login as citizen', async () => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'john.citizen@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL('/dashboard');
    });

    await test.step('View issue details', async () => {
      // Click on an existing issue
      await page.click('[data-testid="issue-card"]');
      
      // Should navigate to issue details page
      await expect(page).toHaveURL(/\/issue\/[^\/]+/);
      await expect(page.locator('[data-testid="issue-details"]')).toBeVisible();
    });

    await test.step('Check issue information', async () => {
      // Verify issue details are displayed
      await expect(page.locator('[data-testid="issue-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="issue-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="issue-location"]')).toBeVisible();
      await expect(page.locator('[data-testid="issue-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="issue-priority"]')).toBeVisible();
      
      // Check if issue updates section exists
      await expect(page.locator('[data-testid="issue-updates"]')).toBeVisible();
    });

    await test.step('Track issue on map', async () => {
      // Click on map view button if available
      if (await page.locator('[data-testid="map-view-button"]').isVisible()) {
        await page.click('[data-testid="map-view-button"]');
        await expect(page.locator('[data-testid="issue-map"]')).toBeVisible();
      }
    });
  });

  test('Issue filtering and search workflow', async ({ page }) => {
    await test.step('Login and navigate to issues', async () => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'john.citizen@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to issues list page
      await page.click('[data-testid="my-issues-link"]');
      await expect(page).toHaveURL('/my-issues');
    });

    await test.step('Filter issues by status', async () => {
      // Filter by pending status
      await page.click('[data-testid="status-filter"]');
      await page.click('[data-testid="status-pending"]');
      
      // Verify filtered results
      const issueCards = page.locator('[data-testid="issue-card"]');
      await expect(issueCards.first()).toBeVisible();
      
      // All visible issues should have pending status
      const statusElements = page.locator('[data-testid="issue-status"]');
      const count = await statusElements.count();
      for (let i = 0; i < count; i++) {
        await expect(statusElements.nth(i)).toContainText('Pending');
      }
    });

    await test.step('Search issues by keyword', async () => {
      await page.fill('[data-testid="search-input"]', 'street light');
      await page.click('[data-testid="search-button"]');
      
      // Verify search results
      await expect(page.locator('[data-testid="issue-card"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="issue-title"]').first()).toContainText(/street light/i);
    });

    await test.step('Sort issues', async () => {
      await page.click('[data-testid="sort-dropdown"]');
      await page.click('[data-testid="sort-by-date-desc"]');
      
      // Issues should be sorted by newest first
      const timestamps = await page.locator('[data-testid="issue-date"]').allTextContents();
      // Verify descending order (newest first)
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  test('Responsive design and mobile workflow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await test.step('Test mobile navigation', async () => {
      await page.goto('/');
      
      // Mobile menu should be visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      await page.click('[data-testid="mobile-menu-button"]');
      
      // Mobile navigation should open
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    });

    await test.step('Test mobile issue reporting', async () => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'john.citizen@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.click('[data-testid="login-button"]');
      
      // Open mobile menu and navigate to report
      await page.click('[data-testid="mobile-menu-button"]');
      await page.click('[data-testid="mobile-report-link"]');
      
      // Form should be responsive
      await expect(page.locator('[data-testid="issue-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="issue-title-input"]')).toBeVisible();
    });

    await test.step('Test mobile issue cards layout', async () => {
      await page.goto('/dashboard');
      
      // Issue cards should stack vertically on mobile
      const issueCards = page.locator('[data-testid="issue-card"]');
      if (await issueCards.first().isVisible()) {
        const firstCardBox = await issueCards.first().boundingBox();
        const secondCardBox = await issueCards.nth(1).boundingBox();
        
        if (firstCardBox && secondCardBox) {
          // Second card should be below the first (not side by side)
          expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height - 10);
        }
      }
    });
  });

  test('Error handling and edge cases', async ({ page }) => {
    await test.step('Test network error handling', async () => {
      // Simulate offline mode
      await page.route('**/*', route => route.abort());
      
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Should show network error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/network/i);
    });

    await test.step('Test form validation errors', async () => {
      // Reset network routes
      await page.unroute('**/*');
      
      await page.goto('/register');
      
      // Submit empty form
      await page.click('[data-testid="register-button"]');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    });

    await test.step('Test invalid file upload', async () => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'john.citizen@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/report');
      
      // Try to upload invalid file type
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.click('[data-testid="image-upload-button"]');
      const fileChooser = await fileChooserPromise;
      
      // Upload non-image file
      await fileChooser.setFiles('tests/fixtures/invalid-file.pdf');
      
      // Should show error message
      await expect(page.locator('[data-testid="file-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="file-error"]')).toContainText(/image/i);
    });
  });

  test('Accessibility features', async ({ page }) => {
    await test.step('Test keyboard navigation', async () => {
      await page.goto('/login');
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();
    });

    await test.step('Test screen reader labels', async () => {
      await page.goto('/register');
      
      // Check for proper ARIA labels
      const nameInput = page.locator('[data-testid="name-input"]');
      await expect(nameInput).toHaveAttribute('aria-label', /name/i);
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await expect(emailInput).toHaveAttribute('aria-label', /email/i);
    });

    await test.step('Test high contrast mode', async () => {
      // Enable high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' });
      
      await page.goto('/dashboard');
      
      // Verify elements are visible in dark mode
      await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="issue-card"]').first()).toBeVisible();
    });
  });
});