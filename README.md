# ポケモンカード検索ツール

ポケモンカードゲーム公式サイトのカードデータベースから、様々な条件でカードを検索し、詳細情報を取得・表示するツールです。

## 機能

### Phase 1 (MVP)

- カード名検索
- カードID検索
- カテゴリ検索
- 検索結果一覧表示
- カード詳細表示

## 技術スタック

- **バックエンド**: Node.js + Express.js
- **スクレイピング**: Puppeteer
- **フロントエンド**: React + Vite
- **API**: RESTful API

## セットアップ

### 前提条件

- Node.js >= 16.0.0
- npm または yarn

### インストール

1. 依存関係のインストール

```bash
npm install
```

2. バックエンドの依存関係をインストール

```bash
cd server
npm install
```

3. フロントエンドの依存関係をインストール

```bash
cd client
npm install
```

### 環境変数

`server/.env` ファイルを作成（`server/.env.example`を参考に）：

```
PORT=3001
NODE_ENV=development
```

## 実行方法

### 開発モード

ルートディレクトリから：

```bash
npm run dev
```

これにより、バックエンド（ポート3001）とフロントエンド（ポート3000）が同時に起動します。

### 個別に起動

バックエンドのみ：

```bash
cd server
npm run dev
```

フロントエンドのみ：

```bash
cd client
npm run dev
```

## APIエンドポイント

### GET /api/cards/search

カード検索を実行

**クエリパラメータ:**
- `name` (string, オプション): カード名（部分一致）
- `cardId` (string, オプション): カードID（5桁）
- `category` (string, オプション): カテゴリ
- `page` (number, オプション): ページ番号（デフォルト: 1）
- `limit` (number, オプション): 1ページあたりの件数（デフォルト: 20）

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "cards": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### GET /api/cards/:cardId

カードIDから詳細情報を取得

**パラメータ:**
- `cardId` (string): カードID（5桁）

**クエリパラメータ:**
- `regulation` (string, オプション): レギュレーション

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "cardId": "46326",
    "name": "ピカチュウ",
    "fullName": "ピカチュウ(SV7a 080/064)",
    "category": "ポケモン",
    "hp": 60,
    "type": "雷",
    "waza": [...],
    ...
  }
}
```

## プロジェクト構造

```
PokecaSerch/
├── server/                 # バックエンド
│   ├── src/
│   │   ├── server.js      # Expressサーバー
│   │   ├── routes/        # APIルート
│   │   ├── services/      # ビジネスロジック
│   │   └── utils/         # ユーティリティ
│   └── package.json
├── client/                 # フロントエンド
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/    # Reactコンポーネント
│   │   ├── services/      # API通信
│   │   └── styles/        # CSS
│   └── package.json
└── docs/                   # ドキュメント
```

## 注意事項

- このツールは非公式のツールです。公式サイトの利用規約を遵守してご利用ください。
- 公式サイトの仕様変更により、本ツールが動作しなくなる可能性があります。
- サーバーへの負荷を考慮し、適切な間隔でリクエストしてください（実装では1秒以上の間隔を設けています）。

## ライセンス

MIT License

## 免責事項

このツールは非公式のツールです。公式サイトの利用規約を遵守してご利用ください。公式サイトの仕様変更により、本ツールが動作しなくなる可能性があります。
