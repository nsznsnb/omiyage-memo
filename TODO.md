# omiyage-memo 実装TODO

## Phase 1: プロジェクト初期セットアップ ✅
- [x] モノレポ構成の作成（ルートの `package.json`）
- [x] **Frontend**: Vite + React + TypeScript 初期化
- [x] **Frontend**: Tailwind CSS 設定（PostCSS経由）
- [x] **Frontend**: Vitest + React Testing Library 設定
- [x] **Backend**: Express + TypeScript 初期化
- [x] **Backend**: Prisma 初期化 + PostgreSQL 接続設定
- [x] **Backend**: Vitest 設定
- [x] `.env` ファイルのテンプレート作成（`.env.example`）
- [x] `.gitignore` 設定

---

## Phase 2: データベース設計・マイグレーション ✅
- [x] Prismaスキーマ設計
  - [x] `User` モデル
  - [x] `Group` モデル
  - [x] `GroupMember` モデル（UserとGroupの中間テーブル）
  - [x] `GiftList` モデル（グループまたはユーザに紐づく）
  - [x] `GiftItem` モデル（名前・価格・メモ・URL等、GiftListに紐づく）
- [x] 初回マイグレーション実行
- [x] シードデータ作成（開発用ダミーデータ）

---

## Phase 3: バックエンド - 認証API ✅
- [x] JWT ユーティリティ実装（生成・検証）
- [x] 認証ミドルウェア実装
- [x] `POST /api/v1/auth/register` - ユーザ登録
- [x] `POST /api/v1/auth/login` - ログイン（JWT発行）
- [x] `POST /api/v1/auth/refresh` - トークンリフレッシュ
- [x] `POST /api/v1/auth/logout` - ログアウト
- [x] 認証APIのテスト作成（11件 全通過）

---

## Phase 4: バックエンド - グループAPI ✅
- [x] `GET    /api/v1/groups` - グループ一覧取得
- [x] `POST   /api/v1/groups` - グループ作成
- [x] `GET    /api/v1/groups/:id` - グループ詳細取得
- [x] `PUT    /api/v1/groups/:id` - グループ更新
- [x] `DELETE /api/v1/groups/:id` - グループ削除
- [x] `POST   /api/v1/groups/:id/members` - メンバー追加
- [x] `DELETE /api/v1/groups/:id/members/:memberId` - メンバー削除
- [x] グループAPIのテスト作成（19件 全通過）

---

## Phase 5: バックエンド - プレゼントリストAPI ✅
- [x] `GET    /api/v1/gift-lists` - リスト一覧（groupId or 個人+所属グループ）
- [x] `POST   /api/v1/gift-lists` - リスト作成（個人 or グループ）
- [x] `GET    /api/v1/gift-lists/:id` - リスト詳細（アイテム含む）
- [x] `PUT    /api/v1/gift-lists/:id` - リスト名更新
- [x] `DELETE /api/v1/gift-lists/:id` - リスト削除
- [x] `POST   /api/v1/gift-lists/:listId/items` - アイテム追加
- [x] `PUT    /api/v1/gift-lists/:listId/items/:itemId` - アイテム更新
- [x] `DELETE /api/v1/gift-lists/:listId/items/:itemId` - アイテム削除
- [x] プレゼントリストAPIのテスト作成（19件 全通過、累計49件）

---

## Phase 6: フロントエンド - 認証画面 ✅
- [x] APIクライアント基盤実装（fetch wrapper + JWTヘッダ付与）
- [x] ログイン画面
- [x] ユーザ登録画面
- [x] 認証状態管理（AuthContext + useReducer）
- [x] PrivateRoute（未認証ユーザーをリダイレクト）
- [x] ログイン・登録のテスト作成（10件 全通過）

---

## Phase 7: フロントエンド - グループ管理画面 ✅
- [x] グループ一覧画面（GroupListPage）
- [x] グループ作成・編集モーダル（GroupFormModal）
- [x] グループ詳細・メンバー管理画面（GroupDetailPage）
- [x] 共通レイアウト（Layout）
- [x] グループ画面のテスト作成（9件 全通過、フロント累計19件）

---

## Phase 8: フロントエンド - プレゼントリスト画面 ✅
- [x] プレゼントリスト一覧画面（グループ・ユーザ別）
- [x] アイテム登録・編集フォーム
- [x] アイテム詳細表示
- [x] アイテム削除確認ダイアログ
- [x] プレゼントリスト画面のテスト作成（14件 全通過、フロント累計33件）

---

## Phase 9: 仕上げ・品質改善 ✅
- [x] エラーハンドリングの統一（バック: グローバルエラーハンドラー、フロント: 401自動ログアウト）
- [x] ローディング状態のUI対応（各ページ・PrivateRoute対応済み）
- [x] レスポンシブデザイン確認（Layoutヘッダーモバイル対応）
- [ ] E2Eテスト（スコープ外）
- [x] README作成
