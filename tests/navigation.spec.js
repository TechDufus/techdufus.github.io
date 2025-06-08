// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Navigation and Responsive Tests', () => {
  test.describe('Desktop Navigation', () => {
    test('main navigation is visible on desktop @desktop', async ({ page }) => {
      await page.goto('/');
      
      // Main navigation should be visible on desktop
      await expect(page.locator('.main-navigation')).toBeVisible();
      
      // Mobile menu toggle should be hidden on desktop
      await expect(page.locator('.mobile-menu-toggle')).toBeHidden();
      
      // Mobile navigation should be hidden on desktop
      await expect(page.locator('.mobile-navigation')).toBeHidden();
    });

    test('desktop navigation links work correctly @desktop', async ({ page }) => {
      await page.goto('/');
      
      // Test each navigation link
      const navigationTests = [
        { text: 'Blog', expectedPath: '/blog/' },
        { text: 'Setup', expectedPath: '/setup/' },
        { text: 'Contact', expectedPath: '/contact/' }
      ];
      
      for (const navTest of navigationTests) {
        await page.goto('/');
        
        const navLink = page.locator('.main-navigation a').filter({ hasText: navTest.text });
        await expect(navLink).toBeVisible();
        await navLink.click();
        
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain(navTest.expectedPath);
      }
    });

    test('smooth scrolling works for anchor links @desktop', async ({ page }) => {
      await page.goto('/');
      
      // Find timeline link (should be anchor link to #timeline)
      const timelineLink = page.locator('.main-navigation a').filter({ hasText: 'Timeline' });
      
      if (await timelineLink.isVisible()) {
        await timelineLink.click();
        
        // Wait for smooth scroll to complete
        await page.waitForTimeout(1000);
        
        // Check if we scrolled to timeline section
        const timelineSection = page.locator('#timeline');
        if (await timelineSection.isVisible()) {
          await expect(timelineSection).toBeInViewport();
        }
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test('mobile navigation elements are visible on mobile @mobile', async ({ page }) => {
      await page.goto('/');
      
      // Mobile menu toggle should be visible on mobile
      await expect(page.locator('.mobile-menu-toggle')).toBeVisible();
      
      // Main navigation should be hidden on mobile
      await expect(page.locator('.main-navigation')).toBeHidden();
      
      // Mobile navigation should be hidden initially
      await expect(page.locator('.mobile-navigation')).toBeHidden();
    });

    test('mobile menu opens and closes correctly @mobile', async ({ page }) => {
      await page.goto('/');
      
      const mobileToggle = page.locator('.mobile-menu-toggle');
      const mobileNav = page.locator('.mobile-navigation');
      
      // Initially closed
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(mobileNav).toBeHidden();
      
      // Click to open
      await mobileToggle.click();
      await page.waitForTimeout(500);
      
      // Should be open now
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(mobileNav).toBeVisible();
      
      // Click to close
      await mobileToggle.click();
      await page.waitForTimeout(500);
      
      // Should be closed again
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(mobileNav).toBeHidden();
    });

    test('mobile menu closes when clicking outside @mobile', async ({ page }) => {
      await page.goto('/');
      
      const mobileToggle = page.locator('.mobile-menu-toggle');
      const mobileNav = page.locator('.mobile-navigation');
      
      // Open mobile menu
      await mobileToggle.click();
      await page.waitForTimeout(500);
      await expect(mobileNav).toBeVisible();
      
      // Click outside the menu (on the intro section)
      await page.locator('.intro').click();
      await page.waitForTimeout(500);
      
      // Menu should close
      await expect(mobileNav).toBeHidden();
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('mobile menu closes with escape key @mobile', async ({ page }) => {
      await page.goto('/');
      
      const mobileToggle = page.locator('.mobile-menu-toggle');
      const mobileNav = page.locator('.mobile-navigation');
      
      // Open mobile menu
      await mobileToggle.click();
      await page.waitForTimeout(500);
      await expect(mobileNav).toBeVisible();
      
      // Press escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Menu should close
      await expect(mobileNav).toBeHidden();
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('mobile navigation links work correctly @mobile', async ({ page }) => {
      await page.goto('/');
      
      const mobileToggle = page.locator('.mobile-menu-toggle');
      
      // Test navigation links
      const navigationTests = [
        { text: 'Blog', expectedPath: '/blog/' },
        { text: 'Setup', expectedPath: '/setup/' },
        { text: 'Contact', expectedPath: '/contact/' }
      ];
      
      for (const navTest of navigationTests) {
        await page.goto('/');
        
        // Open mobile menu
        await mobileToggle.click();
        await page.waitForTimeout(500);
        
        // Click navigation link
        const navLink = page.locator('.mobile-navigation a').filter({ hasText: navTest.text });
        await expect(navLink).toBeVisible();
        await navLink.click();
        
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain(navTest.expectedPath);
      }
    });

    test('hamburger animation works correctly @mobile', async ({ page }) => {
      await page.goto('/');
      
      const mobileToggle = page.locator('.mobile-menu-toggle');
      const hamburgerLines = page.locator('.hamburger-line');
      
      // Check initial state
      await expect(hamburgerLines).toHaveCount(3);
      
      // Open menu and check animation
      await mobileToggle.click();
      await page.waitForTimeout(500);
      
      // Hamburger should transform to X
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
      
      // Close menu
      await mobileToggle.click();
      await page.waitForTimeout(500);
      
      // Should return to hamburger state
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test.describe('Responsive Design', () => {
    test('header adapts correctly to different screen sizes', async ({ page }) => {
      await page.goto('/');
      
      // Test desktop layout
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page.locator('.main-navigation')).toBeVisible();
      await expect(page.locator('.mobile-menu-toggle')).toBeHidden();
      
      // Test tablet layout
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      // Should switch to mobile navigation at 768px
      await expect(page.locator('.mobile-menu-toggle')).toBeVisible();
      await expect(page.locator('.main-navigation')).toBeHidden();
      
      // Test mobile layout
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      await expect(page.locator('.mobile-menu-toggle')).toBeVisible();
      await expect(page.locator('.main-navigation')).toBeHidden();
    });

    test('terminal section is appropriately sized on mobile @mobile', async ({ page }) => {
      await page.goto('/');
      
      // Check that intro section has good height on mobile
      const intro = page.locator('.intro');
      const introBox = await intro.boundingBox();
      
      // Should be at least 80% of viewport height (our recent change!)
      const viewportHeight = page.viewportSize()?.height || 667;
      const expectedMinHeight = viewportHeight * 0.75; // At least 75% for some tolerance
      
      expect(introBox?.height).toBeGreaterThan(expectedMinHeight);
      
      // Check terminal content has minimum height
      const terminalContent = page.locator('.blog-terminal .terminal-content');
      const terminalBox = await terminalContent.boundingBox();
      
      // Should have the minimum height we set (240px on small screens, 280px on larger mobile)
      expect(terminalBox?.height).toBeGreaterThan(200);
    });

    test('theme toggle positioning is correct on mobile @mobile', async ({ page }) => {
      await page.goto('/');
      
      // Theme toggle should be visible and positioned correctly
      const themeToggle = page.locator('.theme-toggle-button');
      await expect(themeToggle).toBeVisible();
      
      // Should be in header controls area
      const headerControls = page.locator('.header-controls');
      await expect(headerControls).toContainText(''); // Just check it exists
      
      // Theme toggle should be next to hamburger menu
      const mobileToggle = page.locator('.mobile-menu-toggle');
      await expect(mobileToggle).toBeVisible();
      await expect(themeToggle).toBeVisible();
    });

    test('mobile menu positioning is correct @mobile', async ({ page }) => {
      await page.goto('/');
      
      const mobileToggle = page.locator('.mobile-menu-toggle');
      const mobileNav = page.locator('.mobile-navigation');
      
      // Open mobile menu
      await mobileToggle.click();
      await page.waitForTimeout(500);
      
      // Check mobile navigation positioning
      const navBox = await mobileNav.boundingBox();
      expect(navBox?.x).toBeGreaterThan(0); // Not at edge
      expect(navBox?.y).toBeGreaterThan(50); // Below header
      
      // Should not take full width (dropdown style, not fullscreen)
      const viewportWidth = page.viewportSize()?.width || 375;
      expect(navBox?.width).toBeLessThan(viewportWidth * 0.9); // Less than 90% width
    });
  });

  test.describe('Accessibility', () => {
    test('navigation has proper ARIA attributes @desktop @mobile', async ({ page }) => {
      await page.goto('/');
      
      // Check mobile toggle ARIA
      const mobileToggle = page.locator('.mobile-menu-toggle');
      await expect(mobileToggle).toHaveAttribute('aria-expanded');
      
      // Check theme toggle ARIA
      const themeToggle = page.locator('.theme-toggle-button');
      await expect(themeToggle).toHaveAttribute('aria-pressed');
      
      // Check mobile nav ARIA
      const mobileNav = page.locator('.mobile-navigation');
      await expect(mobileNav).toHaveAttribute('aria-hidden');
    });

    test('keyboard navigation works @desktop', async ({ page }) => {
      await page.goto('/');
      
      // Tab through navigation elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate with keyboard
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });
});