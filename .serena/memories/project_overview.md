# UI Grace Dashboard 3 - プロジェクト概要

## プロジェクト目的
- Reactベースのダッシュボードアプリケーション
- Lovableプラットフォームで開発・デプロイ管理
- 管理者用のWebインターフェース（ユーザー管理、サイト分析、コンテンツ作成機能を含む）

## 技術スタック
- **フロントエンド**: React 18.3.1 + TypeScript
- **ビルドツール**: Vite 5.4.19
- **UIライブラリ**: shadcn-ui（Radix UIコンポーネント）
- **スタイリング**: Tailwind CSS
- **状態管理**: React Query (@tanstack/react-query)
- **ルーティング**: React Router DOM
- **AI統合**: Google Generative AI
- **パッケージマネージャー**: npm + Bun (bun.lockbファイル存在)

## デプロイメント
- **プラットフォーム**: Vercel（vercel.json設定済み）
- **Lovable統合**: 自動コミット・デプロイ機能
- **カスタムドメイン**: 接続可能