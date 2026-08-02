import dotenv from "dotenv";
dotenv.config();
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Initialize admin account
 * Run this script once to set up the admin user
 * Usage: npx tsx scripts/init-admin.ts
 */
async function initializeAdmin() {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Quan@65536";

  try {
    console.log("🔧 Initializing admin account...");

    // Check if admin already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, ADMIN_USERNAME));

    if (existingAdmin) {
      console.log(" Admin account already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin user
    const [newAdmin] = await db
      .insert(users)
      .values({
        username: ADMIN_USERNAME,
        password: hashedPassword,
      })
      .returning();

    console.log("Admin account created successfully!");
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("\nIMPORTANT: Change the password immediately after first login!");
  } catch (error) {
    console.error("Error initializing admin:", error);
    process.exit(1);
  }
}

initializeAdmin().then(() => {
  console.log("✨ Setup complete!");
  process.exit(0);
});