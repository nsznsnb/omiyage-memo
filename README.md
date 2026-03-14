# おみやげメモ

プレゼント・おみやげのリストを管理するWebアプリケーションです。グループ（家族・職場など）やユーザー単位でリストを作成・共有できます。

## 機能

- ユーザー登録・ログイン（JWT認証）
- グループ管理（作成・メンバー招待）
- プレゼントリスト管理（個人 / グループ共有）
- アイテム管理（名前・価格・メモ・URL）

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| バックエンド | Node.js, Express 4, TypeScript |
| データベース | PostgreSQL, Prisma ORM |
| 認証 | JWT（アクセストークン15分 + リフレッシュトークン7日） |
| テスト | Vitest, React Testing Library |

## 必要な環境

- Node.js 18以上
- PostgreSQL 14以上

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/nsznsnb/omiyage-memo.git
cd omiyage-memo
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
cp backend/.env.example backend/.env
```

`backend/.env` を編集してデータベース接続情報を設定します：

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/omiyage_memo"
JWT_SECRET="your_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret_key"
PORT=3000
```

### 4. データベースのセットアップ

```bash
# マイグレーション実行
cd backend
npx prisma migrate dev

# シードデータの投入（任意）
npx prisma db seed
```

シードデータには以下のテストユーザーが含まれます：
- alice@example.com / password123
- bob@example.com / password123

## 開発サーバーの起動

ルートディレクトリで両方を同時起動：

```bash
# フロントエンド（http://localhost:5173）
npm run dev --workspace=frontend

# バックエンド（http://localhost:3000）
npm run dev --workspace=backend
```

## テストの実行

```bash
# フロントエンドテスト（33件）
npm test --workspace=frontend

# バックエンドテスト（49件）
npm test --workspace=backend
```

## APIエンドポイント

### 認証

| メソッド | パス | 説明 |
|----------|------|------|
| POST | /api/v1/auth/register | ユーザー登録 |
| POST | /api/v1/auth/login | ログイン |
| POST | /api/v1/auth/refresh | トークンリフレッシュ |
| POST | /api/v1/auth/logout | ログアウト |

### グループ

| メソッド | パス | 説明 |
|----------|------|------|
| GET | /api/v1/groups | グループ一覧 |
| POST | /api/v1/groups | グループ作成 |
| GET | /api/v1/groups/:id | グループ詳細 |
| PUT | /api/v1/groups/:id | グループ名更新 |
| DELETE | /api/v1/groups/:id | グループ削除 |
| POST | /api/v1/groups/:id/members | メンバー追加 |
| DELETE | /api/v1/groups/:id/members/:memberId | メンバー削除 |

### プレゼントリスト

| メソッド | パス | 説明 |
|----------|------|------|
| GET | /api/v1/gift-lists | リスト一覧 |
| POST | /api/v1/gift-lists | リスト作成 |
| GET | /api/v1/gift-lists/:id | リスト詳細（アイテム含む） |
| PUT | /api/v1/gift-lists/:id | リスト名更新 |
| DELETE | /api/v1/gift-lists/:id | リスト削除 |
| POST | /api/v1/gift-lists/:listId/items | アイテム追加 |
| PUT | /api/v1/gift-lists/:listId/items/:itemId | アイテム更新 |
| DELETE | /api/v1/gift-lists/:listId/items/:itemId | アイテム削除 |

## プロジェクト構成

```
omiyage-memo/
├── frontend/
│   ├── src/
│   │   ├── api/          # APIクライアント
│   │   ├── components/   # 共通コンポーネント
│   │   ├── contexts/     # React Context（認証状態）
│   │   ├── pages/        # 画面コンポーネント
│   │   ├── test/         # テストファイル
│   │   └── types/        # 型定義
│   └── vite.config.ts
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma # DBスキーマ
│   │   └── seed.ts       # シードデータ
│   └── src/
│       ├── controllers/  # ビジネスロジック
│       ├── middleware/   # 認証ミドルウェア
│       ├── routes/       # ルーティング
│       └── lib/          # ユーティリティ
└── package.json          # ワークスペース設定
```
