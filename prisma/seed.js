import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.faces.createMany({
        data: [
            {
                userId: "550e8400-e29b-41d4-a716-446655440000",
                file: { url: "https://example.com/image1.jpg", description: "User face image" },
            },
            {
                userId: "550e8400-e29b-41d4-a716-446655440001",
                file: { url: "https://example.com/image2.jpg", description: "Another user face image" },
            },
        ],
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
