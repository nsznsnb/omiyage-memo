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

## Phase 5: バックエンド - プレゼントリストAPI
- [ ] `GET    /api/v1/gifts` - アイテム一覧取得（グループ・ユーザフィルタ対応）
- [ ] `POST   /api/v1/gifts` - アイテム登録
- [ ] `GET    /api/v1/gifts/:id` - アイテム詳細取得
- [ ] `PUT    /api/v1/gifts/:id` - アイテム更新
- [ ] `DELETE /api/v1/gifts/:id` - アイテム削除
- [ ] プレゼントリストAPIのテスト作成

---

## Phase 6: フロントエンド - 認証画面
- [ ] APIクライアント基盤実装（fetch wrapper + JWTヘッダ付与）
- [ ] ログイン画面
- [ ] ユーザ登録画面
- [ ] 認証状態管理（Context or Zustand）
- [ ] ログイン・登録のテスト作成

---

## Phase 7: フロントエンド - グループ管理画面
- [ ] グループ一覧画面
- [ ] グループ作成・編集画面
- [ ] グループメンバー管理UI
- [ ] グループ画面のテスト作成

---

## Phase 8: フロントエンド - プレゼントリスト画面
- [ ] プレゼントリスト一覧画面（グループ・ユーザ別）
- [ ] アイテム登録・編集フォーム
- [ ] アイテム詳細表示
- [ ] アイテム削除確認ダイアログ
- [ ] プレゼントリスト画面のテスト作成

---

## Phase 9: 仕上げ・品質改善
- [ ] エラーハンドリングの統一（フロント・バック）
- [ ] ローディング状態のUI対応
- [ ] レスポンシブデザイン確認
- [ ] E2Eテスト（任意）
- [ ] README作成
