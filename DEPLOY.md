# デプロイ設定ガイド

## GitHub Actions 自動デプロイの設定

### 1. GitHubリポジトリでのSecrets設定

GitHubリポジトリの Settings → Secrets and variables → Actions で以下のSecretsを追加：

```
VPS_HOST: your-server-ip-address
VPS_USER: seouser
VPS_SSH_KEY: your-private-ssh-key
VPS_PORT: 22 (または変更したSSHポート)
```

### 2. SSH鍵の準備

**ローカルで新しいSSH鍵を作成:**
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_key
```

**公開鍵をVPSサーバーに追加:**
```bash
# VPSサーバーで実行
cat >> ~/.ssh/authorized_keys << EOF
ssh-rsa AAAAB3NzaC1yc2E... (公開鍵の内容)
EOF
```

**秘密鍵をGitHub Secretsに追加:**
- `VPS_SSH_KEY` に `~/.ssh/github_actions_key` の内容をコピペ

### 3. VPSサーバーでの初期設定

```bash
# プロジェクトディレクトリ作成
sudo mkdir -p /var/www
sudo chown seouser:seouser /var/www
cd /var/www

# リポジトリクローン
git clone https://github.com/your-username/ui-grace-dashboard-3-cursorcli.git seo-dashboard
cd seo-dashboard

# 初回セットアップ
npm install
npm run build

# PM2設定ファイル作成
cp ecosystem.config.js.example ecosystem.config.js
```

### 4. ecosystem.config.js の設定

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
    max_memory_restart: '500M',
    watch: false,
    restart_delay: 5000
  }]
};
```

### 5. 手動デプロイ方法

**デプロイスクリプトの実行権限付与:**
```bash
chmod +x deploy.sh
```

**手動デプロイ実行:**
```bash
./deploy.sh
```

## 自動デプロイの流れ

1. **コード変更をmainブランチにプッシュ**
2. **GitHub Actions自動実行:**
   - ✅ コード品質チェック (ESLint)
   - ✅ ビルド実行
   - ✅ VPSサーバーにSSH接続
   - ✅ 最新コード取得 (git pull)
   - ✅ 依存関係更新 (npm install)
   - ✅ ビルド実行 (npm run build)
   - ✅ PM2アプリ再起動

## トラブルシューティング

### GitHub Actionsが失敗する場合

1. **SSH接続エラー:**
   - VPS_HOST, VPS_USER, VPS_SSH_KEY を確認
   - SSH鍵の形式確認（改行コードも含む）

2. **ビルドエラー:**
   - ローカルで `npm run build` を実行して確認
   - TypeScriptエラーを修正

3. **PM2エラー:**
   - VPSで `pm2 logs seo-dashboard` でログ確認
   - `pm2 restart seo-dashboard` で手動再起動

### 手動デプロイが必要な場合

```bash
# VPSサーバーにSSH接続
ssh seouser@your-server-ip

# デプロイスクリプト実行
cd /var/www/seo-dashboard
./deploy.sh
```

## 監視とメンテナンス

### ログ確認
```bash
# PM2ログ
pm2 logs seo-dashboard

# システムログ
sudo journalctl -u nginx
sudo journalctl -f
```

### パフォーマンス監視
```bash
# PM2監視
pm2 monit

# システムリソース
htop
df -h
```

### バックアップ確認
```bash
ls -la /home/seouser/backups/
```

これで、コードをプッシュするだけで自動的にサイトに反映されるようになります！