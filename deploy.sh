#!/bin/bash

# UI Grace Dashboard 3 - Xserver VPS デプロイスクリプト
# 使用方法: ./deploy.sh

set -e  # エラー時に停止

echo "🚀 UI Grace Dashboard 3 デプロイ開始..."

# 色付きメッセージ関数
print_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

print_info() {
    echo -e "\033[34mℹ️  $1\033[0m"
}

print_warning() {
    echo -e "\033[33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

# デプロイディレクトリの設定
DEPLOY_DIR="/root/ui-grace-dashboard-3-cursorcli"
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# バックアップ作成
print_info "現在のデプロイメントをバックアップ中..."
mkdir -p $BACKUP_DIR
if [ -d "$DEPLOY_DIR" ]; then
    tar czf $BACKUP_DIR/ui-grace-dashboard-3-cursorcli_$DATE.tar.gz -C /root ui-grace-dashboard-3-cursorcli
    print_success "バックアップ作成完了: ui-grace-dashboard-3-cursorcli_$DATE.tar.gz"
fi

# GitHubから最新コードを取得
print_info "最新コードを取得中..."
cd $DEPLOY_DIR
git pull origin main
print_success "最新コード取得完了"

# 依存関係のインストール
print_info "依存関係をインストール中..."
npm install --production
print_success "依存関係インストール完了"

# TypeScript/ESLintチェック
print_info "コード品質をチェック中..."
npm run lint || {
    print_warning "Lintエラーがありますが、デプロイを続行します"
}

# ビルド実行
print_info "アプリケーションをビルド中..."
NODE_ENV=production npm run build
print_success "ビルド完了"

# distフォルダの確認
if [ ! -d "dist" ]; then
    print_error "ビルド失敗: distフォルダが見つかりません"
    exit 1
fi

# PM2でアプリケーション再起動
print_info "アプリケーションを再起動中..."
pm2 restart ui-grace-dashboard-3 || {
    print_warning "PM2再起動に失敗しました。初回起動を試みます..."
    pm2 start ecosystem.config.js
}
print_success "アプリケーション再起動完了"

# Nginxリロード
print_info "Nginxを再読込中..."
sudo nginx -t && sudo nginx -s reload
print_success "Nginx再読込完了"

# デプロイ後のヘルスチェック
print_info "ヘルスチェック実行中..."
sleep 5

# アプリケーションの起動確認
if curl -f http://127.0.0.1:3001/api/health > /dev/null 2>&1; then
    print_success "アプリケーション起動確認完了"
else
    print_error "アプリケーションの起動確認に失敗しました"
    print_info "PM2ログを確認してください: pm2 logs ui-grace-dashboard-3"
fi

# 古いバックアップの削除（30日以上前）
print_info "古いバックアップを削除中..."
find $BACKUP_DIR -name "ui-grace-dashboard-3-cursorcli_*.tar.gz" -mtime +30 -delete
print_success "古いバックアップ削除完了"

# デプロイ完了メッセージ
print_success "🎉 デプロイ完了！"
print_info "デプロイ日時: $(date)"
print_info "コミット情報: $(git log -1 --oneline)"
print_info "アプリケーションURL: https://your-domain.com"

# PM2ステータス表示
print_info "PM2ステータス:"
pm2 list