import { prisma } from "./index";

async function main() {
  console.log("🌱 Seeding database...");

  // Example seed data
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("Created user:", user);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

