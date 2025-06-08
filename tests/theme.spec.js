// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Theme Switching Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('default theme is dark @desktop @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page starts with dark theme
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
    
    // Verify dark theme colors are applied
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Dark theme should have a dark background
    expect(backgroundColor).toMatch(/rgb\(8, 8, 8\)|rgb\(30, 30, 46\)/);
  });

  test('theme toggle switches from dark to light @desktop @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Ensure we start with dark theme
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // Find and click the theme toggle button
    const themeToggle = page.locator('[data-theme-toggle]');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    
    // Wait for the theme to change
    await page.waitForTimeout(500);
    
    // Verify light theme is now active
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    
    // Verify light theme colors are applied
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Light theme should have a light background
    expect(backgroundColor).toMatch(/rgb\(239, 241, 245\)/);
  });

  test('theme toggle switches from light to dark @desktop @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Switch to light mode first
    const themeToggle = page.locator('[data-theme-toggle]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    
    // Switch back to dark mode
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Verify we're back to dark theme
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('theme preference persists after page reload @desktop @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Switch to light theme
    const themeToggle = page.locator('[data-theme-toggle]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify light theme is still active after reload
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    
    // Verify localStorage contains the preference
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('light');
  });

  test('theme preference persists across different pages @desktop @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Switch to light theme
    const themeToggle = page.locator('[data-theme-toggle]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    
    // Navigate to blog page
    await page.goto('/blog/');
    await page.waitForLoadState('networkidle');
    
    // Verify light theme is still active
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    
    // Navigate to setup page
    await page.goto('/setup/');
    await page.waitForLoadState('networkidle');
    
    // Verify light theme is still active
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('theme toggle button visual state updates correctly @desktop', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('[data-theme-toggle]');
    
    // Check initial state (dark theme)
    await expect(themeToggle).toHaveAttribute('aria-pressed', 'false');
    
    // Click to switch to light theme
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Check toggle button state updated
    await expect(themeToggle).toHaveAttribute('aria-pressed', 'true');
    
    // Check toggle icon changed
    const toggleIcon = page.locator('.toggle-icon');
    await expect(toggleIcon).toHaveClass(/fa-sun/);
  });

  test('no theme flicker on page load @desktop @mobile', async ({ page }) => {
    // Set light theme preference
    await page.goto('/');
    const themeToggle = page.locator('[data-theme-toggle]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Record all theme changes during reload
    const themeChanges = [];
    await page.exposeFunction('recordThemeChange', (theme) => {
      themeChanges.push(theme);
    });
    
    await page.addInitScript(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'data-theme') {
            window.recordThemeChange(document.documentElement.getAttribute('data-theme'));
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
    });
    
    // Reload and check for theme flicker
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should not have multiple theme changes (flicker)
    expect(themeChanges.length).toBeLessThanOrEqual(1);
    
    // Final theme should be light
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('mobile light mode colors are correct @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Switch to light theme
    const themeToggle = page.locator('[data-theme-toggle]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Check mobile-specific light mode colors
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should be light background color (this was our bug!)
    expect(backgroundColor).toMatch(/rgb\(239, 241, 245\)/);
    
    // Check text color
    const textColor = await body.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Should be dark text color for contrast
    expect(textColor).toMatch(/rgb\(76, 79, 105\)/);
    
    // Check intro section specifically
    const intro = page.locator('.intro');
    const introBackgroundColor = await intro.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    expect(introBackgroundColor).toMatch(/rgb\(239, 241, 245\)/);
  });
});