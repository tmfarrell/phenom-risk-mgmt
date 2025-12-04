import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlPath = resolve(__dirname, '..', 'public', 'phenom-inference-api.html');
const pdfPath = resolve(__dirname, '..', 'public', 'phenom-inference-api.pdf');

const url = 'file://' + htmlPath;

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle0' });

// Adjust options as desired
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  // Tighter margins to reduce whitespace around the content
  margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' }
});

await browser.close();
console.log('PDF written to', pdfPath);