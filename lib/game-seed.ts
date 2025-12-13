import { prisma } from '@/lib/prisma';

async function main() {
    console.log('Start seeding...');

    const gameData = [
        {
            title: 'Tic-Tac-Toe',
            slug: 'tic-tac-toe',
            description: 'The classic 3x3 grid game. A perfect duel of wits for two!',
            maxPlayers: 2,
        },
        {
            title: 'Truth or Dare',
            slug: 'truth-or-dare',
            description: 'A game to test how well you know each other and push your boundaries.',
            maxPlayers: 2,
        },
    ];

    for (const game of gameData) {
        const upsertedGame = await prisma.game.upsert({
            where: { slug: game.slug },
            update: {
                title: game.title,
                description: game.description,
                maxPlayers: game.maxPlayers,
            },
            create: game,
        });
        console.log(`Upserted Game: ${upsertedGame.title} (ID: ${upsertedGame.id})`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });