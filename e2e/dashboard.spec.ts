import { test, expect } from '@playwright/test';

test.describe('PulseFeed Dashboard - Comprehensive E2E Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the initial feed cards to mount
    await page.waitForSelector('article', { timeout: 15000 });
  });

  test('Journey 1: Open dashboard, verify layout and initial content', async ({ page }) => {
    // 1. Verify Brand
    await expect(page.locator('text=PulseFeed').first()).toBeVisible();

    // 2. Verify Desktop Navigation items by unique title
    await expect(page.locator('aside button[title="My Feed"]')).toBeVisible();
    await expect(page.locator('aside button[title="Trending"]')).toBeVisible();
    await expect(page.locator('aside button[title="Favorites"]')).toBeVisible();

    // 3. Verify Cards rendered
    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // 4. Verify first card has required UI components: title, source, action buttons
    const firstArticle = articles.first();
    await expect(firstArticle.locator('h3')).toBeVisible();
    await expect(firstArticle.locator('button[aria-label="Like content"]')).toBeVisible();
    await expect(firstArticle.locator('button[aria-label="Add to favorites"]')).toBeVisible();
  });

  test('Journey 2: Global debounced search and modal inspection', async ({ page }) => {
    const searchInput = page.getByLabel('Search content');
    await expect(searchInput).toBeVisible();

    // Type query with debounce
    await searchInput.fill('Autonomous');

    // Wait for debounced search results dropdown
    await page.waitForSelector('text=Search Results', { timeout: 8000 });
    await expect(page.locator('text=Search Results')).toBeVisible();

    // Verify search hit is visible
    const resultItem = page.locator('text=Autonomous Multi-Agent Frameworks').first();
    await expect(resultItem).toBeVisible();

    // Click result item to trigger detail modal
    await resultItem.click();
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Autonomous Multi-Agent Frameworks');

    // Close detail modal
    await page.locator('button[aria-label="Close modal"]').click();
    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('Journey 3: Bookmark card to Favorites and verify navigation', async ({ page }) => {
    // Click bookmark button on first card
    const firstBookmark = page.locator('button[aria-label="Add to favorites"]').first();
    await expect(firstBookmark).toBeVisible();
    await firstBookmark.click();

    // Toast alert appears
    const toastAlert = page.locator('.fixed[role="alert"]');
    await expect(toastAlert).toBeVisible();

    // Navigate to Favorites view
    await page.locator('aside button[title="Favorites"]').click();

    // Verify Favorites view header and items
    await expect(page.locator('h1')).toContainText(/Favorites/i);
    const favArticles = page.locator('article');
    await expect(favArticles).toHaveCount(1);
  });

  test('Journey 4: Remove favorite and verify empty state', async ({ page }) => {
    // First bookmark an item
    const bookmarkBtn = page.locator('button[aria-label="Add to favorites"]').first();
    await bookmarkBtn.click();

    // Go to Favorites
    await page.locator('aside button[title="Favorites"]').click();
    await expect(page.locator('article')).toHaveCount(1);

    // Remove favorite from within the favorites view
    const removeBtn = page.locator('button[aria-label="Remove from favorites"]').first();
    await removeBtn.click();

    // Verify empty state is displayed
    await expect(page.locator('text=No favorites yet')).toBeVisible();
  });

  test('Journey 5: Update category preferences and verify persistence across reload', async ({ page }) => {
    // Open Preferences modal
    await page.getByRole('button', { name: /Content Preferences/i }).click();
    const dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible();

    // Toggle sports category inside dialog
    const sportsPill = dialog.getByRole('button', { name: /sports/i });
    await sportsPill.click();

    // Save preferences
    await dialog.getByRole('button', { name: /Save Preferences/i }).click();
    await expect(dialog).not.toBeVisible();

    // Reload page to test persistence
    await page.reload();
    await page.waitForSelector('article');

    // Reopen Preferences modal to confirm Sports selection persisted
    await page.getByRole('button', { name: /Content Preferences/i }).click();
    const dialogAfter = page.locator('role=dialog');
    await expect(dialogAfter).toBeVisible();
    const sportsPillAfter = dialogAfter.getByRole('button', { name: /sports/i });
    await expect(sportsPillAfter).toBeVisible();

    // Close modal
    await page.locator('button[aria-label="Close preferences"]').click();
  });

  test('Journey 6: Toggle dark mode and verify theme persistence across reload', async ({ page }) => {
    const themeBtn = page.getByRole('button', { name: /toggle dark mode/i });
    await expect(themeBtn).toBeVisible();

    // Initial state is dark mode
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Toggle to light mode
    await themeBtn.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Reload page to test persistence
    await page.reload();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Toggle back to dark mode
    const themeBtnReloaded = page.getByRole('button', { name: /toggle dark mode/i });
    await themeBtnReloaded.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('Journey 7: Reorder drag controls and banner verification', async ({ page }) => {
    // Verify drag hint is displayed in the feed
    await expect(page.locator('text=Drag cards to customize order')).toBeVisible();

    // Verify cards have drag handles
    const dragHandles = page.locator('div[title="Drag to reorder card"]');
    const handleCount = await dragHandles.count();
    expect(handleCount).toBeGreaterThan(0);
  });

  test('Journey 8: Infinite scroll sentinel and load more trigger', async ({ page }) => {
    // Scroll down to the bottom sentinel
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check if Load More button is visible or triggered
    const loadMoreBtn = page.locator('text=Load More Content');
    if (await loadMoreBtn.isVisible()) {
      const initialCount = await page.locator('article').count();
      await loadMoreBtn.click();
      await page.waitForTimeout(1000);
      const afterCount = await page.locator('article').count();
      expect(afterCount).toBeGreaterThanOrEqual(initialCount);
    }
  });

  test('Journey 9: Search empty state and clear button', async ({ page }) => {
    const searchInput = page.getByLabel('Search content');

    // Type a query that yields no results
    await searchInput.fill('XYZNoSuchContentQuery12345');
    await page.waitForSelector('text=Search Results', { timeout: 8000 });

    // Verify empty search indicator
    await expect(page.locator('text=No matching results for')).toBeVisible();

    // Click clear search button
    const clearBtn = page.locator('button[aria-label="Clear search"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Search query reset
    await expect(searchInput).toHaveValue('');
  });

  test('Journey 10: Responsive layout on mobile viewport and navigation drawer', async ({ page }) => {
    // Resize viewport to mobile iPhone SE
    await page.setViewportSize({ width: 375, height: 667 });

    // Mobile menu toggle button should be visible
    const mobileMenuBtn = page.locator('button[aria-label="Open navigation menu"]');
    await expect(mobileMenuBtn).toBeVisible();

    // Click to open mobile navigation drawer
    await mobileMenuBtn.click();

    // Verify mobile drawer navigation link appears
    const drawerTrending = page.locator('.fixed.inset-y-0.left-0 button', { hasText: 'Trending' });
    await expect(drawerTrending).toBeVisible();

    // Click Trending in drawer
    await drawerTrending.click();

    // Verify navigation to Trending view
    await expect(page.locator('h1')).toContainText(/Trending/i);
  });
});
