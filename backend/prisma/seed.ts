import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  // ユーザー作成
  const passwordHash = await bcrypt.hash('password123', 10)

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      passwordHash,
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob',
      passwordHash,
    },
  })

  // グループ作成
  const familyGroup = await prisma.group.upsert({
    where: { id: 'group-family' },
    update: {},
    create: {
      id: 'group-family',
      name: '家族',
      members: {
        create: [
          { userId: alice.id, role: 'owner' },
          { userId: bob.id, role: 'member' },
        ],
      },
    },
  })

  // グループのプレゼントリスト作成
  await prisma.giftList.upsert({
    where: { id: 'list-sweets' },
    update: {},
    create: {
      id: 'list-sweets',
      name: 'お菓子・スイーツ',
      groupId: familyGroup.id,
      items: {
        create: [
          {
            name: '東京ばな奈',
            price: 1080,
            memo: '定番。喜ばれる',
            url: 'https://www.tokyobanana.jp/',
          },
          {
            name: 'ロイズ 生チョコレート',
            price: 1296,
            memo: '冷蔵必須。北海道土産の定番',
          },
          {
            name: 'じゃがポックル',
            price: 648,
            memo: '軽くて配りやすい',
          },
        ],
      },
    },
  })

  await prisma.giftList.upsert({
    where: { id: 'list-drinks' },
    update: {},
    create: {
      id: 'list-drinks',
      name: 'お茶・ドリンク',
      groupId: familyGroup.id,
      items: {
        create: [
          {
            name: '宇治抹茶セット',
            price: 2000,
            memo: '京都土産として人気',
          },
          {
            name: '有機ほうじ茶',
            price: 1500,
            memo: '幅広い年代に喜ばれる',
          },
        ],
      },
    },
  })

  // 個人のプレゼントリスト作成
  await prisma.giftList.upsert({
    where: { id: 'list-alice-work' },
    update: {},
    create: {
      id: 'list-alice-work',
      name: '職場用',
      userId: alice.id,
      items: {
        create: [
          {
            name: '551蓬莱 豚まん',
            price: 1200,
            memo: '大阪土産の王道。要冷蔵',
          },
          {
            name: '萩の月',
            price: 1080,
            memo: '仙台土産。個包装で配りやすい',
          },
        ],
      },
    },
  })

  console.log('Seeding completed.')
  console.log(`  Users: alice@example.com, bob@example.com (password: password123)`)
  console.log(`  Groups: 家族`)
  console.log(`  GiftLists: お菓子・スイーツ, お茶・ドリンク, 職場用`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
