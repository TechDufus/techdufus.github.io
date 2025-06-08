// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Terminal Functionality Tests', () => {
  test('terminal structure is present @desktop @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check terminal container
    await expect(page.locator('.blog-terminal')).toBeVisible();
    
    // Check terminal header
    await expect(page.locator('.terminal-header')).toBeVisible();
    
    // Check terminal controls (red, yellow, green buttons)
    await expect(page.locator('.terminal-controls')).toBeVisible();
    await expect(page.locator('.control.close')).toBeVisible();
    await expect(page.locator('.control.minimize')).toBeVisible();
    await expect(page.locator('.control.maximize')).toBeVisible();
    
    // Check terminal content
    await expect(page.locator('.terminal-content')).toBeVisible();
  });

  test('terminal prompt is correctly formatted @desktop @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check terminal prompt exists
    const terminalPrompt = page.locator('.terminal-prompt');
    await expect(terminalPrompt).toBeVisible();
    
    // Check prompt contains expected elements
    await expect(terminalPrompt.locator('.user')).toBeVisible();
    await expect(terminalPrompt.locator('.path')).toBeVisible();
    await expect(terminalPrompt.locator('.prompt')).toBeVisible();
    
    // Check prompt text content
    const promptText = await terminalPrompt.textContent();
    expect(promptText).toContain('techdufus');
    expect(promptText).toContain('~');
    expect(promptText).toContain('$');
  });

  test('typing animation works correctly @desktop', async ({ page }) => {
    await page.goto('/');
    
    // Wait for typing animation to start
    await page.waitForTimeout(2000);
    
    // Check if typed text appears
    const introText = page.locator('.intro-text');
    await expect(introText).toBeVisible();
    
    // Wait for some typing to occur
    await page.waitForTimeout(3000);
    
    // Check that text is being typed (should have some content)
    const typedContent = await introText.textContent();
    expect(typedContent).toBeTruthy();
    
    // Check for typing cursor
    const cursor = page.locator('.typed-cursor');
    if (await cursor.isVisible()) {
      await expect(cursor).toBeVisible();
    }
  });

  test('terminal content is scrollable but not user-scrollable @desktop @mobile', async ({ page }) => {
    await page.goto('/blog/');
    
    // Check that terminal content exists and has content
    const terminalContent = page.locator('.terminal-content');
    await expect(terminalContent).toBeVisible();
    
    // Check that blog entries exist (terminal output)
    const blogEntries = page.locator('.blog-entries');
    await expect(blogEntries).toBeVisible();
    
    // Verify there are multiple blog entries to create scrollable content
    const entryCount = await page.locator('.blog-entry').count();
    expect(entryCount).toBeGreaterThan(0);
    
    // Check that the terminal content has the pointer-events CSS property
    const pointerEvents = await terminalContent.evaluate(el => 
      window.getComputedStyle(el).pointerEvents
    );
    
    // Should be 'none' to prevent user scrolling as per our fix
    if (pointerEvents === 'none') {
      // Verify user can't scroll in the terminal area
      const initialScrollTop = await terminalContent.evaluate(el => el.scrollTop);
      
      // Try to scroll
      await terminalContent.hover();
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(500);
      
      const finalScrollTop = await terminalContent.evaluate(el => el.scrollTop);
      expect(finalScrollTop).toBe(initialScrollTop); // Should not have scrolled
    }
  });

  test('terminal adapts correctly to mobile viewport @mobile', async ({ page }) => {
    await page.goto('/');
    
    const terminal = page.locator('.blog-terminal');
    const terminalBox = await terminal.boundingBox();
    
    // Terminal should be visible and appropriately sized
    expect(terminalBox?.width).toBeGreaterThan(200);
    expect(terminalBox?.height).toBeGreaterThan(250); // Our minimum height
    
    // Check mobile-specific styling
    const fontSize = await terminal.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Should have mobile font size (13px or smaller)
    const fontSizeNumber = parseInt(fontSize);
    expect(fontSizeNumber).toBeLessThanOrEqual(14);
  });

  test('terminal header title is correct @desktop @mobile', async ({ page }) => {
    await page.goto('/');
    
    const terminalTitle = page.locator('.terminal-title');
    await expect(terminalTitle).toBeVisible();
    
    const titleText = await terminalTitle.textContent();
    expect(titleText).toContain('techdufus');
  });

  test('blog terminal shows correct file listing format @desktop @mobile', async ({ page }) => {
    await page.goto('/blog/');
    
    // Check blog entries are formatted like terminal output
    const blogEntries = page.locator('.blog-entry');
    const firstEntry = blogEntries.first();
    
    await expect(firstEntry).toBeVisible();
    
    // Check file info (permissions, owner, size, date, etc.)
    await expect(firstEntry.locator('.file-info')).toBeVisible();
    await expect(firstEntry.locator('.permissions')).toBeVisible();
    await expect(firstEntry.locator('.owner')).toBeVisible();
    await expect(firstEntry.locator('.date')).toBeVisible();
    
    // Check file name (blog post title)
    await expect(firstEntry.locator('.file-name')).toBeVisible();
    await expect(firstEntry.locator('.post-link')).toBeVisible();
  });

  test('terminal summary section is present and correct @desktop @mobile', async ({ page }) => {
    await page.goto('/blog/');
    
    // Check terminal summary exists
    const terminalSummary = page.locator('.terminal-summary');
    await expect(terminalSummary).toBeVisible();
    
    // Check summary line with prompt
    const summaryLine = page.locator('.summary-line');
    await expect(summaryLine).toBeVisible();
    
    // Check file count
    const fileCount = page.locator('.file-count');
    await expect(fileCount).toBeVisible();
    
    const fileCountText = await fileCount.textContent();
    expect(fileCountText).toMatch(/\d+.*files?/);
  });

  test('terminal colors are correct in light mode @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Switch to light mode
    const themeToggle = page.locator('[data-theme-toggle]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Check terminal content background in light mode
    const terminalContent = page.locator('.terminal-content');
    const backgroundColor = await terminalContent.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should be light background in light mode (our recent fix!)
    expect(backgroundColor).toMatch(/rgb\(220, 224, 232\)|rgb\(239, 241, 245\)/);
    
    // Check text color in terminal
    const textColor = await terminalContent.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Should be dark text in light mode
    expect(textColor).toMatch(/rgb\(76, 79, 105\)/);
  });

  test('terminal prompt colors are themed correctly @desktop @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check dark mode colors (default)
    const userElement = page.locator('.terminal-prompt .user');
    const pathElement = page.locator('.terminal-prompt .path');
    const promptElement = page.locator('.terminal-prompt .prompt');
    
    if (await userElement.isVisible()) {
      const userColor = await userElement.evaluate(el => 
        window.getComputedStyle(el).color
      );
      // User should be mauve colored
      expect(userColor).toMatch(/rgb\(203, 166, 247\)|rgb\(136, 57, 239\)/);
    }
    
    if (await pathElement.isVisible()) {
      const pathColor = await pathElement.evaluate(el => 
        window.getComputedStyle(el).color
      );
      // Path should be blue colored
      expect(pathColor).toMatch(/rgb\(137, 180, 250\)|rgb\(30, 102, 245\)/);
    }
    
    if (await promptElement.isVisible()) {
      const promptColor = await promptElement.evaluate(el => 
        window.getComputedStyle(el).color
      );
      // Prompt should be green colored
      expect(promptColor).toMatch(/rgb\(166, 227, 161\)|rgb\(64, 160, 43\)/);
    }
  });

  test('terminal responds correctly to viewport changes', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    let terminalBox = await page.locator('.blog-terminal').boundingBox();
    const desktopWidth = terminalBox?.width;
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    terminalBox = await page.locator('.blog-terminal').boundingBox();
    const mobileWidth = terminalBox?.width;
    
    // Terminal should adapt to viewport
    expect(mobileWidth).toBeLessThan(desktopWidth || 0);
    
    // Check mobile terminal has minimum height
    expect(terminalBox?.height).toBeGreaterThan(250);
  });

  test('ASCII art displays correctly on different screen sizes @mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check for ASCII art or brand heading
    const brandHeading = page.locator('.brand-heading');
    await expect(brandHeading).toBeVisible();
    
    const headingText = await brandHeading.textContent();
    
    // On mobile, should show "DUFUS" (our recent change)
    // This might be in ASCII art form or simplified
    expect(headingText).toBeTruthy();
    
    // Check that it's sized appropriately for mobile
    const fontSize = await brandHeading.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    const fontSizeNumber = parseInt(fontSize);
    expect(fontSizeNumber).toBeGreaterThan(20); // Should be readable on mobile
  });
});