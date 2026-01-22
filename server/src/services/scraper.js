/**
 * 公式サイトからのカード検索スクレイピング
 */

import { createPage } from '../utils/browser.js';
import { TimeoutError, NetworkError } from '../utils/errors.js';

const SEARCH_URL = 'https://www.pokemon-card.com/card-search/';
const REQUEST_DELAY = 1000; // 1秒

/**
 * 検索条件を構築
 * @param {Object} params - 検索パラメータ
 * @returns {Object} 検索条件オブジェクト
 */
function buildSearchParams(params) {
  const searchParams = {};
  
  if (params.name) {
    searchParams.card_name = params.name;
  }
  
  if (params.cardId) {
    searchParams.card_id = params.cardId;
  }
  
  if (params.category) {
    // カテゴリのマッピング
    const categoryMap = {
      'ポケモン': 'pokemon',
      'グッズ': 'goods',
      'ポケモンのどうぐ': 'tool',
      'サポート': 'support',
      'スタジアム': 'stadium',
      'エネルギー': 'energy'
    };
    searchParams.card_type = categoryMap[params.category] || params.category;
  }
  
  return searchParams;
}

/**
 * 検索結果ページからカード情報を抽出
 * @param {puppeteer.Page} page - Puppeteerページ
 * @returns {Promise<Card[]>}
 */
async function extractCardsFromPage(page) {
  return await page.evaluate(() => {
    const cards = [];
    
    // PCGDECKオブジェクトからカード情報を取得（デッキページと同様の仕組み）
    if (window.PCGDECK && window.PCGDECK.searchItemName) {
      const cardIds = Object.keys(window.PCGDECK.searchItemName);
      
      cardIds.forEach((cardId) => {
        try {
          const name = window.PCGDECK.searchItemNameAlt && window.PCGDECK.searchItemNameAlt[cardId]
            ? window.PCGDECK.searchItemNameAlt[cardId]
            : '';
          const fullName = window.PCGDECK.searchItemName[cardId] || name;
          
          // 画像URLの取得
          let imageUrl = null;
          if (window.PCGDECK.searchItemCardPict && window.PCGDECK.searchItemCardPict[cardId]) {
            const relativePath = window.PCGDECK.searchItemCardPict[cardId];
            imageUrl = 'https://www.pokemon-card.com' + relativePath;
          }
          
          // 詳細ページURL
          const detailUrl = `https://www.pokemon-card.com/card-search/details.php/card/${cardId}/`;
          
          // カテゴリの判定（PCGDECKから取得できない場合は、ページ上の要素から取得を試みる）
          let category = '不明';
          const cardElement = document.querySelector(`[data-card-id="${cardId}"], a[href*="/card/${cardId}/"]`);
          if (cardElement) {
            const categoryElement = cardElement.closest('.card-item, .search-result-item, .result-item');
            if (categoryElement) {
              const categoryText = categoryElement.querySelector('.category, .card-type, .card-category');
              if (categoryText) {
                category = categoryText.textContent.trim();
              }
            }
          }
          
          cards.push({
            cardId,
            name: name || fullName.split('(')[0].trim(),
            fullName: fullName || name,
            category: category,
            imageUrl: imageUrl,
            detailUrl
          });
        } catch (error) {
          console.error('カード情報の抽出エラー:', error);
        }
      });
    } else {
      // PCGDECKが使えない場合のフォールバック: HTML要素から抽出
      const cardElements = document.querySelectorAll(
        '.card-item, .search-result-item, [data-card-id], .result-item, .card-list-item, tr[data-card-id]'
      );
      
      cardElements.forEach((element) => {
        try {
          // カードIDの取得
          let cardId = element.getAttribute('data-card-id');
          if (!cardId) {
            const link = element.querySelector('a[href*="/card/"]');
            if (link) {
              const hrefMatch = link.href.match(/\/card\/(\d{5})\//);
              if (hrefMatch) {
                cardId = hrefMatch[1];
              }
            }
          }
          
          if (!cardId) return;
          
          // カード名の取得
          const nameElement = element.querySelector('.card-name, .name, h3, h4, .card-title, td');
          const name = nameElement ? nameElement.textContent.trim() : '';
          
          // 正式名称（セット情報含む）
          const fullNameElement = element.querySelector('.full-name, .card-full-name, .card-name-full');
          const fullName = fullNameElement ? fullNameElement.textContent.trim() : name;
          
          // カテゴリの取得
          const categoryElement = element.querySelector('.category, .card-type, .card-category');
          const category = categoryElement ? categoryElement.textContent.trim() : '不明';
          
          // 画像URLの取得
          const imgElement = element.querySelector('img');
          let imageUrl = null;
          if (imgElement) {
            imageUrl = imgElement.src || imgElement.getAttribute('data-src');
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = 'https://www.pokemon-card.com' + imageUrl;
            }
          }
          
          // PCGDECKから画像URLを取得（優先）
          if (window.PCGDECK && window.PCGDECK.searchItemCardPict && window.PCGDECK.searchItemCardPict[cardId]) {
            const relativePath = window.PCGDECK.searchItemCardPict[cardId];
            imageUrl = 'https://www.pokemon-card.com' + relativePath;
          }
          
          // 詳細ページURL
          const detailLink = element.querySelector('a[href*="/card/"]');
          let detailUrl = '';
          if (detailLink) {
            detailUrl = detailLink.href;
          } else {
            detailUrl = `https://www.pokemon-card.com/card-search/details.php/card/${cardId}/`;
          }
          
          cards.push({
            cardId,
            name: name || fullName.split('(')[0].trim(),
            fullName: fullName || name,
            category: category,
            imageUrl: imageUrl,
            detailUrl
          });
        } catch (error) {
          console.error('カード情報の抽出エラー:', error);
        }
      });
    }
    
    return cards;
  });
}

