# 推奨コマンド一覧

## 開発コマンド
- `npm run dev` - 開発サーバー起動（自動リロード付き）
- `npm run build` - 本番用ビルド
- `npm run build:dev` - 開発モード用ビルド
- `npm run preview` - ビルド済みアプリのプレビュー

## 品質管理コマンド
- `npm run lint` - ESLintによるコード品質チェック

## Windowsシステムコマンド
- `dir` - ディレクトリ内容の表示（Linuxのls相当）
- `cd` - ディレクトリ移動
- `findstr` - テキスト検索（Linuxのgrep相当）
- `type` - ファイル内容表示（Linuxのcat相当）
- `git` - Git操作

## パッケージ管理
- `npm install` - 依存関係インストール
- `npm i <package>` - パッケージ追加

## Vercelデプロイ
- Vercel設定: `vercel.json`でビルドコマンド `npm run build` 指定済み
- 出力ディレクトリ: `dist`