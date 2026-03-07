/**
 * Remove a user by email. Run: node scripts/removeUserByEmail.js <email>
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const email = process.argv[2] || 'mockeefy@gmail.com';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const result = await db.collection('users').deleteOne({ email: email.trim().toLowerCase() });
  console.log(result.deletedCount ? `Removed user: ${email}` : `No user found with email: ${email}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
