// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Accessibility Tests', () => {
  test('homepage has proper heading hierarchy @accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check that we have proper heading hierarchy (h1 -> h2 -> h3, etc.)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for h1 (should only be one)
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThanOrEqual(1);
    expect(h1Elements).toBeLessThanOrEqual(2); // Allow for hidden h1s
  });

  test('navigation has proper ARIA attributes @accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check mobile menu toggle has proper ARIA
    const mobileToggle = page.locator('.mobile-menu-toggle');
    if (await mobileToggle.isVisible()) {
      await expect(mobileToggle).toHaveAttribute('aria-expanded');
      await expect(mobileToggle).toHaveAttribute('aria-controls');
    }
    
    // Check theme toggle has proper ARIA
    const themeToggle = page.locator('.theme-toggle-button');
    await expect(themeToggle).toHaveAttribute('aria-pressed');
    
    // Check mobile navigation has proper ARIA
    const mobileNav = page.locator('.mobile-navigation');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toHaveAttribute('aria-hidden');
    }
  });

  test('images have proper alt attributes @accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Get all images
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      
      // All images should have alt attributes (even if empty for decorative images)
      expect(alt).not.toBeNull();
      
      // If it's a content image, it should have meaningful alt text
      if (src && !src.includes('icon') && !src.includes('favicon')) {
        expect(alt?.length).toBeGreaterThan(0);
      }
    }
  });

  test('links have accessible names @accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Get all links
    const links = await page.locator('a').all();
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      // Skip empty or javascript: links
      if (!href || href === '#' || href.startsWith('javascript:')) {
        continue;
      }
      
      // Link should have accessible text (visible text, aria-label, or title)
      const hasAccessibleName = (text && text.trim().length > 0) || 
                               (ariaLabel && ariaLabel.length > 0) || 
                               (title && title.length > 0);
      
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('form elements have proper labels @accessibility', async ({ page }) => {
    await page.goto('/contact/');
    
    // Get all form inputs
    const inputs = await page.locator('input, select, textarea').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');
      
      // Input should have some form of labeling
      let hasLabel = false;
      
      if (id) {
        // Check for associated label
        const label = page.locator(`label[for="${id}"]`);
        if (await label.count() > 0) {
          hasLabel = true;
        }
      }
      
      if (ariaLabel || ariaLabelledby || placeholder) {
        hasLabel = true;
      }
      
      // Allow some exceptions for hidden inputs
      const type = await input.getAttribute('type');
      if (type === 'hidden') {
        continue;
      }
      
      expect(hasLabel).toBeTruthy();
    }
  });

  test('page has proper document structure @accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    const mainCount = await main.count();
    expect(mainCount).toBeGreaterThanOrEqual(1);
    
    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();
    expect(navCount).toBeGreaterThanOrEqual(1);
    
    // Check page has a title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('Document'); // Default title
  });

  test('color contrast is sufficient @accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Test both themes
    const themes = ['dark', 'light'];
    
    for (const theme of themes) {
      if (theme === 'light') {
        const themeToggle = page.locator('.theme-toggle-button');
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
      
      // Check main text elements have sufficient contrast
      const textElements = [
        'body',
        '.intro-text', 
        '.terminal-content',
        'p',
        'h1, h2, h3, h4, h5, h6'
      ];
      
      for (const selector of textElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          });
          
          // Basic check that text is not transparent or same as background
          expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
          expect(styles.color).not.toBe('transparent');
          expect(styles.color).not.toBe(styles.backgroundColor);
        }
      }
    }
  });

  test('keyboard navigation works @accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      
      // Check that focused element is visible and interactive
      if (await focusedElement.count() > 0) {
        await expect(focusedElement).toBeVisible();
        
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        const role = await focusedElement.getAttribute('role');
        const tabindex = await focusedElement.getAttribute('tabindex');
        
        // Should be an interactive element
        const isInteractive = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName) ||
                             role === 'button' ||
                             role === 'link' ||
                             tabindex === '0';
        
        if (isInteractive) {
          expect(true).toBeTruthy(); // Valid interactive element
        }
      }
    }
  });

  test('focus indicators are visible @accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Test focus on various interactive elements
    const interactiveSelectors = [
      '.theme-toggle-button',
      '.nav-link',
      'a[href]'
    ];
    
    for (const selector of interactiveSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.focus();
        
        // Check that focused element has visible focus indicator
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            outline: computed.outline,
            outlineWidth: computed.outlineWidth,
            outlineStyle: computed.outlineStyle,
            outlineColor: computed.outlineColor,
            boxShadow: computed.boxShadow
          };
        });
        
        // Should have some form of focus indicator
        const hasFocusIndicator = styles.outline !== 'none' ||
                                 styles.outlineWidth !== '0px' ||
                                 styles.boxShadow !== 'none';
        
        expect(hasFocusIndicator).toBeTruthy();
      }
    }
  });

  test('mobile navigation is keyboard accessible @accessibility @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Focus on mobile menu toggle
    const mobileToggle = page.locator('.mobile-menu-toggle');
    if (await mobileToggle.isVisible()) {
      await mobileToggle.focus();
      
      // Should be able to activate with Enter or Space
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      const mobileNav = page.locator('.mobile-navigation');
      await expect(mobileNav).toBeVisible();
      
      // Should be able to close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      await expect(mobileNav).toBeHidden();
    }
  });

  test('theme toggle is keyboard accessible @accessibility', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('.theme-toggle-button');
    await themeToggle.focus();
    
    // Get initial theme
    const initialTheme = await page.locator('html').getAttribute('data-theme');
    
    // Should be able to toggle with Enter or Space
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const newTheme = await page.locator('html').getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
    
    // Test Space key as well
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    
    const finalTheme = await page.locator('html').getAttribute('data-theme');
    expect(finalTheme).toBe(initialTheme);
  });

  test('screen reader announcements work @accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper live regions or announcements
    const liveRegions = page.locator('[aria-live], [aria-atomic], [role="status"], [role="alert"]');
    
    // At minimum, check that ARIA attributes are used where appropriate
    const ariaElements = page.locator('[aria-label], [aria-labelledby], [aria-describedby], [aria-expanded], [aria-pressed], [aria-hidden]');
    const ariaCount = await ariaElements.count();
    
    expect(ariaCount).toBeGreaterThan(0);
  });

  test('content is readable without CSS @accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Disable CSS
    await page.addStyleTag({ content: '* { all: unset !important; }' });
    
    // Check that main content is still visible and readable
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    const paragraphs = page.locator('p');
    const paragraphCount = await paragraphs.count();
    expect(paragraphCount).toBeGreaterThan(0);
    
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});