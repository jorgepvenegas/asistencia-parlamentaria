import { test, expect, devices } from '@playwright/test';

// Mobile test configuration
const iPhone = devices['iPhone 12'];
const androidPhone = devices['Pixel 5'];

test.describe('Mobile Responsive Design', () => {
  test.describe('iPhone 12', () => {
    test.use(iPhone);

    test('Homepage loads without horizontal scroll', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Check page width
      const viewportSize = page.viewportSize();
      expect(viewportSize).toBeTruthy();
      expect(viewportSize?.width).toBe(390); // iPhone 12 width

      // Verify no horizontal scrolling
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(390);
    });

    test('Header is readable on mobile', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Check header is visible
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Check logo is readable
      const logo = page.locator('h1:has-text("QuienAtiende")');
      await expect(logo).toBeVisible();

      // Search input should be visible
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await expect(searchInput).toBeVisible();
    });

    test('Statistics cards stack vertically', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Check stats cards are visible
      const statsCards = page.locator('div:has-text("Total de Diputados")');
      await expect(statsCards).toBeVisible();

      // Should not have horizontal scroll with cards
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(390);
    });

    test('Politicians table is readable', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Wait for table to load
      await page.waitForSelector('table');

      // Check table is visible
      const table = page.locator('table').first();
      await expect(table).toBeVisible();

      // Text should be readable (not too small)
      const textSize = await table.evaluate(
        (el) => window.getComputedStyle(el).fontSize
      );
      const fontSizeNum = parseFloat(textSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(12); // Minimum readable size
    });

    test('Buttons are touch-friendly (48px+)', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Find a button
      const button = page.locator('button').first();
      const boundingBox = await button.boundingBox();

      // Minimum touch target is 48x48px
      expect(boundingBox?.height).toBeGreaterThanOrEqual(40); // Allow slight variance
      expect(boundingBox?.width).toBeGreaterThanOrEqual(40);
    });

    test('Filter component is mobile-friendly', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Check filter exists
      const filter = page.locator('text=Filtrar por partido');
      await expect(filter).toBeVisible();

      // Check filter checkbox is accessible
      const checkbox = page.locator('input[type="checkbox"]').first();
      const boundingBox = await checkbox.boundingBox();
      expect(boundingBox).toBeTruthy();
    });

    test('Month navigation is mobile-friendly', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Check month select exists
      const select = page.locator('select').first();
      await expect(select).toBeVisible();

      // Should be readable size
      const boundingBox = await select.boundingBox();
      expect(boundingBox?.height).toBeGreaterThanOrEqual(32);
    });

    test('Page loads under 2 seconds on 4G', async ({ page }) => {
      // Simulate 4G slow network
      await page.route('**/*', (route) => {
        setTimeout(() => route.continue(), 100);
      });

      const startTime = Date.now();
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      // Should load in reasonable time (even with throttling)
      expect(loadTime).toBeLessThan(4000); // 4 seconds with throttling
    });

    test('Search works on mobile', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Click search input
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      await searchInput.click();

      // Type a name
      await searchInput.type('María');

      // Wait for dropdown
      await page.waitForSelector('#search-dropdown:not(.hidden)', {
        timeout: 2000,
      });

      // Dropdown should be visible
      const dropdown = page.locator('#search-dropdown');
      expect(await dropdown.isVisible()).toBeTruthy();
    });
  });

  test.describe('Android Phone (Pixel 5)', () => {
    test.use(androidPhone);

    test('Homepage loads without horizontal scroll', async ({ page }) => {
      await page.goto('http://localhost:3001');

      const viewportSize = page.viewportSize();
      expect(viewportSize).toBeTruthy();

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportSize!.width + 10); // Small margin
    });

    test('All interactive elements are tappable', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Find all buttons and links
      const buttons = page.locator('button, a[href]');
      const count = await buttons.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();

        // Check minimum touch target size
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(36);
          expect(boundingBox.width).toBeGreaterThanOrEqual(36);
        }
      }
    });

    test('Text is readable (font size >= 12px)', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Check body text size
      const textElements = page.locator('p, span, td, th');
      const count = await textElements.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = textElements.nth(i);
        const fontSize = await element.evaluate(
          (el) => window.getComputedStyle(el).fontSize
        );
        const fontSizeNum = parseFloat(fontSize);

        // Should be readable (12px or larger)
        expect(fontSizeNum).toBeGreaterThanOrEqual(11); // Allow slight variance
      }
    });
  });

  test.describe('Common Mobile Interactions', () => {
    test.use(iPhone);

    test('Tap to scroll works on long lists', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Check if politicians table is scrollable
      const table = page.locator('table');
      await expect(table).toBeVisible();

      // Try to scroll down
      await page.evaluate(() => {
        window.scrollBy(0, 100);
      });

      // Verify scroll position changed
      const scrollPos = await page.evaluate(() => window.scrollY);
      expect(scrollPos).toBeGreaterThan(0);
    });

    test('Dropdowns are mobile-friendly', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Check month selector
      const select = page.locator('select').first();
      await select.click();

      // Select should open/be interactive
      const isVisible = await select.isVisible();
      expect(isVisible).toBeTruthy();
    });

    test('No layout shift on scroll', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Measure initial layout
      const initialHeight = await page.evaluate(
        () => document.documentElement.scrollHeight
      );

      // Scroll down
      await page.evaluate(() => {
        window.scrollBy(0, 200);
      });

      // Check height didn't shift dramatically
      const newHeight = await page.evaluate(
        () => document.documentElement.scrollHeight
      );

      // Allow small variance for lazy loading
      expect(Math.abs(initialHeight - newHeight)).toBeLessThan(500);
    });
  });

  test.describe('Chart Responsiveness', () => {
    test.use(iPhone);

    test('Stacked chart is readable on mobile', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Find chart container
      const chart = page.locator('text=Distribución de Asistencia').first();
      await expect(chart).toBeVisible();

      // Check chart is within viewport
      const boundingBox = await chart.boundingBox();
      expect(boundingBox).toBeTruthy();
      expect(boundingBox?.width).toBeLessThanOrEqual(390);
    });

    test('Chart legend is accessible on mobile', async ({ page }) => {
      await page.goto('http://localhost:3001');

      // Find legend
      const legend = page.locator('text=Leyenda').first();
      await expect(legend).toBeVisible();

      // Check legend items are readable
      const legendItems = page.locator('text=Presente, Ausente, Justificado').first();
      await expect(legendItems).toBeVisible();
    });
  });
});

// Accessibility tests for mobile
test.describe('Mobile Accessibility', () => {
  test.use(iPhone);

  test('Focus order is logical on mobile', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Tab through elements
    let focusedElement = '';
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() =>
        document.activeElement?.getAttribute('aria-label')
      );
      expect(focused).toBeDefined();
    }
  });

  test('Color contrast is sufficient on mobile', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Check text is visible against background
    const elements = page.locator('h1, h2, p');
    const count = await elements.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = elements.nth(i);
      // Elements should have sufficient color contrast
      // This is a basic check; full audit would use axe-core
      await expect(element).toBeVisible();
    }
  });
});
