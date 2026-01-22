/**
 * ブラウザインスタンスの管理
 */

import puppeteer from 'puppeteer';

let browserInstance = null;

/**
 * ブラウザインスタンスを取得（シングルトン）
 * @returns {Promise<puppeteer.Browser>}
 */
export async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
  }
  return browserInstance;
}

/**
 * ブラウザインスタンスを閉じる
 */
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * 新しいページを作成
 * @returns {Promise<puppeteer.Page>}
 */
export async function createPage() {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  // User-Agentを設定
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  
  return page;
}
