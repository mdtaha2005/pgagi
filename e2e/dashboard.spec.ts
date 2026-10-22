import { test, expect } from '@playwright/test';

test.describe('Personalized Content Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the feed to load
    await page.waitForSelector('article');
  });

  test('User Flow 1: Global Debounced Search Functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search news, movies/i);
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('Autonomous');
    
    // Wait for debounced search results dropdown
    await page.waitForSelector('text=Search Results');
    await expect(page.locator('text=Search Results')).toBeVisible();

    // Verify matching search item is shown
    const resultItem = page.locator('text=Autonomous Multi-Agent Frameworks');
    await expect(resultItem).toBeVisible();

    // Click result item to trigger detail modal
    await resultItem.click();
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Autonomous Multi-Agent Frameworks');

    // Close detail modal
    await page.locator('button[aria-label="Close modal"]').click();
    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('User Flow 2: Bookmarking and Favorites Management', async ({ page }) => {
    // Click bookmark button on first card
    const firstBookmarkButton = page.locator('button[aria-label="Add to favorites"]').first();
    await expect(firstBookmarkButton).toBeVisible();
    await firstBookmarkButton.click();

    // Verify toast notification appears
    await expect(page.locator('role=alert')).toBeVisible();

    // Navigate to Favorites section via Sidebar
    const favoritesNav = page.getByRole('button', { name: /Favorites/i });
    await favoritesNav.click();

    // Check that favorites page shows at least 1 saved card
    await expect(page.locator('h1')).toContainText(/Favorites/i);
    await expect(page.locator('article')).toHaveCount(1);

    // Remove favorite from within the favorites view
    const removeBtn = page.locator('button[aria-label="Remove from favorites"]').first();
    await removeBtn.click();

    // Verify empty state is displayed
    await expect(page.locator('text=No favorites yet')).toBeVisible();
  });

  test('User Flow 3: Theme Toggle (Dark Mode)', async ({ page }) => {
    const themeBtn = page.getByRole('button', { name: /toggle dark mode/i });
    await expect(themeBtn).toBeVisible();

    // Initial state is dark mode
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Toggle to light mode
    await themeBtn.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Toggle back to dark mode
    await themeBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('User Flow 4: Content Preferences Configuration', async ({ page }) => {
    // Open preferences modal
    const prefBtn = page.getByRole('button', { name: /Content Preferences/i });
    await prefBtn.click();

    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('#preferences-title')).toContainText(/Preferences/i);

    // Toggle a category pill
    const sportsPill = page.getByRole('button', { name: /sports/i });
    await sportsPill.click();

    // Save preferences
    const saveBtn = page.getByRole('button', { name: /Save Preferences/i });
    await saveBtn.click();

    // Verify modal closes and toast confirms
    await expect(page.locator('role=dialog')).not.toBeVisible();
    await expect(page.locator('role=alert')).toBeVisible();
  });
});
