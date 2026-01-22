/**
 * カード詳細情報の取得
 */

import { createPage } from '../utils/browser.js';
import { NotFoundError, TimeoutError, NetworkError } from '../utils/errors.js';

const REQUEST_DELAY = 1000; // 1秒

/**
 * ワザ情報を抽出
 * @param {puppeteer.Page} page - Puppeteerページ
 * @returns {Promise<Waza[]>}
 */
async function extractWazaInfo(page) {
  return await page.evaluate(() => {
    const waza = [];
    
    // ワザセクションを探す
    const wazaSection = Array.from(document.querySelectorAll('h2')).find(
      h2 => h2.textContent.includes('ワザ')
    );
    
    if (!wazaSection) {
      return waza;
    }
    
    let current = wazaSection.nextElementSibling;
    
    while (current && current.tagName !== 'TABLE' && !current.textContent.includes('進化')) {
      if (current.tagName === 'H4') {
        const wazaElement = current;
        
        // エネルギーコストの抽出
        const energyCost = [];
        const energyIcons = wazaElement.querySelectorAll('span.icon');
        energyIcons.forEach(span => {
          const className = span.className || '';
          const typeMatch = className.match(/icon-([a-z]+)/);
          if (typeMatch) {
            energyCost.push(typeMatch[1]);
          }
        });
        
        // 技名の抽出（エネルギーアイコンとダメージを除く）
        const wazaNameFull = wazaElement.textContent.trim();
        const wazaNameClean = wazaElement.textContent
          .replace(/\d+/g, '')
          .replace(/icon-[a-z]+/g, '')
          .trim();
        
        // ダメージの抽出
        const damageMatch = wazaNameFull.match(/(\d+)$/);
        const damage = damageMatch ? parseInt(damageMatch[1]) : null;
        
        // 技の効果の抽出
        let effect = '';
        let next = current.nextElementSibling;
        if (next && next.tagName === 'P') {
          effect = next.textContent.trim();
        }
        
        waza.push({
          name: wazaNameFull,
          nameClean: wazaNameClean,
          energyCost: energyCost,
          damage: damage,
          effect: effect
        });
      }
      current = current.nextElementSibling;
    }
    
    return waza;
  });
}

/**
 * 基本情報を抽出（HP、進化段階など）
 * @param {puppeteer.Page} page - Puppeteerページ
 * @returns {Promise<Object>}
 */
async function extractBasicInfo(page) {
  return await page.evaluate(() => {
    const result = {
      hp: null,
      evolutionStage: null,
      type: null
    };
    
    // HPの抽出
    const hpText = document.body.innerText.match(/HP\s*(\d+)/);
    if (hpText) {
      result.hp = parseInt(hpText[1]);
    }
    
    // 進化段階の抽出（CSSセレクターを優先）
    const typeElement = document.querySelector('span.type');
    if (typeElement) {
      const text = typeElement.textContent.trim();
      if (text === 'たね') {
        result.evolutionStage = 'たね';
      } else if (text.match(/^1\s*進化$/)) {
        result.evolutionStage = '1進化';
      } else if (text.match(/^2\s*進化$/)) {
        result.evolutionStage = '2進化';
      }
    }
    
    // CSSセレクターで取得できない場合のフォールバック
    if (!result.evolutionStage) {
      const bodyText = document.body.innerText;
      if (bodyText.match(/\bたね\b/)) {
        result.evolutionStage = 'たね';
      } else if (bodyText.match(/2\s*進化/)) {
        result.evolutionStage = '2進化';
      } else if (bodyText.match(/1\s*進化/)) {
        result.evolutionStage = '1進化';
      }
    }
    
    // タイプの抽出（ポケモンの場合）
    const typeIcon = document.querySelector('.type-icon, .pokemon-type');
    if (typeIcon) {
      const className = typeIcon.className || '';
      const typeMatch = className.match(/icon-([a-z]+)/);
      if (typeMatch) {
        const typeMap = {
          'grass': '草',
          'fire': '炎',
          'water': '水',
          'lightning': '雷',
          'psychic': '超',
          'fighting': '闘',
          'dark': '悪',
          'metal': '鋼',
          'colorless': '無色'
        };
        result.type = typeMap[typeMatch[1]] || typeMatch[1];
      }
    }
    
    return result;
  });
}

/**
 * 弱点・抵抗力・にげるコストを抽出
 * @param {puppeteer.Page} page - Puppeteerページ
 * @returns {Promise<Object>}
 */
