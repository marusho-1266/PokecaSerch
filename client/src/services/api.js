/**
 * API通信サービス
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * APIリクエストの共通処理
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'リクエストに失敗しました');
    }
    
    return data;
  } catch (error) {
    console.error('APIエラー:', error);
    throw error;
  }
}

/**
 * カード検索
 * @param {Object} params - 検索パラメータ
 * @returns {Promise<Object>}
 */
export async function searchCards(params) {
  const queryParams = new URLSearchParams();
  
  if (params.name) queryParams.append('name', params.name);
  if (params.cardId) queryParams.append('cardId', params.cardId);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const queryString = queryParams.toString();
  const endpoint = `/cards/search${queryString ? `?${queryString}` : ''}`;
  
  return await request(endpoint);
}

/**
 * カード詳細を取得
 * @param {string} cardId - カードID
 * @param {string} [regulation] - レギュレーション
 * @returns {Promise<Object>}
 */
export async function getCardDetail(cardId, regulation) {
  const queryParams = new URLSearchParams();
  if (regulation) queryParams.append('regulation', regulation);
  
  const queryString = queryParams.toString();
  const endpoint = `/cards/${cardId}${queryString ? `?${queryString}` : ''}`;
  
  return await request(endpoint);
}
