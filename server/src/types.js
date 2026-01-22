/**
 * @typedef {Object} Card
 * @property {string} cardId - 5桁のカードID
 * @property {string} name - カード名
 * @property {string} fullName - 正式名称（セット情報含む）
 * @property {string} category - カテゴリ
 * @property {string|null} imageUrl - 画像URL
 * @property {string} detailUrl - 詳細ページURL
 * @property {string} [type] - タイプ（ポケモンの場合）
 * @property {number} [hp] - HP（ポケモンの場合）
 * @property {string} [evolutionStage] - 進化段階（ポケモンの場合）
 * @property {string} [weakness] - 弱点（ポケモンの場合）
 * @property {string} [resistance] - 抵抗力（ポケモンの場合）
 * @property {number} [retreatCost] - にげるコスト（ポケモンの場合）
 * @property {string} [setName] - セット名
 * @property {string} [setCode] - セットコード
 * @property {string} [cardNumber] - カード番号
 * @property {string[]} [regulations] - 使用可能なレギュレーション
 */

/**
 * @typedef {Object} Waza
 * @property {string} name - ワザ名
 * @property {string} nameClean - ワザ名（クリーン版）
 * @property {string[]} energyCost - 必要エネルギー（配列）
 * @property {number|null} damage - ダメージ
 * @property {string} effect - 効果文
 */

/**
 * @typedef {Object} CardDetail
 * @property {string} cardId - 5桁のカードID
 * @property {string} name - カード名
 * @property {string} fullName - 正式名称（セット情報含む）
 * @property {string} category - カテゴリ
 * @property {string|null} imageUrl - 画像URL
 * @property {string} detailUrl - 詳細ページURL
 * @property {string} [type] - タイプ（ポケモンの場合）
 * @property {number} [hp] - HP（ポケモンの場合）
 * @property {string} [evolutionStage] - 進化段階（ポケモンの場合）
 * @property {string} [weakness] - 弱点（ポケモンの場合）
 * @property {string} [resistance] - 抵抗力（ポケモンの場合）
 * @property {number} [retreatCost] - にげるコスト（ポケモンの場合）
 * @property {string} [setName] - セット名
 * @property {string} [setCode] - セットコード
 * @property {string} [cardNumber] - カード番号
 * @property {string[]} [regulations] - 使用可能なレギュレーション
 * @property {Waza[]} [waza] - ワザ情報（ポケモンの場合）
 * @property {string} [pokedexNumber] - ポケモン図鑑番号
 * @property {string} [illustrator] - イラストレーター
 * @property {string} [rarity] - レアリティ
 */
