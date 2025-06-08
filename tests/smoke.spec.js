// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Core Page Smoke Tests', () => {
  test('homepage loads correctly @desktop @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/TechDufus/);
    
    // Check main navigation is present
    await expect(page.locator('.site-header')).toBeVisible();
    
    // Check intro section is present
    await expect(page.locator('.intro')).toBeVisible();
    
    // Check terminal section exists
    await expect(page.locator('.blog-terminal')).toBeVisible();
    
    // Check brand heading
    await expect(page.locator('.brand-heading')).toBeVisible();
    
    // Verify no console errors (except for external resources)
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Filter out external resource errors
    const criticalErrors = logs.filter(log => 
      !log.includes('disqus.com') && 
      !log.includes('google-analytics') &&
      !log.includes('net::ERR_BLOCKED_BY_CLIENT')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('blog page loads correctly @desktop @mobile', async ({ page }) => {
    await page.goto('/blog/');
    
    // Check page title
    await expect(page).toHaveTitle(/Blog.*TechDufus/);
    
    // Check blog terminal is present
    await expect(page.locator('.blog-terminal')).toBeVisible();
    
    // Check blog entries exist
    await expect(page.locator('.blog-entries')).toBeVisible();
    
    // Check at least one blog post is listed
    await expect(page.locator('.blog-entry')).toHaveCount({ min: 1 });
  });

  test('setup page loads correctly @desktop @mobile', async ({ page }) => {
    await page.goto('/setup/');
    
    // Check page title
    await expect(page).toHaveTitle(/Setup.*TechDufus/);
    
    // Check setup header card
    await expect(page.locator('.setup-header-card')).toBeVisible();
    
    // Check setup navigation tabs
    await expect(page.locator('.setup-nav-tabs')).toBeVisible();
    
    // Check setup content sections
    await expect(page.locator('.setup-content')).toBeVisible();
  });

  test('contact page loads correctly @desktop @mobile', async ({ page }) => {
    await page.goto('/contact/');
    
    // Check page title
    await expect(page).toHaveTitle(/Contact.*TechDufus/);
    
    // Check contact content is present
    await expect(page.locator('.content-section')).toBeVisible();
  });

  test('individual blog post loads correctly @desktop @mobile', async ({ page }) => {
    // Go to blog page first to get a post link
    await page.goto('/blog/');
    
    // Get the first blog post link
    const firstPostLink = page.locator('.blog-entry .post-link').first();
    await expect(firstPostLink).toBeVisible();
    
    // Click on the first post
    await firstPostLink.click();
    
    // Verify we're on a post page
    await expect(page).toHaveTitle(/.*TechDufus/);
    
    // Check post structure
    await expect(page.locator('.post-container')).toBeVisible();
    await expect(page.locator('.post-header-card')).toBeVisible();
    await expect(page.locator('.post-content-card')).toBeVisible();
  });

  test('404 page loads correctly @desktop @mobile', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Should redirect to 404 page or show 404 content
    await expect(page.locator('body')).toContainText('404', { timeout: 10000 });
  });

  test('all navigation links work @desktop', async ({ page }) => {
    await page.goto('/');
    
    // Wait for navigation to be visible
    await expect(page.locator('.main-navigation')).toBeVisible();
    
    // Test main navigation links
    const navLinks = [
      { selector: 'a[href*="blog"]', expectedUrl: '/blog/' },
      { selector: 'a[href*="timeline"]', expectedUrl: '/#timeline' },
      { selector: 'a[href*="setup"]', expectedUrl: '/setup/' },
      { selector: 'a[href*="contact"]', expectedUrl: '/contact/' }
    ];
    
    for (const link of navLinks) {
      const linkElement = page.locator('.main-navigation').locator(link.selector).first();
      
      if (await linkElement.isVisible()) {
        const href = await linkElement.getAttribute('href');
        expect(href).toContain(link.expectedUrl.replace('#', ''));
      }
    }
  });
});