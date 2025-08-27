const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// JSONパーサー
app.use(express.json({ limit: '10mb' }));

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'dist')));

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    app: 'UI Grace Dashboard 3'
  });
});

// SPA用のフォールバック（すべてのルートをindex.htmlにリダイレクト）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`UI Grace Dashboard 3 running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});