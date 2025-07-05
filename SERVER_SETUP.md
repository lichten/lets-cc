# サーバーセットアップガイド

## Google Sheets API設定

### 1. Google Cloud Console設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. **APIs & Services > Library** で「Google Sheets API」を検索し、有効化
4. **APIs & Services > Credentials** で「API Key」を作成
5. 作成したAPIキーをコピー

### 2. Googleスプレッドシート設定

1. Googleスプレッドシートを作成
2. スプレッドシートのURLからIDを取得
   - URL例: `https://docs.google.com/spreadsheets/d/1ABC123DEF456/edit`
   - ID: `1ABC123DEF456`
3. スプレッドシートを「リンクを知っている全員」に共有設定

### 3. サーバー環境変数設定

`/server/.env.example`をコピーして`/server/.env`ファイルを作成し、以下の値を設定：

```env
PORT=5000
GOOGLE_SHEETS_API_KEY=your_api_key_here
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_RANGE=Sheet1!A1:Z1000
```

### 4. スプレッドシートのデータ形式

スプレッドシートの1行目にヘッダーを設定してください。以下の列名に対応しています：

| 対応する列名（英語） | 対応する列名（日本語） | データ型 | 説明 |
|-------------------|-------------------|---------|------|
| name | 名前 | string | アイテム名 |
| category | カテゴリ | string | weapon, armor, consumable |
| price | 価格 | number | アイテムの価格 |
| description | 説明 | string | アイテムの説明文 |
| rarity | レアリティ | string | common, rare, epic, legendary |
| damage | ダメージ | number | ダメージ値 |
| defense | 防御 | number | 防御力 |
| speed | スピード | number | スピード値 |
| health, hp | 体力, HP | number | 体力値 |

### データ例

```
name        | category  | price | description           | rarity | damage | defense | speed | health
アイテム1    | weapon    | 1000  | 強力な武器            | rare   | 50     |         | 5     |
アイテム2    | armor     | 1200  | 頑丈な防具            | epic   |        | 80      | -2    | 100
```

## サーバー起動

```bash
cd server
npm install
npm run dev
```

## API エンドポイント

現在利用可能なAPIエンドポイントについては、各APIファイルを参照してください。

## トラブルシューティング

### よくあるエラー

1. **API Key not valid**: APIキーが正しく設定されていない
2. **Spreadsheet not found**: スプレッドシートIDが間違っているか、共有設定が不適切
3. **Permission denied**: スプレッドシートの共有設定を確認

### デバッグ方法

- サーバーのコンソールログでエラーメッセージを確認
- 環境変数が正しく設定されているか確認
- Google Cloud Consoleでクォータ制限を確認

## セキュリティ注意事項

- APIキーは公開リポジトリにコミットしないでください
- `.env`ファイルは`.gitignore`に追加してください
- 本番環境では環境変数を適切に設定してください