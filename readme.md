# Capture Screenshots
Capture screenshots for given URLs

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

### Configure script

- Review the device list in `devices.json`.
  - Refer [Playwright's registry of devices](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json) for a list of devices.
- Rename `urls.example.csv` to `urls.csv`, and list URLs with titles.

### Capture screenshots

```bash
npm run capture
```
