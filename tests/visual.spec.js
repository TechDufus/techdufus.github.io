// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Tests', () => {
  test.describe('Mobile Light Mode Visual Tests', () => {
    test('mobile light mode homepage looks correct @mobile @visual', async ({ page }) => {
      await page.goto('/');
      
      // Switch to light mode
      const themeToggle = page.locator('[data-theme-toggle]');
      await themeToggle.click();
      await page.waitForTimeout(1000);
      
      // Wait for all content to load
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of full page
      await expect(page).toHaveScreenshot('mobile-light-homepage.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('mobile light mode blog page looks correct @mobile @visual', async ({ page }) => {
      await page.goto('/blog/');
      
      // Switch to light mode
      const themeToggle = page.locator('[data-theme-toggle]');
      await themeToggle.click();
      await page.waitForTimeout(1000);
      
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('mobile-light-blog.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('mobile light mode terminal section looks correct @mobile @visual', async ({ page }) => {
      await page.goto('/');
      
      // Switch to light mode
      const themeToggle = page.locator('[data-theme-toggle]');
      await themeToggle.click();
      await page.waitForTimeout(1000);
      
      // Focus on terminal section
      const terminal = page.locator('.blog-terminal');
      await expect(terminal).toBeVisible();
      
      await expect(terminal).toHaveScreenshot('mobile-light-terminal.png', {
        animations: 'disabled'
      });
    });

    test('mobile light mode navigation looks correct @mobile @visual', async ({ page }) => {
      await page.goto('/');
      
      // Switch to light mode
      const themeToggle = page.locator('[data-theme-toggle]');
      await themeToggle.click();
      await page.waitForTimeout(1000);
      
      // Open mobile menu
      const mobileToggle = page.locator('.mobile-menu-toggle');
      await mobileToggle.click();
      await page.waitForTimeout(500);
      
      // Screenshot of header and open mobile menu
      const headerAndMenu = page.locator('body');
      await expect(headerAndMenu).toHaveScreenshot('mobile-light-navigation.png', {
        animations: 'disabled',
        clip: { x: 0, y: 0, width: 375, height: 400 }
      });
    });

    test('mobile light mode color consistency @mobile @visual', async ({ page }) => {
      await page.goto('/');
      
      // Switch to light mode
      const themeToggle = page.locator('[data-theme-toggle]');
      await themeToggle.click();
      await page.waitForTimeout(1000);
      
      // Test different sections have consistent colors
      const sections = [
        { selector: '.intro', name: 'intro' },
        { selector: '.blog-terminal', name: 'terminal' },
        { selector: '.site-header', name: 'header' }
      ];
      
      for (const section of sections) {
        const element = page.locator(section.selector);
        if (await element.isVisible()) {
          await expect(element).toHaveScreenshot(`mobile-light-${section.name}.png`, {
            animations: 'disabled'
          });
        }
      }
    });
  });

  test.describe('Desktop Light Mode Visual Tests', () => {
    test('desktop light mode homepage looks correct @desktop @visual', async ({ page }) => {
      await page.goto('/');
      
      // Switch to light mode
      const themeToggle = page.locator('[data-theme-toggle]');
      await themeToggle.click();
      await page.waitForTimeout(1000);
      
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('desktop-light-homepage.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('desktop navigation looks correct @desktop @visual', async ({ page }) => {
      await page.goto('/');
      
      // Test both themes
      const themes = ['dark', 'light'];
      
      for (const theme of themes) {
        if (theme === 'light') {
          const themeToggle = page.locator('[data-theme-toggle]');
          await themeToggle.click();
          await page.waitForTimeout(1000);
        }
        
        const header = page.locator('.site-header');
        await expect(header).toHaveScreenshot(`desktop-${theme}-navigation.png`, {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Cross-Browser Visual Tests', () => {
    test('theme toggle appearance is consistent @visual', async ({ page, browserName }) => {
      await page.goto('/');
      
      const themeToggle = page.locator('.theme-toggle-button');
      await expect(themeToggle).toBeVisible();
      
      // Screenshot in both themes
      await expect(themeToggle).toHaveScreenshot(`theme-toggle-dark-${browserName}.png`, {
        animations: 'disabled'
      });
      
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      await expect(themeToggle).toHaveScreenshot(`theme-toggle-light-${browserName}.png`, {
        animations: 'disabled'
      });
    });

    test('terminal styling is consistent across browsers @visual', async ({ page, browserName }) => {
      await page.goto('/');
      
      const terminal = page.locator('.blog-terminal');
      await expect(terminal).toBeVisible();
      
      await expect(terminal).toHaveScreenshot(`terminal-${browserName}.png`, {
        animations: 'disabled'
      });
    });
  });

  test.describe('Responsive Visual Tests', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 }
    ];

    for (const viewport of viewports) {
      test(`homepage looks correct on ${viewport.name} @visual`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });

      test(`blog page looks correct on ${viewport.name} @visual`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/blog/');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot(`blog-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });
    }
  });

  test.describe('Animation and Interaction Visual Tests', () => {
    test('mobile menu animation looks correct @mobile @visual', async ({ page }) => {
      await page.goto('/');
      
      // Capture closed state
      const mobileToggle = page.locator('.mobile-menu-toggle');
      await expect(mobileToggle).toHaveScreenshot('mobile-menu-closed.png', {
        animations: 'disabled'
      });
      
      // Open menu and capture
      await mobileToggle.click();
      await page.waitForTimeout(500);
      
      const headerArea = page.locator('body');
      await expect(headerArea).toHaveScreenshot('mobile-menu-open.png', {
        animations: 'disabled',
        clip: { x: 0, y: 0, width: 375, height: 500 }
      });
    });

    test('theme toggle animation states @desktop @visual', async ({ page }) => {
      await page.goto('/');
      
      const themeToggle = page.locator('.theme-toggle-button');
      
      // Capture initial state (dark mode)
      await expect(themeToggle).toHaveScreenshot('theme-toggle-initial.png', {
        animations: 'disabled'
      });
      
      // Capture after click (light mode)
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      await expect(themeToggle).toHaveScreenshot('theme-toggle-switched.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Content Visual Tests', () => {
    test('blog post page layout looks correct @visual', async ({ page }) => {
      // Go to blog and click first post
      await page.goto('/blog/');
      await page.waitForLoadState('networkidle');
      
      const firstPost = page.locator('.blog-entry .post-link').first();
      if (await firstPost.isVisible()) {
        await firstPost.click();
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot('blog-post-layout.png', {
          fullPage: true,
          animations: 'disabled'
        });
      }
    });

    test('setup page tabs look correct @visual', async ({ page }) => {
      await page.goto('/setup/');
      await page.waitForLoadState('networkidle');
      
      const setupNav = page.locator('.setup-nav-card');
      await expect(setupNav).toHaveScreenshot('setup-nav-tabs.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Error and Edge Case Visual Tests', () => {
    test('404 page looks correct @visual', async ({ page }) => {
      await page.goto('/nonexistent-page');
      await page.waitForLoadState('networkidle');
      
      // Wait a bit for any redirects
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('404-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('page with long content scrolls correctly @visual', async ({ page }) => {
      await page.goto('/blog/');
      await page.waitForLoadState('networkidle');
      
      // Scroll down to test sticky header
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      
      const header = page.locator('.site-header');
      await expect(header).toHaveScreenshot('scrolled-header.png', {
        animations: 'disabled'
      });
    });
  });
});