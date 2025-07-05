# API リファレンス

このドキュメントは Deadlock Game Website のサーバーAPIについて説明します。

## ベースURL

```
http://localhost:5000
```

## エンドポイント一覧

### GET /api/item-info

アイテム情報を取得するAPIエンドポイントです。

#### 基本的な使用方法

```
GET /api/item-info
```

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| refresh | boolean | ✗ | `true` を指定するとキャッシュを無視してGoogle Sheetsから最新データを取得 |

#### レスポンス例

```json
[
  {
    "種類": "スピリット",
    "id": "3001",
    "ability_no": "",
    "upgradesto_id1": "",
    "upgradesto_id2": "",
    "upgradesto_id3": "",
    "upgradesfrom_id": "",
    "価格": "800",
    "名称": "エクストラスピリット1",
    "ボーナス": "",
    "解説文": "",
    "パッシブ": "FALSE",
    "PCooldown": "",
    "アクティブ": "FALSE",
    "ACooldown": "",
    "スペック1": "",
    "スペック2": "",
    "スペック3": "",
    "スペック4": ""
  }
]
```

#### キャッシュ機能

- デフォルトでは60分間キャッシュされたデータを返します
- Google Sheetsへのアクセス回数を削減し、レスポンス速度を向上させます
- キャッシュは SQLite データベース（`server/data/proxy.db`）に保存されます

#### 強制更新機能

スプレッドシート編集者が変更内容をすぐに確認したい場合：

```
GET /api/item-info?refresh=true
```

- キャッシュを無視してGoogle Sheetsから最新データを取得
- 取得したデータで既存のキャッシュを更新
- スプレッドシート更新後の確認作業に使用

#### エラーハンドリング

- Google Sheets APIキーが設定されていない場合：デフォルトデータを返却
- Google Sheetsアクセスエラー：デフォルトデータを返却
- スプレッドシートにデータが存在しない場合：デフォルトデータを返却

### GET /api/game-info

ゲーム情報を取得するAPIエンドポイントです。

### GET /api/status-info

ステータス情報を取得するAPIエンドポイントです。

## データベース

### キャッシュシステム

本APIはSQLiteデータベースを使用してレスポンスデータをキャッシュします。

#### データベース構造

```sql
CREATE TABLE cache_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cache_key TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### キャッシュキー

| エンドポイント | キャッシュキー |
|---------------|----------------|
| /api/item-info | `item_info` |

## 開発・デバッグ

### ログ出力

サーバーコンソールで以下の情報を確認できます：

- キャッシュヒット/ミス
- Google Sheetsアクセス状況
- エラー情報
- データ取得件数

### トラブルシューティング

1. **データが更新されない**
   - `?refresh=true` パラメータで強制更新を試行
   - サーバーログでエラーメッセージを確認

2. **レスポンスが遅い**
   - キャッシュが正常に動作しているか確認
   - Google Sheets APIクォータ制限を確認

3. **デフォルトデータが返される**
   - 環境変数 `GOOGLE_SHEETS_API_KEY` が設定されているか確認
   - スプレッドシートの共有設定を確認