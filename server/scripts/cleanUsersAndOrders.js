/**
 * One-time script: Remove all customer users, orders, and addresses from MongoDB.
 * Keeps: Admin user(s), products, categories.
 * Run from server folder: node scripts/cleanUsersAndOrders.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI missing in server/.env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const usersColl = db.collection('users');
  const ordersColl = db.collection('orders');
  const addressesColl = db.collection('addresses');

  const deletedCustomers = await usersColl.deleteMany({ role: 'Customer' });
  const deletedOrders = await ordersColl.deleteMany({});
  const deletedAddresses = await addressesColl.deleteMany({});

  console.log('Done.');
  console.log('Deleted customer users:', deletedCustomers.deletedCount);
  console.log('Deleted orders:', deletedOrders.deletedCount);
  console.log('Deleted addresses:', deletedAddresses.deletedCount);
  const adminCount = await usersColl.countDocuments({ role: 'Admin' });
  console.log('Remaining Admin users:', adminCount);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
