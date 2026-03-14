# omiyage-memo

グループ・ユーザ別にプレゼント（お土産）のリストを登録しておき、必要なときにそこから選べるWebアプリケーション。

## Tech Stack

### Frontend
- **React** (Vite)
- **TypeScript**
- **Tailwind CSS**
- **Vitest** + **React Testing Library**

### Backend
- **Express** + **TypeScript**
- **PostgreSQL**
- **Prisma** (ORM)
- **JWT** (認証)
- **Vitest** (テスト)

## Project Structure

```
omiyage-memo/
├── frontend/          # React アプリ (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/       # APIクライアント
│   │   └── types/
│   └── vite.config.ts
├── backend/           # Express API サーバ
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── types/
│   ├── prisma/
│   │   └── schema.prisma
│   └── tsconfig.json
└── CLAUDE.md
```

## Commands

### Frontend
```bash
cd frontend
npm run dev        # 開発サーバ起動
npm run build      # ビルド
npm run test       # テスト実行
npm run lint       # Lint
```

### Backend
```bash
cd backend
npm run dev        # 開発サーバ起動 (ts-node / tsx)
npm run build      # ビルド
npm run test       # テスト実行
npm run lint       # Lint

# Prisma
npx prisma migrate dev    # マイグレーション実行
npx prisma studio         # Prisma Studio 起動
npx prisma generate       # クライアント生成
```

## Architecture

### Authentication
- JWTをAuthorizationヘッダ（Bearer）で送受信
- アクセストークン + リフレッシュトークンの2トークン構成
- バックエンドのmiddlewareで認証検証

### API Design
- RESTful API (`/api/v1/...`)
- JSONレスポンス統一形式: `{ data, error, message }`

### Data Model (概要)
- `User` - ユーザ
- `Group` - グループ（複数ユーザが所属可能）
- `GiftItem` - プレゼントアイテム（名前・価格・メモ等）
- `GiftList` - グループまたはユーザに紐づくリスト

## Coding Conventions

### TypeScript
- `any`型は使用禁止。不明な場合は`unknown`を使う
- 型定義は`types/`ディレクトリに集約
- フロント・バック間で共有する型はbackend側で定義し、必要に応じてコピーまたはパッケージ化

### React
- コンポーネントは関数コンポーネントのみ
- カスタムhooksで副作用とロジックを分離
- ページコンポーネントは`pages/`、再利用コンポーネントは`components/`

### Testing
- テストは必ず実際の機能を検証すること
- `expect(true).toBe(true)`のような無意味なアサーションは禁止
- テストケース名は「何をテストしているか」を明確に記述
- 境界値・異常値・エラーケースも必ずテスト

### Security
- SQLインジェクション対策: Prismaのパラメータバインディングを使用
- XSS対策: Reactのデフォルトエスケープを信頼し、`dangerouslySetInnerHTML`は使用禁止
- 環境変数（`.env`）はリポジトリにコミットしない

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/omiyage_memo
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3000
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```
