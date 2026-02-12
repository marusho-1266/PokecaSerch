# Cloudflare D1 テーブル定義書

本ドキュメントは、Cloudflare D1（SQLite 互換）で利用するテーブル・インデックスの定義をまとめたものです。  
スキーマ実体: **`database/schema-d1.sql`**

---

## 1. ER 概要

```
cards (1) ----< waza
cards (1) ----< waza_energy_cost (via waza)
cards (1) ----< abilities
cards ---- card_id_mapping (base / variant)
collection_logs (card_id は cards への論理参照)
products (独立マスタ、--product= 収集時の参照)
```

---

## 2. テーブル一覧

| No. | テーブル名 | 説明 | 主キー |
|-----|------------|------|--------|
| 1 | cards | 基本カード情報 | card_id (TEXT) |
| 2 | waza | ワザ（技） | id (INTEGER AUTOINCREMENT) |
| 3 | waza_energy_cost | ワザのエネルギーコスト | id (INTEGER AUTOINCREMENT) |
| 4 | abilities | 特性 | id (INTEGER AUTOINCREMENT) |
| 5 | card_id_mapping | カードIDマッピング（同一カードの別規制等） | id (INTEGER AUTOINCREMENT) |
| 6 | collection_logs | 収集ログ | id (INTEGER AUTOINCREMENT) |
| 7 | products | 商品マスタ（--product= 収集時の参照） | id (INTEGER AUTOINCREMENT) |

---

## 3. テーブル定義詳細

### 3.1 cards（基本カード情報）

ポケモンカードの基本情報を格納するメインテーブル。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| **card_id** | TEXT | × | — | 主キー。カードを一意に識別するID |
| name | TEXT | × | — | カード名 |
| full_name | TEXT | ○ | — | フルネーム（サブ名含む等） |
| category | TEXT | × | '不明' | カテゴリ（ポケモン・グッズ等） |
| image_url | TEXT | ○ | — | 画像URL |
| detail_url | TEXT | ○ | — | 詳細ページURL |
| hp | INTEGER | ○ | — | 体力（HP） |
| card_type | TEXT | ○ | — | カードタイプ（進化段階等の補助） |
| energy_subtype | TEXT | ○ | — | エネルギーサブタイプ |
| effect_text | TEXT | ○ | — | 効果テキスト |
| evolution_stage | TEXT | ○ | — | 進化段階 |
| pokemon_number | TEXT | ○ | — | ポケモンの図鑑番号 |
| weakness | TEXT | ○ | — | 弱点（表示用） |
| weakness_type | TEXT | ○ | — | 弱点タイプ |
| weakness_value | TEXT | ○ | — | 弱点ダメージ値 |
| resistance | TEXT | ○ | — | 耐性（表示用） |
| resistance_type | TEXT | ○ | — | 耐性タイプ |
| resistance_value | TEXT | ○ | — | 耐性軽減値 |
| retreat_cost | INTEGER | ○ | — | にげるエネルギー数 |
| set_code | TEXT | ○ | — | セットコード |
| set_name | TEXT | ○ | — | セット名 |
| regulation | TEXT | ○ | — | レギュレーション（例: D〜） |
| regulation_mark | TEXT | ○ | — | レギュレーションマーク（カード表記） |
| card_number | TEXT | ○ | — | カード番号（セット内） |
| rarity | TEXT | ○ | — | レアリティ |
| illustrator | TEXT | ○ | — | イラストレーター |
| created_at | TEXT | ○ | datetime('now','localtime') | 作成日時 |
| updated_at | TEXT | ○ | datetime('now','localtime') | 更新日時 |
| last_verified_at | TEXT | ○ | — | 最終確認日時 |
| details_collected_at | TEXT | ○ | — | 詳細収集完了日時 |

**インデックス**

| インデックス名 | カラム | 備考 |
|---------------|--------|------|
| idx_cards_name | name | 名前検索 |
| idx_cards_category | category | カテゴリ絞り込み |
| idx_cards_set_code | set_code | セット検索 |
| idx_cards_regulation | regulation | レギュレーション絞り込み |
| idx_cards_card_type | card_type | タイプ絞り込み |
| idx_cards_evolution_stage | evolution_stage | 進化段階絞り込み |
| idx_cards_hp_null | card_id | WHERE hp IS NULL（詳細未取得のポケモンカード抽出） |
| idx_cards_details_not_collected | card_id | WHERE details_collected_at IS NULL（詳細未収集カード抽出） |

---

### 3.2 waza（ワザ）

カードに紐づくワザ（技）の情報。1 カードに複数ワザを持つ場合がある。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| **id** | INTEGER | × | AUTOINCREMENT | 主キー |
| card_id | TEXT | × | — | 参照: cards(card_id) ON DELETE CASCADE |
| name | TEXT | × | — | ワザ名 |
| name_clean | TEXT | ○ | — | 正規化ワザ名 |
| damage | INTEGER | ○ | — | ダメージ数値 |
| damage_modifier | TEXT | ○ | — | ダメージ修飾（×など） |
| effect | TEXT | ○ | — | ワザ効果テキスト |
| order_index | INTEGER | ○ | 0 | 表示順 |
| created_at | TEXT | ○ | datetime('now','localtime') | 作成日時 |

**インデックス**

| インデックス名 | カラム |
|---------------|--------|
| idx_waza_card_id | card_id |

---

### 3.3 waza_energy_cost（ワザのエネルギーコスト）

