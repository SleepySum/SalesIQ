require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const SalesReport = require('../models/SalesReport');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB for seeding...');
};

const generateReportsForYear = (userId, year) => {
  const reports = [];
  const monthsToFill = year === new Date().getFullYear()
    ? new Date().getMonth() + 1
    : 12;

  for (let month = 0; month < monthsToFill; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysToSeed = Math.min(daysInMonth, 20); // seed ~20 days per month

    for (let day = 1; day <= daysToSeed; day += Math.ceil(daysInMonth / daysToSeed)) {
      const revenue = Math.floor(Math.random() * 45000) + 5000;
      const expenses = Math.floor(Math.random() * revenue * 0.7);
      const date = new Date(Date.UTC(year, month, day));

      reports.push({
        date,
        totalSales: Math.floor(Math.random() * 150) + 10,
        revenue,
        expenses,
        netProfitLoss: revenue - expenses,
        profitMargin: parseFloat((((revenue - expenses) / revenue) * 100).toFixed(2)),
        employee: userId,
      });
    }
  }
  return reports;
};

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await SalesReport.deleteMany({});
    console.log('🗑️  Cleared existing data.');

    // Create demo user
    const user = await User.create({
      name: 'Alex Johnson',
      email: 'demo@salesapp.com',
      password: 'demo1234',
      role: 'manager',
    });
    console.log(`👤 Created demo user: ${user.email} / password: demo1234`);

    // Generate 2 years of data
    const currentYear = new Date().getFullYear();
    const reports = [
      ...generateReportsForYear(user._id, currentYear - 1),
      ...generateReportsForYear(user._id, currentYear),
    ];

    await SalesReport.insertMany(reports);
    console.log(`📊 Seeded ${reports.length} sales reports across ${currentYear - 1}–${currentYear}.`);

    console.log('\n✅ Seeding complete! You can now log in with:');
    console.log('   Email:    demo@salesapp.com');
    console.log('   Password: demo1234\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

seed();