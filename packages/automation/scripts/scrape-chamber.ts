import { chromium } from 'playwright';

async function scrapeFirstH1() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.camara.cl/legislacion/sala_sesiones/asistencia_resumen.aspx');

    const h1Text = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1?.textContent || null;
    });

    console.log('First h1 element:', h1Text);

    // Wait for and fill the date input
    const dateFrom = '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_fecha_desde';
    await page.waitForSelector(dateFrom, { timeout: 5000 });
    await page.fill(dateFrom, '01/01/2026');

    const dateTo = '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_fecha_hasta';
    await page.waitForSelector(dateTo, { timeout: 5000 });
    await page.fill(dateTo, '31/12/2026');

    const searchButton = '#ContentPlaceHolder1_ContentPlaceHolder1_PaginaContent_btnBuscar';
    
    await page.click(searchButton);

    const resultTable = '.tabla'
    await page.waitForSelector(resultTable, { timeout: 10000 });
    
    

    // Take screenshot
    await page.screenshot({ path: './chamber-table.png' });
    console.log('Screenshot saved to: ./chamber-table.png');
  } finally {
    await browser.close();
  }
}

scrapeFirstH1().catch(console.error);
