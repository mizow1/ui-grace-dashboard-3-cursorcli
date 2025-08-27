# タスク完了時のワークフロー

## 必須ステップ（順序厳守）

### 1. コード品質チェック
```bash
npm run lint
```
- ESLintエラーがあれば修正が必要
- 警告は許容可能だが確認推奨

### 2. ビルド実行
```bash
npm run build
```
- ビルドエラーがあれば修正必須
- TypeScriptエラーも含む
- dist/フォルダに出力される

### 3. デプロイ準備
- Vercel設定は自動（vercel.json設定済み）
- Lovableプラットフォーム経由でも可能
- 手動デプロイの場合はVite previewでローカル確認推奨

## エラー対応
- リントエラー: 自動修正可能なものは `npm run lint -- --fix`
- ビルドエラー: TypeScript/React関連エラーを優先修正
- 依存関係エラー: `npm install` で解決確認

## 注意事項
- dist/フォルダは.gitignoreで除外済み
- ビルド成功後のみデプロイ実行
- 編集後は必ずこのワークフローを実行