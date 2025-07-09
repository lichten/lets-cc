# DDGame Website - 本番環境デプロイ手順

## システム概要
- **フロントエンド**: React + TypeScript (Vite)
- **バックエンド**: Node.js + Express
- **データベース**: SQLite (data/proxy.db)
- **ベースパス**: /ddgame/
- **ポート**: サーバー 5000、クライアント 5173 (開発時)

## 前提条件
- Node.js v18以上
- npm または yarn
- PM2 (プロセス管理)
- Nginx (リバースプロキシ)
- SSL証明書 (Let's Encrypt推奨)

## 1. サーバー環境構築

### 1.1 依存関係のインストール
```bash
# PM2をグローバルインストール
npm install -g pm2

# Nginx のインストール (Ubuntu/Debian)
sudo apt update
sudo apt install nginx

# SSL証明書取得 (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
```

### 1.2 ユーザー作成
```bash
# アプリケーション用ユーザーを作成
sudo useradd -m -s /bin/bash ddgame
sudo usermod -aG sudo ddgame
```

## 2. アプリケーションのデプロイ

### 2.1 コードのクローン
```bash
# アプリケーションディレクトリに移動
cd /home/ddgame
git clone <リポジトリURL> ddgame-app
cd ddgame-app
```

### 2.2 依存関係のインストール
```bash
# 全体の依存関係をインストール
npm run install-all

# または個別にインストール
npm run install-server
npm run install-client
```

### 2.3 環境変数の設定
```bash
# サーバー用の環境変数ファイルを作成
cd server
cp .env.example .env  # もしくは新規作成
```

`.env` ファイルの内容:
```env
# サーバー設定
PORT=5000
NODE_ENV=production

# データベース設定
DATABASE_PATH=./data/proxy.db

# その他の設定
CORS_ORIGIN=https://yourdomain.com
```

### 2.4 フロントエンドのビルド
```bash
# プロジェクトルートで実行
npm run build
```

## 3. PM2による プロセス管理

### 3.1 PM2設定ファイル作成
`ecosystem.config.js` ファイルを作成:
```javascript
module.exports = {
  apps: [{
    name: 'ddgame-server',
    script: './server/index.js',
    cwd: '/home/ddgame/ddgame-app',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 3.2 PM2でアプリケーション起動
```bash
# ログディレクトリ作成
mkdir -p logs

# アプリケーション起動
pm2 start ecosystem.config.js

# 起動時に自動起動設定
pm2 startup
pm2 save
```

## 4. Nginxの設定

### 4.1 Nginx設定ファイル作成
`/etc/nginx/sites-available/ddgame` ファイルを作成:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt用
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # HTTPSへリダイレクト
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL証明書
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ルートへのアクセスを/ddgame/にリダイレクト
    location = / {
        return 301 https://$server_name/ddgame/;
    }

    # DDGame アプリケーション
    location /ddgame/ {
        # 静的ファイル配信 (フロントエンド)
        alias /home/ddgame/ddgame-app/client/dist/;
        try_files $uri $uri/ /ddgame/index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # アセットファイル用の設定
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API プロキシ (バックエンド)
    location /ddgame/api/ {
        # /ddgame/api/を/api/に書き換え
        rewrite ^/ddgame/api/(.*)$ /api/$1 break;
        
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # その他のパスは404
    location / {
        return 404;
    }

    # セキュリティヘッダー
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 4.2 Nginx設定の有効化
```bash
# 設定ファイルをリンク
sudo ln -s /etc/nginx/sites-available/ddgame /etc/nginx/sites-enabled/

# 設定テスト
sudo nginx -t

# Nginx再起動
sudo systemctl restart nginx
```

## 5. SSL証明書の取得

```bash
# Let's Encrypt証明書取得
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 証明書の自動更新設定
sudo crontab -e
# 以下の行を追加
0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. ファイアウォール設定

```bash
# UFW有効化
sudo ufw enable

# 必要なポートを開放
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# 状態確認
sudo ufw status
```

## 7. デプロイスクリプト

### 7.1 デプロイ用スクリプト作成
`deploy.sh` ファイルを作成:
```bash
#!/bin/bash

set -e

echo "=== DDGame App Deployment ==="

# 最新コードを取得
echo "Pulling latest code..."
git pull origin main

# 依存関係の更新
echo "Installing dependencies..."
npm run install-all

# フロントエンドビルド
echo "Building frontend..."
npm run build

# サーバー再起動
echo "Restarting server..."
pm2 restart ddgame-server

echo "Deployment completed successfully!"
```

```bash
# スクリプトを実行可能にする
chmod +x deploy.sh
```

## 8. 開発環境での確認

### 8.1 開発サーバーでの/ddgame/パステスト
```bash
# 開発環境で確認
npm run dev

# アクセス確認
# http://localhost:5173/ddgame/
```

### 8.2 ビルド後のプレビュー
```bash
# ビルド
npm run build

# プレビュー
cd client && npm run preview

# アクセス確認
# http://localhost:4173/ddgame/
```

## 9. 監視とログ

### 9.1 PM2でのログ監視
```bash
# リアルタイムログ
pm2 logs ddgame-server

# ログファイル場所
# エラーログ: ./logs/err.log
# 出力ログ: ./logs/out.log
# 結合ログ: ./logs/combined.log
```

### 9.2 システム監視
```bash
# PM2プロセス状態確認
pm2 status

# システムリソース監視
pm2 monit

# Nginxログ
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 10. バックアップ

### 10.1 データベースバックアップ
```bash
# SQLiteデータベースのバックアップ
cp server/data/proxy.db backup/proxy_$(date +%Y%m%d_%H%M%S).db
```

### 10.2 定期バックアップ設定
```bash
# crontabに追加
0 2 * * * /home/ddgame/ddgame-app/backup.sh
```

## 11. トラブルシューティング

### 11.1 よくある問題
- **404エラー**: Nginxの`alias`設定と`try_files`を確認
- **APIエラー**: プロキシ設定の`rewrite`ルールを確認
- **ポート競合**: `lsof -i :5000` でポート使用状況を確認
- **権限問題**: ファイル・ディレクトリの所有者とパーミッションを確認
- **メモリ不足**: `pm2 monit` でメモリ使用量を監視

### 11.2 パス関連のトラブルシューティング
```bash
# Viteの設定確認
cat client/vite.config.ts

# ビルドされたファイルの確認
ls -la client/dist/

# Nginxの設定テスト
sudo nginx -t

# アクセスログの確認
sudo tail -f /var/log/nginx/access.log
```

### 11.3 ログの確認場所
- PM2ログ: `./logs/`
- Nginxログ: `/var/log/nginx/`
- システムログ: `/var/log/syslog`

## 12. セキュリティ対策

- 定期的なシステムアップデート
- 不要なポートの閉鎖
- ファイアウォールの適切な設定
- SSL証明書の自動更新
- 定期的なバックアップ
- `/ddgame/`以外のパスへのアクセス制限

---

## 緊急時の対応

### アプリケーション停止
```bash
pm2 stop ddgame-server
```

### アプリケーション再起動
```bash
pm2 restart ddgame-server
```

### 完全リセット
```bash
pm2 delete ddgame-server
pm2 start ecosystem.config.js
```

## 13. 動作確認

デプロイ後、以下のURLで動作確認を行ってください：

- **メインページ**: https://yourdomain.com/ddgame/
- **API確認**: https://yourdomain.com/ddgame/api/game-info
- **ヒーローステータス**: https://yourdomain.com/ddgame/ (ヒーローステータスボタンクリック)
- **アイテム情報**: https://yourdomain.com/ddgame/ (アイテム情報ボタンクリック)