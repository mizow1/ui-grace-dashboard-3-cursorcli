# コードベース構造

## ルートレベル
- `index.html` - エントリーポイント
- `package.json` - 依存関係・スクリプト定義
- `vite.config.ts` - Viteビルド設定
- `tailwind.config.ts` - Tailwind CSS設定
- `vercel.json` - Vercelデプロイ設定

## 設定ファイル
- `eslint.config.js` - ESLint設定
- `tsconfig.*.json` - TypeScript設定（複数）
- `postcss.config.js` - PostCSS設定
- `components.json` - shadcn-ui設定

## ソースコード (`src/`)

### コンポーネント階層
- **`src/components/`** - メインコンポーネント
  - `AdminHeader.tsx` - 管理者ヘッダー
  - `AdminLayout.tsx` - 管理者レイアウト
  - `AdminSidebar.tsx` - 管理者サイドバー
  - `ApiKeyManager.tsx` - APIキー管理
  - `StatsCard.tsx` - 統計カード
  - `UserTable.tsx` - ユーザーテーブル

- **`src/components/ui/`** - 再利用可能UIコンポーネント（shadcn-ui）
  - 50+ UIコンポーネント（button, card, dialog等）

### ページ
- **`src/pages/`** - ルーティング対象ページ
  - `Index.tsx` - トップページ
  - `Dashboard.tsx` - ダッシュボード
  - `Users.tsx` - ユーザー管理
  - `Domains.tsx` - ドメイン管理
  - `Settings.tsx` - 設定
  - `SiteAnalytics.tsx` - サイト分析
  - `ArticleCreation.tsx` - 記事作成
  - `ContentSuggestions.tsx` - コンテンツ提案
  - `CompetitorAnalysis.tsx` - 競合分析

### ユーティリティ・設定
- `src/contexts/` - Reactコンテキスト
- `src/hooks/` - カスタムフック
- `src/lib/` - ユーティリティ関数
- `src/main.tsx` - Reactアプリエントリー