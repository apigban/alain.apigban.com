const puppeteer = require('puppeteer');

async function captureScreenshots() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport size
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to website...');
    await page.goto('http://192.168.2.234:1313', { waitUntil: 'networkidle2' });

    // Capture full page screenshot
    console.log('Capturing full page screenshot...');
    await page.screenshot({
      path: 'static/screenshots/homepage-full.png',
      fullPage: true
    });

    // Capture viewport screenshot
    console.log('Capturing viewport screenshot...');
    await page.screenshot({
      path: 'static/screenshots/homepage-viewport.png',
      fullPage: false
    });

    // Get page dimensions
    const dimensions = await page.evaluate(() => {
      return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight
      };
    });

    console.log('Page dimensions:', dimensions);

    // Capture specific sections if they exist
    const sections = await page.evaluate(() => {
      const sectionSelectors = [
        '.hero',
        '.about',
        '.posts',
        '.portfolio',
        '.skills',
        '.experience',
        'nav.navigation',
        'footer'
      ];

      const foundSections = [];
      sectionSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          foundSections.push({
            selector,
            exists: true,
            top: rect.top,
            height: rect.height
          });
        }
      });
      return foundSections;
    });

    console.log('Found sections:', sections);

    // Capture screenshots of major sections
    for (const section of sections) {
      if (section.exists && section.height > 100) {
        await page.evaluate(selector => {
          const element = document.querySelector(selector);
          if (element) element.scrollIntoView();
        }, section.selector);

        await page.waitForTimeout(1000);

        const fileName = `static/screenshots/section-${section.selector.replace(/[\/\.]/g, '-')}.png`;
        await page.screenshot({ path: fileName });
        console.log(`Captured section: ${fileName}`);
      }
    }

    console.log('Screenshots captured successfully!');

  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('static/screenshots')) {
  fs.mkdirSync('static/screenshots', { recursive: true });
}

captureScreenshots();