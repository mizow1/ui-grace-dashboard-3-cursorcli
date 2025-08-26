# SEOダッシュボード - Xserver VPS環境構築ガイド

## 1. 基本環境の準備

### Node.js環境のセットアップ
```bash
# Node.js 18.x LTSのインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# npmのアップデート
sudo npm install -g npm@latest

# PM2のインストール（プロセス管理）
sudo npm install -g pm2
```

### Nginxのインストール（リバースプロキシ用）
```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### SSL証明書（Let's Encrypt）
```bash
sudo apt install certbot python3-certbot-nginx
```

## 2. アプリケーションのデプロイ

### プロジェクトのクローンとビルド
```bash
# プロジェクトディレクトリの作成
sudo mkdir -p /var/www/seo-dashboard
sudo chown $USER:$USER /var/www/seo-dashboard

# プロジェクトファイルのアップロード（Git使用の場合）
cd /var/www/seo-dashboard
git clone <your-repository-url> .

# 依存関係のインストール
npm install

# 本番用ビルド
npm run build
```

### Vercel Functions用のサーバーレス環境（代替案）
```bash
# Serverless Frameworkまたは Express.jsでAPI実装
npm install -g serverless
# または
npm install express cors helmet compression
```

## 3. Nginx設定

### サイト設定ファイル作成
```bash
sudo nano /etc/nginx/sites-available/seo-dashboard
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/seo-dashboard/dist;
    index index.html;

    # SPAのためのフォールバック設定
    location / {
        try_files $uri $uri/ /index.html;
    }

    # APIエンドポイント（Express.jsサーバー用）
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静的ファイルのキャッシュ設定
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 設定の有効化
```bash
sudo ln -s /etc/nginx/sites-available/seo-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Express.js APIサーバーの作成

### API サーバーファイル作成
```bash
nano /var/www/seo-dashboard/server.js
```

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { XMLParser } = require('fast-xml-parser');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Crawl API endpoint (api/crawl.tsの内容を移植)
app.get('/api/crawl', async (req, res) => {
  // ここにapi/crawl.tsの処理を実装
  // クロール機能の実装...
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});

module.exports = app;
```

### 必要なパッケージのインストール
```bash
cd /var/www/seo-dashboard
npm install express cors helmet compression fast-xml-parser cheerio
```

## 5. PM2でプロセス管理

### PM2設定ファイル作成
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'seo-dashboard-api',
    script: 'server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/seo-dashboard-error.log',
    out_file: '/var/log/pm2/seo-dashboard-out.log',
    log_file: '/var/log/pm2/seo-dashboard-combined.log'
  }]
};
```

### アプリケーションの起動
```bash
# ログディレクトリ作成
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# PM2でアプリ起動
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 6. SSL証明書の設定

```bash
# SSL証明書の取得と自動更新設定
sudo certbot --nginx -d your-domain.com

# 自動更新の確認
sudo certbot renew --dry-run
```

## 7. ファイアウォール設定

```bash
# UFWの有効化と基本設定
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

## 8. 監視とログ

### ログローテーション設定
```bash
sudo nano /etc/logrotate.d/seo-dashboard
```

```
/var/log/pm2/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
```

### システム監視
```bash
# htopのインストール
sudo apt install htop

# ディスク使用量監視
df -h

# メモリ使用量確認
free -h
```

## 9. デプロイメント自動化（オプション）

### GitHub Actionsまたは簡単なデプロイスクリプト
```bash
nano deploy.sh
```

```bash
#!/bin/bash
cd /var/www/seo-dashboard

# 最新コードの取得
git pull origin main

# 依存関係の更新
npm install

# フロントエンドのビルド
npm run build

# APIサーバーの再起動
pm2 restart seo-dashboard-api

echo "Deployment completed!"
```

```bash
chmod +x deploy.sh
```

## 10. 環境変数の設定

```bash
nano .env
```

```
NODE_ENV=production
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```

## システム要件まとめ

### 最小構成
- **VPS**: 2GB RAM, 2CPU, 50GB SSD
- **帯域幅**: 月100GB以上
- **費用**: 月額 ¥800-1,500程度

### 推奨構成
- **VPS**: 4GB RAM, 4CPU, 100GB SSD
- **帯域幅**: 月500GB以上
- **費用**: 月額 ¥1,500-3,000程度

### 追加考慮事項
1. **データベース**: 必要に応じてMySQLまたはPostgreSQLを追加
2. **CDN**: 静的ファイル配信の高速化
3. **バックアップ**: 定期的なデータバックアップ体制
4. **セキュリティ**: 定期的なセキュリティアップデート

このガイドに従って構築することで、Xserver VPS上でSEOダッシュボードを安定稼働させることができます。