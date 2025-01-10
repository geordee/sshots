import fs from 'fs';
import { chromium, devices } from 'playwright';
import { parse } from 'csv-parse';
import { readFile } from 'fs/promises';

function kebabCase(str) {
  return str
    .normalize('NFD') // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading and trailing hyphens
}

(async () => {
  // Get Devices
  const user_devices = JSON.parse(
    await readFile(new URL('./devices.json', import.meta.url))
  );
  const deviceDescriptors = Object.entries(devices).map(([name, device]) => (name));

  // Launch the browser
  const browser = await chromium.launch();

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

    for (const device of user_devices) {
      if (!deviceDescriptors.includes(device)) {
        console.error(`Device ${device} is not supported`);
        continue;
      }
      console.log(`# Using device ${device}`);
  
      // Loop through each record in the CSV
      for (const record of records) {
        const context = await browser.newContext({
          ...devices[device],
        });
        const page = await context.newPage();

        const { title, url } = record;

        console.log(`  - Processing ${title} at ${url}`);
        try {
          // Navigate to the URL
          await page.goto(url);

          // Take a screenshot
          await page.waitForLoadState('load'); 
          await page.screenshot({ path: `screenshots/${device}/${kebabCase(title)}.png`, fullPage: true });
        } catch (error) {
          console.error(`Error capturing screenshot for ${title}: ${error}`);
        }
      }
    }

    // Close the browser
    await browser.close();
  });
})();
