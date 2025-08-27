# コードスタイル・規約

## TypeScript設定
- 厳密なTypeScript設定（tsconfig.json複数設定）
- React関数コンポーネント中心
- TypeScript ESLint使用

## ESLint設定
- `@eslint/js` + `typescript-eslint` 構成
- React Hooks + React Refresh プラグイン
- 未使用変数警告は無効化設定
- ファイル対象: `**/*.{ts,tsx}`

## UIコンポーネント
- shadcn-ui使用（`/components/ui/`フォルダ）
- Radix UIプリミティブベース
- Tailwind CSSでスタイリング
- class-variance-authority使用

## ファイル構造
- `src/components/` - Reactコンポーネント
- `src/components/ui/` - 再利用可能UIコンポーネント
- `src/pages/` - ページコンポーネント
- `src/contexts/` - Reactコンテキスト
- `src/hooks/` - カスタムフック
- `src/lib/` - ユーティリティ・設定

## 命名規約
- ファイル名: PascalCase（コンポーネント）
- 関数コンポーネント: PascalCase
- フック: `use-` プレフィックス + kebab-case
- CSS: Tailwind CSSクラス使用

## インポート規約
- 絶対パス使用推奨
- UI componentsは`@/components/ui`から
- ユーティリティは`@/lib`から