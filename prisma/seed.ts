import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Users
  const customerPassword = await bcrypt.hash("password", 10);
  const adminPassword = await bcrypt.hash("embodied123", 10);

  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test@example.com",
      password: customerPassword,
      role: "customer",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin-emboied@embodied.com" },
    update: {},
    create: {
      name: "Admin Embodied",
      email: "admin-emboied@embodied.com",
      password: adminPassword,
      role: "admin",
    },
  });

  // Categories
  const categories = [
    { name: "Women", slug: "women" },
    { name: "Men", slug: "men" },
    { name: "Accessories", slug: "accessories" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c });
  }
  const women = await prisma.category.findUniqueOrThrow({ where: { slug: "women" } });
  const men = await prisma.category.findUniqueOrThrow({ where: { slug: "men" } });

  // Sizes
  const sizeDefs = [
    { label: "XS", sortOrder: 1 },
    { label: "S", sortOrder: 2 },
    { label: "M", sortOrder: 3 },
    { label: "L", sortOrder: 4 },
    { label: "XL", sortOrder: 5 },
  ];
  for (const s of sizeDefs) {
    await prisma.size.upsert({ where: { label: s.label }, update: { sortOrder: s.sortOrder }, create: s });
  }
  const allSizes = await prisma.size.findMany();
  const sizeIdByLabel = (label: string) => allSizes.find((s) => s.label === label)!.id;

  // Products
  const products = [
    {
      categoryId: women.id,
      slug: "boxy-knit-cardigan",
      name: "Boxy Knit Cardigan",
      description:
        "A black knit cardigan with a V-neck button front, dropped shoulders and a boxy body that sits at the hip. Easy to layer over a tee, as shown here with charcoal wide-leg trousers.",
      price: 1249000,
      gradient: "from-neutral-300 to-neutral-400",
      isBestseller: true,
      isNew: false,
      stock: 8,
      sizes: ["S", "M", "L", "XL"],
    },
    {
      categoryId: men.id,
      slug: "oversized-utility-shirt",
      name: "Oversized Utility Shirt",
      description:
        "A short-sleeve overshirt in washed navy with twin chest pockets and a loose, boxy fit. Wear it open over a white tee or buttoned up on its own.",
      price: 349000,
      gradient: "from-sky-100 to-neutral-300",
      isBestseller: false,
      isNew: true,
      stock: 25,
      sizes: ["S", "M", "L", "XL"],
    },
    {
      categoryId: men.id,
      slug: "wide-leg-washed-jeans",
      name: "Wide-Leg Washed Jeans",
      description:
        "Light-wash denim with a wide, straight leg that falls loosely over the shoe and sits relaxed at the waist. Styled with a navy zip hoodie for an easy everyday look.",
      price: 449000,
      gradient: "from-stone-200 to-stone-400",
      isBestseller: false,
      isNew: false,
      stock: 18,
      sizes: ["S", "M", "L", "XL"],
    },
    {
      categoryId: women.id,
      slug: "striped-oversized-shirt",
      name: "Striped Oversized Shirt",
      description:
        "A pale blue pinstripe shirt with a point collar, chest pocket and a long, relaxed body. Pairs naturally with washed black wide-leg jeans, as shown.",
      price: 529000,
      gradient: "from-neutral-200 to-neutral-400",
      isBestseller: false,
      isNew: true,
      stock: 14,
      sizes: ["XS", "S", "M", "L"],
    },
    {
      categoryId: men.id,
      slug: "cosmic-check-shirt",
      name: "Cosmic Check Shirt",
      description:
        "A short-sleeve camp-collar shirt in a sage and navy check, scattered with hand-drawn stars and planet names. Boxy through the body, with a single chest pocket.",
      price: 229000,
      gradient: "from-neutral-300 to-neutral-500",
      isBestseller: false,
      isNew: false,
      stock: 40,
      sizes: ["S", "M", "L", "XL"],
    },
    {
      categoryId: women.id,
      slug: "half-zip-hooded-pullover",
      name: "Half-Zip Hooded Pullover",
      description:
        "An olive half-zip pullover with a hood, dropped shoulders and a roomy fit. Shown layered over a white tee with brown wide-leg trousers.",
      price: 389000,
      gradient: "from-emerald-900/30 to-neutral-400",
      isBestseller: false,
      isNew: true,
      stock: 20,
      sizes: ["S", "M", "L"],
    },
  ];

  for (const p of products) {
    const { sizes, ...data } = p;
    // Product photography shipped in public/images/products, named by slug.
    // Only fills an empty image so a photo uploaded from the admin panel is never overwritten.
    const placeholderImage = `/images/products/${p.slug}.jpg`;
    let product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { ...data, image: placeholderImage },
    });
    if (!product.image) {
      product = await prisma.product.update({ where: { id: product.id }, data: { image: placeholderImage } });
    }
    await prisma.productSize.deleteMany({ where: { productId: product.id } });
    await prisma.productSize.createMany({
      data: sizes.map((label) => ({ productId: product.id, sizeId: sizeIdByLabel(label) })),
    });
  }

  // Payment methods
  const paymentMethods = [
    {
      type: "bank" as const,
      name: "Bank Central Asia (BCA)",
      accountName: "PT Embodied Studio",
      accountNumber: "1234567890",
      isActive: true,
      sortOrder: 1,
    },
    {
      type: "qris" as const,
      name: "QRIS",
      isActive: true,
      sortOrder: 2,
    },
  ];
  for (const pm of paymentMethods) {
    const existing = await prisma.paymentMethod.findFirst({ where: { name: pm.name } });
    if (!existing) {
      await prisma.paymentMethod.create({ data: pm });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
