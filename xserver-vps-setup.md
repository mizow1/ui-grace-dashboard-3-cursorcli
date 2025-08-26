# Xserver VPS 専用セットアップガイド

## 1. Xserver VPS初期設定

### VPS契約とOS選択
1. **推奨プラン**: 2GB以上（月額880円～）
2. **OS**: Ubuntu 22.04 LTS
3. **初期セットアップ**: SSH鍵認証を推奨

### 初回ログインと基本設定
```bash
# rootユーザーでログイン
ssh root@your-server-ip

# システムの更新
apt update && apt upgrade -y

# 作業用ユーザーの作成
adduser seouser
usermod -aG sudo seouser

# SSH鍵認証の設定（セキュリティ向上）
mkdir -p /home/seouser/.ssh
cp ~/.ssh/authorized_keys /home/seouser/.ssh/
chown -R seouser:seouser /home/seouser/.ssh
chmod 700 /home/seouser/.ssh
chmod 600 /home/seouser/.ssh/authorized_keys
```

## 2. セキュリティ設定

### SSH設定の変更
```bash
sudo nano /etc/ssh/sshd_config
```

```
# ポート変更（オプション）
Port 2022

# rootログインの無効化
PermitRootLogin no

# パスワード認証の無効化
PasswordAuthentication no

# 空パスワードの無効化
PermitEmptyPasswords no
```

```bash
sudo systemctl restart ssh
```

### ファイアウォール設定
```bash
# UFWの初期設定
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 必要なポートを開放
sudo ufw allow 2022/tcp  # SSH（ポート変更した場合）
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# ファイアウォール有効化
sudo ufw enable
```

## 3. Xserver VPS特有の設定

### Xserver VPSコントロールパネル設定
1. **DNSレコード設定**: Aレコードでドメインを設定
2. **SSL証明書**: 後でLet's Encryptを使用
3. **監視設定**: CPU/メモリ使用率のアラート設定

### スワップファイルの作成（メモリ不足対策）
```bash
# 2GBのスワップファイル作成
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永続化設定
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# スワップ使用の最適化
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

## 4. Node.js環境のセットアップ

### Node Version Manager (NVM) を使用した最新Node.js環境
```bash
# NVMのインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 最新LTS版Node.jsのインストール
nvm install --lts
nvm use --lts
nvm alias default node

# npmのグローバルパッケージ
npm install -g pm2 npm@latest

# Node.jsとnpmのバージョン確認
node --version
npm --version
```

## 5. アプリケーションデプロイメント

### GitHubからのデプロイ
```bash
# プロジェクトディレクトリの準備
sudo mkdir -p /var/www
sudo chown seouser:seouser /var/www
cd /var/www

# リポジトリのクローン
git clone https://github.com/your-username/seo-dashboard.git
cd seo-dashboard

# 依存関係のインストール
npm install

# 環境変数設定
cp .env.example .env
nano .env
```

### 環境変数の設定
```bash
# .envファイルの内容
NODE_ENV=production
PORT=3001
GEMINI_API_KEY=your_actual_gemini_api_key
ALLOWED_ORIGINS=https://your-domain.com
```

### ビルドと起動
```bash
# フロントエンドのビルド
npm run build

# Express.jsサーバーファイルの作成
nano server.js
```

```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// セキュリティとパフォーマンス
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.use('/api', require('./api-routes'));

// SPA用のフォールバック
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### API ルートファイルの作成
```bash
nano api-routes.js
```

```javascript
const express = require('express');
const router = express.Router();
const { XMLParser } = require('fast-xml-parser');
const cheerio = require('cheerio');

// クロール機能の実装
router.get('/crawl', async (req, res) => {
  try {
    const { url, maxPages = 20, maxDepth = 2 } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // ここにクロール処理を実装
    // （api/crawl.tsの内容を移植）
    
    res.json({ 
      domainUrl: url,
      pages: [] // 実際のクロール結果
    });
  } catch (error) {
    console.error('Crawl error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ヘルスチェック
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
```

## 6. Nginx設定

### Nginxのインストールと設定
```bash
sudo apt install nginx

# Nginx設定ファイル
sudo nano /etc/nginx/sites-available/seo-dashboard
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Let's Encryptの認証用
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # HTTPSへのリダイレクト
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL設定（Let's Encryptで自動設定される）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # セキュリティヘッダー
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip圧縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Static files
    location /assets/ {
        root /var/www/seo-dashboard/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # SPA fallback
    location / {
        root /var/www/seo-dashboard/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
}
```

### 設定の有効化
```bash
sudo ln -s /etc/nginx/sites-available/seo-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

## 7. SSL証明書の設定

```bash
# Certbotのインストール
sudo apt install certbot python3-certbot-nginx

# SSL証明書の取得
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自動更新のテスト
sudo certbot renew --dry-run
```

## 8. PM2設定とプロセス監視

### PM2設定ファイル
```bash
nano /var/www/seo-dashboard/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'seo-dashboard',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    error_file: '/var/log/pm2/seo-dashboard-error.log',
    out_file: '/var/log/pm2/seo-dashboard-out.log',
    log_file: '/var/log/pm2/seo-dashboard-combined.log',
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', 'dist', 'logs'],
    restart_delay: 5000
  }]
};
```

### PM2起動と監視
```bash
# ログディレクトリ作成
sudo mkdir -p /var/log/pm2
sudo chown seouser:seouser /var/log/pm2

# アプリケーション起動
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 監視
pm2 monit
pm2 logs
```

## 9. 定期バックアップ設定

```bash
# バックアップスクリプト作成
nano /home/seouser/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/seouser/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# アプリケーションファイルのバックアップ
tar czf $BACKUP_DIR/seo-dashboard_$DATE.tar.gz -C /var/www seo-dashboard

# 古いバックアップの削除（30日以上前）
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /home/seouser/backup.sh

# Cronで定期実行（毎日午前2時）
crontab -e
```

```
0 2 * * * /home/seouser/backup.sh >> /var/log/backup.log 2>&1
```

## 10. 監視とアラート

### システム監視スクリプト
```bash
nano /home/seouser/monitor.sh
```

```bash
#!/bin/bash
# CPU使用率チェック
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')

# アラート閾値
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85

if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
    echo "High CPU usage: $CPU_USAGE%" | mail -s "Alert: High CPU" admin@your-domain.com
fi

if (( $(echo "$MEMORY_USAGE > $MEMORY_THRESHOLD" | bc -l) )); then
    echo "High Memory usage: $MEMORY_USAGE%" | mail -s "Alert: High Memory" admin@your-domain.com
fi
```

## まとめ

このガイドに従って設定することで、Xserver VPS上で以下が実現できます：

- **安定したSEOダッシュボードの稼働**
- **SSL対応のセキュアな環境**
- **自動監視とアラート**
- **定期バックアップ**
- **高いパフォーマンス**

**推奨VPSプラン**: 
- 開発・テスト環境: 2GB RAM プラン（月額880円）
- 本番環境: 4GB RAM プラン（月額1,980円）

これで、Xserver VPS上でSEOダッシュボードを安全かつ効率的に運用できます。