/**
 * カード検索を実行
 * @param {Object} params - 検索パラメータ
 * @returns {Promise<Card[]>}
 */
export async function searchCards(params) {
  const page = await createPage();
  
  try {
    console.log('検索開始:', params);
    console.log('アクセスURL:', SEARCH_URL);
    
    // 検索ページにアクセス
    await page.goto(SEARCH_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 現在のURLを確認
    const currentUrl = page.url();
    console.log('現在のURL:', currentUrl);
    console.log('ページタイトル:', await page.title());
    
    // ページの読み込みを待つ
    await page.waitForSelector('body', { timeout: 10000 });
    
    // JavaScriptの実行を待つ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ページの構造を確認（デバッグ用）
    const pageInfo = await page.evaluate(() => {
      return {
        hasForm: !!document.querySelector('form'),
        formAction: document.querySelector('form')?.action || null,
        formMethod: document.querySelector('form')?.method || null,
        hasPCGDECK: !!window.PCGDECK,
        searchInputs: Array.from(document.querySelectorAll('input[type="text"], input[name*="name"], input[name*="card"]')).map(el => ({
          name: el.name,
          id: el.id,
          placeholder: el.placeholder,
          type: el.type
        })),
        searchButtons: Array.from(document.querySelectorAll('button[type="submit"], input[type="submit"], button')).map(el => ({
          type: el.type,
          text: el.textContent.trim(),
          className: el.className
        }))
      };
    });
    console.log('ページ情報:', JSON.stringify(pageInfo, null, 2));
    
    // 検索フォームの要素を探す（複数のパターンを試す）
    let nameInput = null;
    let cardIdInput = null;
    let categorySelect = null;
    let searchButton = null;
    
    // カード名入力欄を探す
    const nameSelectors = [
      'input[name="card_name"]',
      'input[name="name"]',
      'input[placeholder*="カード名"]',
      'input[type="text"]',
      '#card_name',
      '#name'
    ];
    
    for (const selector of nameSelectors) {
      nameInput = await page.$(selector);
      if (nameInput) {
        console.log('カード名入力欄を見つけました:', selector);
        break;
      }
    }
    
    // カードID入力欄を探す
    const idSelectors = [
      'input[name="card_id"]',
      'input[name="cardId"]',
      'input[placeholder*="カードID"]',
      '#card_id',
      '#cardId'
    ];
    
    for (const selector of idSelectors) {
      cardIdInput = await page.$(selector);
      if (cardIdInput) {
        console.log('カードID入力欄を見つけました:', selector);
        break;
      }
    }
    
    // カテゴリ選択を探す
    const categorySelectors = [
      'select[name="card_type"]',
      'select[name="category"]',
      'select[name="type"]',
      '#card_type',
      '#category'
    ];
    
    for (const selector of categorySelectors) {
      categorySelect = await page.$(selector);
      if (categorySelect) {
        console.log('カテゴリ選択を見つけました:', selector);
        break;
      }
    }
    
    // 検索フォームに入力
    if (params.name && nameInput) {
      try {
        // まず要素をスクロールして表示領域に持ってくる
        await nameInput.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 既存の値をクリアしてから入力
        await nameInput.evaluate(el => el.value = '');
        await nameInput.type(params.name, { delay: 50 });
        console.log('カード名を入力:', params.name);
      } catch (error) {
        // クリックできない場合は、JavaScriptで直接値を設定
        console.log('クリックできないため、JavaScriptで値を設定');
        await nameInput.evaluate((el, value) => {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, params.name);
        console.log('カード名を入力（JavaScript経由）:', params.name);
      }
    }
    
    if (params.cardId && cardIdInput) {
      try {
        await cardIdInput.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await cardIdInput.evaluate(el => el.value = '');
        await cardIdInput.type(params.cardId, { delay: 50 });
        console.log('カードIDを入力:', params.cardId);
      } catch (error) {
        console.log('クリックできないため、JavaScriptで値を設定');
        await cardIdInput.evaluate((el, value) => {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, params.cardId);
        console.log('カードIDを入力（JavaScript経由）:', params.cardId);
      }
    }
    
    // カテゴリの選択
    if (params.category && categorySelect) {
      // カテゴリのマッピング
      const categoryMap = {
        'ポケモン': 'pokemon',
        'グッズ': 'goods',
        'ポケモンのどうぐ': 'tool',
        'サポート': 'support',
        'スタジアム': 'stadium',
        'エネルギー': 'energy'
      };
      const categoryValue = categoryMap[params.category] || params.category;
      
      try {
        await categorySelect.select(categoryValue);
        console.log('カテゴリを選択:', categoryValue);
      } catch (e) {
        // 選択できない場合は日本語の値で試す
        try {
          await categorySelect.select(params.category);
        } catch (e2) {
          console.log('カテゴリの選択に失敗:', e2.message);
        }
      }
    }
    
    // 検索ボタンを探す
    const buttonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button.search-button',
      'button.btn-search',
      '.search-button',
      '.btn-search',
      'button:contains("検索")',
      'input[value*="検索"]'
    ];
    
    for (const selector of buttonSelectors) {
      searchButton = await page.$(selector);
      if (searchButton) {
        console.log('検索ボタンを見つけました:', selector);
        break;
      }
    }
    
    // 検索ボタンをクリック
    if (searchButton) {
      try {
        // ボタンを表示領域にスクロール
        await searchButton.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ボタンをクリック
        await searchButton.click();
        console.log('検索ボタンをクリック');
        
        // 検索結果の読み込みを待つ（PCGDECKオブジェクトまたは結果要素の出現を待つ）
        try {
          await page.waitForFunction(
            () => {
              return (window.PCGDECK && window.PCGDECK.searchItemName) ||
                     document.querySelector('.card-item, .search-result, [data-card-id], .result-item, table tbody tr');
            },
            { timeout: 15000 }
          );
          console.log('検索結果の読み込み完了');
        } catch (e) {
          console.log('検索結果の待機タイムアウト、続行します');
        }
      } catch (error) {
        // クリックできない場合は、JavaScriptで直接クリックイベントを発火
        console.log('クリックできないため、JavaScriptで検索を実行');
        await searchButton.evaluate(button => {
          button.click();
        });
        console.log('検索ボタンをクリック（JavaScript経由）');
        
        // 検索結果の読み込みを待つ
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
          await page.waitForFunction(
            () => {
              return (window.PCGDECK && window.PCGDECK.searchItemName) ||
                     document.querySelector('.card-item, .search-result, [data-card-id], .result-item, table tbody tr');
            },
            { timeout: 12000 }
          );
          console.log('検索結果の読み込み完了');
        } catch (e) {
          console.log('検索結果の待機タイムアウト、続行します');
        }
      }
    } else {
      // 検索ボタンが見つからない場合、Enterキーで送信を試みる
      if (nameInput) {
        await nameInput.press('Enter');
        console.log('Enterキーで検索を実行');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        // フォームを直接送信
        const form = await page.$('form');
        if (form) {
          await form.evaluate(form => form.submit());
          console.log('フォームを送信');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    // リクエスト間隔を設ける
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    
    // 追加の待機（JavaScriptの実行を待つ）
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // PCGDECKオブジェクトが更新されるまで待つ（最大5秒）
    let cards = [];
    for (let i = 0; i < 5; i++) {
      cards = await extractCardsFromPage(page);
      if (cards.length > 0) {
        console.log(`検索結果: ${cards.length}件のカードを取得`);
        break;
      }
      console.log(`検索結果の待機中... (${i + 1}/5)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (cards.length === 0) {
      console.log('検索結果が見つかりませんでした。ページのHTMLを確認します...');
      // デバッグ用: ページのHTML構造を確認
      const debugInfo = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          hasPCGDECK: !!window.PCGDECK,
          PCGDECKKeys: window.PCGDECK ? Object.keys(window.PCGDECK) : [],
          searchResults: {
            cardItems: document.querySelectorAll('.card-item, .search-result, [data-card-id], .result-item, table tbody tr').length,
            tables: document.querySelectorAll('table').length,
            lists: document.querySelectorAll('ul, ol').length
          },
          bodyText: document.body.innerText.substring(0, 500) // 最初の500文字
        };
      });
      console.log('デバッグ情報:', JSON.stringify(debugInfo, null, 2));
      
      // スクリーンショットを保存（デバッグ用）
      try {
        await page.screenshot({ path: 'debug-search-page.png', fullPage: false });
        console.log('スクリーンショットを保存: debug-search-page.png');
      } catch (e) {
        console.log('スクリーンショットの保存に失敗:', e.message);
      }
    }
    
    return cards;
  } catch (error) {
    console.error('検索エラー:', error);
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      throw new TimeoutError('検索のタイムアウトが発生しました');
    }
    if (error.message.includes('net::ERR') || error.message.includes('ECONNREFUSED')) {
      throw new NetworkError('ネットワークエラーが発生しました');
    }
    throw error;
  } finally {
    await page.close();
  }
}
