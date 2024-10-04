import fs from 'fs';
import { chromium } from 'playwright';
import { parse } from 'csv-parse';

function kebabCase(str) {
  return str
    .normalize('NFD') // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading and trailing hyphens
}

(async () => {
  // Launch the browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Read the CSV file
  const data = fs.readFileSync('urls.csv', 'utf8');

  // Parse the CSV data
  parse(data, {
    columns: ["title", "url"],
    from_line: 2,
    skip_empty_lines: true,
    trim: true,
  }, async (err, records) => {
    if (err) {
      console.error('Failed to parse CSV:', err);
      return;
    }

    // Loop through each record in the CSV
    for (const record of records) {
      const { title, url } = record;

      console.log(`Processing ${title} at ${url}`);
      try {
        // Navigate to the URL
        await page.goto(url);

        // Take a screenshot
        await page.screenshot({ path: `screenshots/${kebabCase(title)}.png`, fullPage: true });
        console.log(`Screenshot taken for ${title}`);
      } catch (error) {
        console.error(`Error capturing screenshot for ${title}: ${error}`);
      }
    }

    // Close the browser
    await browser.close();
  });
})();