async function extractWeaknessResistance(page) {
  return await page.evaluate(() => {
    const result = {
      weakness: '',
      resistance: '',
      retreatCost: null
    };
    
    const table = document.querySelector('table');
    if (table) {
      const rows = table.querySelectorAll('tr');
      if (rows.length > 1) {
        const cells = rows[1].querySelectorAll('td');
        if (cells.length >= 3) {
          result.weakness = cells[0].textContent.trim();
          result.resistance = cells[1].textContent.trim();
          const retreatText = cells[2].textContent.trim();
          const retreatMatch = retreatText.match(/(\d+)/);
          if (retreatMatch) {
            result.retreatCost = parseInt(retreatMatch[1]);
          }
        }
      }
    }
    
    return result;
  });
}

/**
 * セット情報を抽出
 * @param {puppeteer.Page} page - Puppeteerページ
 * @returns {Promise<Object>}
 */
async function extractSetInfo(page) {
  return await page.evaluate(() => {
    const result = {
      setName: '',
      setCode: '',
      cardNumber: '',
      rarity: ''
    };
    
    // セット情報の抽出（ページ構造に応じて調整）
    const setInfoElement = document.querySelector('.set-info, .card-set');
    if (setInfoElement) {
      const text = setInfoElement.textContent.trim();
      // セットコードとカード番号のパターンを抽出
      const setMatch = text.match(/([A-Z]\d+[a-z]?)\s*(\d+\/\d+)/);
      if (setMatch) {
        result.setCode = setMatch[1];
        result.cardNumber = setMatch[2];
      }
      result.setName = text;
    }
    
    // レアリティの抽出
    const rarityElement = document.querySelector('.rarity, .card-rarity');
    if (rarityElement) {
      result.rarity = rarityElement.textContent.trim();
    }
    
    return result;
  });
}

/**
 * カード詳細情報を取得
 * @param {string} cardId - カードID（5桁）
 * @param {string} [regulation] - レギュレーション（オプション）
 * @returns {Promise<CardDetail>}
 */
export async function getCardDetail(cardId, regulation = 'SV') {
  const page = await createPage();
  
  try {
    // カード詳細ページのURLを構築
    let detailUrl = `https://www.pokemon-card.com/card-search/details.php/card/${cardId}/`;
    if (regulation) {
      detailUrl += `regu/${regulation}/`;
    }
    
    // ページにアクセス
    await page.goto(detailUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // ページが存在するか確認
    const pageTitle = await page.title();
    if (pageTitle.includes('404') || pageTitle.includes('見つかりません')) {
      throw new NotFoundError(`カードID ${cardId} が見つかりませんでした`);
    }
    
    // ワザセクションが表示されるまで待機
    await page.waitForSelector('h2, h1', { timeout: 10000 }).catch(() => {
      // セレクターが見つからない場合は続行
    });
    
    // リクエスト間隔を設ける
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    
    // 各種情報を抽出
    const [wazaInfo, basicInfo, weaknessResistance, setInfo] = await Promise.all([
      extractWazaInfo(page),
      extractBasicInfo(page),
      extractWeaknessResistance(page),
      extractSetInfo(page)
    ]);
    
    // カード名を取得
    const cardName = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : '';
    });
    
    // 画像URLを取得（PCGDECKオブジェクトから）
    const imageUrl = await page.evaluate((id) => {
      if (window.PCGDECK && window.PCGDECK.searchItemCardPict && window.PCGDECK.searchItemCardPict[id]) {
        const relativePath = window.PCGDECK.searchItemCardPict[id];
        return 'https://www.pokemon-card.com' + relativePath;
      }
      return null;
    }, cardId);
    
    // カード詳細情報を構築
    const cardDetail = {
      cardId,
      name: cardName.split('(')[0].trim(),
      fullName: cardName,
      category: 'ポケモン', // デフォルト、実際のページから取得可能な場合は更新
      imageUrl,
      detailUrl,
      type: basicInfo.type,
      hp: basicInfo.hp,
      evolutionStage: basicInfo.evolutionStage,
      weakness: weaknessResistance.weakness,
      resistance: weaknessResistance.resistance,
      retreatCost: weaknessResistance.retreatCost,
      setName: setInfo.setName,
      setCode: setInfo.setCode,
      cardNumber: setInfo.cardNumber,
      rarity: setInfo.rarity,
      waza: wazaInfo
    };
    
    return cardDetail;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      throw new TimeoutError('カード詳細の取得がタイムアウトしました');
    }
    if (error.message.includes('net::ERR') || error.message.includes('ECONNREFUSED')) {
      throw new NetworkError('ネットワークエラーが発生しました');
    }
    throw error;
  } finally {
    await page.close();
  }
}