ワザごとに必要なエネルギーを種類・順序で保持する。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| **id** | INTEGER | × | AUTOINCREMENT | 主キー |
| waza_id | INTEGER | × | — | 参照: waza(id) ON DELETE CASCADE |
| energy_type | TEXT | × | — | エネルギータイプ |
| order_index | INTEGER | × | — | 並び順 |
| created_at | TEXT | ○ | datetime('now','localtime') | 作成日時 |

**インデックス**

| インデックス名 | カラム |
|---------------|--------|
| idx_waza_energy_cost_waza_id | waza_id |

---

### 3.4 abilities（特性）

カードに紐づく特性の情報。1 カードに複数特性を持つ場合がある。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| **id** | INTEGER | × | AUTOINCREMENT | 主キー |
| card_id | TEXT | × | — | 参照: cards(card_id) ON DELETE CASCADE |
| name | TEXT | × | — | 特性名 |
| effect | TEXT | ○ | — | 効果テキスト |
| order_index | INTEGER | ○ | 0 | 表示順 |
| created_at | TEXT | ○ | datetime('now','localtime') | 作成日時 |

**インデックス**

| インデックス名 | カラム |
|---------------|--------|
| idx_abilities_card_id | card_id |

---

### 3.5 card_id_mapping（カードIDマッピング）

同一カードの別規制・別バリアントなど、card_id 間の対応を保持する。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| **id** | INTEGER | × | AUTOINCREMENT | 主キー |
| base_card_id | TEXT | × | — | 基準となる card_id |
| variant_card_id | TEXT | × | — | 対応する別 card_id |
| regulation | TEXT | ○ | — | レギュレーション |
| relationship | TEXT | ○ | — | 関係種別 |
| created_at | TEXT | ○ | datetime('now','localtime') | 作成日時 |

**インデックス**

| インデックス名 | カラム |
|---------------|--------|
| idx_card_id_mapping_base | base_card_id |
| idx_card_id_mapping_variant | variant_card_id |

---

### 3.6 collection_logs（収集ログ）

カード一覧・詳細収集の実行結果を記録する。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| **id** | INTEGER | × | AUTOINCREMENT | 主キー |
| card_id | TEXT | ○ | — | 対象カードID（論理上 cards 参照） |
| status | TEXT | × | — | ステータス（成功・失敗等） |
| source | TEXT | ○ | — | 収集元識別子 |
| error_message | TEXT | ○ | — | エラー時のメッセージ |
| processing_time_ms | INTEGER | ○ | — | 処理時間（ミリ秒） |
| created_at | TEXT | ○ | datetime('now','localtime') | 作成日時 |

**インデックス**

| インデックス名 | カラム |
|---------------|--------|
| idx_collection_logs_status | status |
| idx_collection_logs_created_at | created_at |

---

### 3.7 products（商品マスタ）

`--product=名前` で収集する際の参照元。expansion_mark / regulation_mark は set_name 紐づけでカードに反映する用。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| **id** | INTEGER | × | AUTOINCREMENT | 主キー |
| product_name | TEXT | × | — | 商品名 |
| regulation | TEXT | × | — | レギュレーション |
| pg_start | INTEGER | × | — | 開始ページ番号 |
| pages | INTEGER | × | 1 | ページ数 |
| expansion_mark | TEXT | ○ | — | 拡張マーク（セット名紐づけ用） |
| regulation_mark | TEXT | ○ | — | レギュレーションマーク（セット名紐づけ用） |
| slug | TEXT | ○ | — | URL等で使うスラッグ |
| released_at | TEXT | ○ | — | 発売日 |
| product_type | TEXT | ○ | — | 商品種別 |
| is_active | INTEGER | ○ | 1 | 有効フラグ（1=有効） |
| notes | TEXT | ○ | — | 備考 |
| created_at | TEXT | ○ | datetime('now','localtime') | 作成日時 |
| updated_at | TEXT | ○ | datetime('now','localtime') | 更新日時 |

**インデックス**

| インデックス名 | カラム |
|---------------|--------|
| idx_products_product_name | product_name |
| idx_products_slug | slug |

---

## 4. 参照関係まとめ

| 子テーブル | 参照先 | カラム | 削除時 |
|------------|--------|--------|--------|
| waza | cards | card_id | CASCADE |
| waza_energy_cost | waza | waza_id | CASCADE |
| abilities | cards | card_id | CASCADE |
| collection_logs | cards | card_id | 論理参照（FK 未定義） |

`card_id_mapping` の base_card_id / variant_card_id は cards の card_id と整合を取るが、D1 スキーマでは外部キー制約は未定義。

---

## 5. 日時・型の注意（D1/SQLite）

- **日時**: すべて `TEXT` で保持。デフォルトは `datetime('now','localtime')`。
- **主キー**: `cards` のみ `TEXT` 主キー。その他は `INTEGER PRIMARY KEY AUTOINCREMENT`。
- **真偽**: `products.is_active` は INTEGER（0/1）で表現。

---

## 6. 関連ドキュメント

- [Cloudflare D1 利用仕様.md](Cloudflare%20D1%20利用仕様.md) — 設定・実行手順・クエリ例
- [データ取得コマンド一覧.md](データ取得コマンド一覧.md) — 収集・初期化コマンド
- [レギュレーション管理方針.md](レギュレーション管理方針.md) — regulation / regulation_mark の運用
