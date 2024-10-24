# Photo Sender Web

Web カメラからリアルタイムで画像を取得し、背景除去サービスに送信する Preact アプリケーション。

## 機能

-   Web カメラからのリアルタイムビデオキャプチャ
-   画像の自動キャプチャと送信
-   WebSocket によるリアルタイム通信
-   アップロードの進捗表示
-   レスポンシブデザイン
-   エラーハンドリングとユーザーフィードバック

## プロジェクト構成

```
photo-sender-web/
├── .vscode/                # VSCode設定
│   ├── settings.json      # エディタ設定
│   ├── extensions.json    # 推奨拡張機能
│   ├── launch.json        # デバッグ設定
│   └── tasks.json         # タスク設定
├── src/
│   ├── assets/           # 静的アセット
│   ├── components/       # UIコンポーネント
│   ├── hooks/           # カスタムフック
│   ├── types/           # 型定義
│   ├── utils/           # ユーティリティ関数
│   ├── app.tsx          # メインアプリケーション
│   ├── index.css        # グローバルスタイル
│   └── main.tsx         # エントリーポイント
├── tests/               # テストファイル
├── public/             # 静的ファイル
├── index.html          # HTMLテンプレート
├── package.json        # 依存関係と設定
├── tsconfig.json       # TypeScript設定
├── vite.config.ts      # Vite設定
└── tailwind.config.js  # Tailwind CSS設定
```

## 技術スタック

-   Preact：軽量な React の代替
-   TypeScript：型安全な JavaScript
-   Vite：高速なビルドツール
-   Tailwind CSS：ユーティリティファースト CSS フレームワーク
-   Ky：HTTP クライアント
-   WebSocket：リアルタイム通信
-   Signals：状態管理

## 開発環境のセットアップ

### 必要要件

-   Node.js 18.0.0 以上
-   npm 9.0.0 以上
-   Web カメラへのアクセス権限
-   VSCode（推奨エディタ）

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/your-organization/photo-sender-web.git
cd photo-sender-web

# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

### VSCode 拡張機能のセットアップ

1. VSCode を開く
2. 推奨拡張機能タブを開く（Ctrl+Shift+X）
3. 表示される推奨拡張機能をインストール

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセス

### 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview

# 型チェック
npm run typecheck

# リンター実行
npm run lint

# テスト実行
npm run test

# テストの監視モード
npm run test:watch

# コードフォーマット
npm run format
```

### VSCode タスク

`Cmd/Ctrl + Shift + P`を押して"Tasks: Run Task"を選択し、以下のタスクを実行できます：

-   `Start Development Server`: 開発サーバーを起動
-   `Build Production`: プロダクションビルドを実行
-   `Run Tests`: テストを実行
-   `Lint`: コードの品質チェック
-   `Type Check`: 型チェック
-   `Format Code`: コードフォーマット

### デバッグ

`F5`キーで以下のデバッグ設定を選択できます：

-   `Launch Chrome against localhost`: Chrome でのデバッグ
-   `Debug Vite Config`: Vite 設定のデバッグ
-   `Debug Current Test File`: 現在のテストファイルのデバッグ

## 環境設定

`.env`ファイルで以下の環境変数を設定できます：

```bash
# 必須の環境変数
VITE_API_URL=http://localhost:8000  # バックエンドAPIのURL
VITE_WS_URL=ws://localhost:8000/ws  # WebSocketのURL

# オプションの環境変数
VITE_MAX_UPLOAD_SIZE=10             # 最大アップロードサイズ（MB）
VITE_CAMERA_QUALITY=0.9             # カメラ画質（0-1）
```

## コードスタイル

-   [Prettier](https://prettier.io/)の設定に従う
-   タブサイズ: 2 スペース
-   最大行長: 100 文字
-   セミコロン必須
-   シングルクォート
-   末尾カンマ使用

## ブラウザサポート

-   Chrome: 最新 2 バージョン
-   Firefox: 最新 2 バージョン
-   Safari: 最新 2 バージョン
-   Edge: 最新 2 バージョン

## トラブルシューティング

### よくある問題

1. カメラアクセス関連:

    - ブラウザの権限設定を確認
    - HTTPS または localhost で実行されているか確認
    - デバイスのプライバシー設定を確認

2. WebSocket 接続エラー:

    - バックエンドサーバーが起動しているか確認
    - WebSocket URL が正しいか確認
    - ネットワーク接続を確認

3. ビルドエラー:
    - `node_modules`を削除して再インストール
    - キャッシュをクリア（`npm clean cache --force`）
    - TypeScript バージョンの互換性を確認

### 開発中の注意点

-   カメラアクセスは HTTPS または localhost でのみ動作
-   大きな画像ファイルはメモリ使用量に注意
-   WebSocket 接続は自動再接続を実装

## パフォーマンス最適化

-   画像の圧縮率を調整（`VITE_CAMERA_QUALITY`）
-   適切なキャンバスサイズの使用
-   コンポーネントの適切な分割
-   メモ化による再描画の最適化

## 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### プルリクエストの要件

-   テストが全て通過すること
-   TypeScript の型チェックが通ること
-   ESLint エラーがないこと
-   Prettier でフォーマットされていること
-   新機能のドキュメントが追加されていること

## セキュリティ

-   カメラアクセスは必要な時のみ要求
-   画像データは安全な接続で送信
-   センシティブな情報は環境変数で管理
-   アップロードサイズの制限を実装

## ライセンス

[MIT ライセンス](LICENSE)

## サポート

-   GitHub の Issue で問題を報告
-   プルリクエストで改善を提案
-   セキュリティ脆弱性の報告は security@example.com へ
