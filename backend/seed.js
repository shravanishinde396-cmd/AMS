const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Class = require('./models/Class');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Check if seed data already exists
    const existingTeacher = await User.findOne({ email: 'teacher@demo.com' });
    if (existingTeacher) {
      console.log('⚠️  Seed data already exists. Skipping...');
      process.exit(0);
    }

    // Create teacher
    const teacher = await User.create({
      name: 'Dr. John Smith',
      email: 'teacher@demo.com',
      password: 'Teacher@123',
      role: 'teacher',
      department: 'Computer Science',
    });
    console.log('✅ Teacher created: teacher@demo.com / Teacher@123');

    // Create students
    const students = [];
    const studentData = [
      { name: 'Alice Johnson', email: 'student1@demo.com', rollNumber: 'CS2101' },
      { name: 'Bob Williams', email: 'student2@demo.com', rollNumber: 'CS2102' },
      { name: 'Charlie Brown', email: 'student3@demo.com', rollNumber: 'CS2103' },
    ];

    for (const data of studentData) {
      const student = await User.create({
        ...data,
        password: 'Student@123',
        role: 'student',
        department: 'Computer Science',
      });
      students.push(student);
      console.log(`✅ Student created: ${data.email} / Student@123 (${data.rollNumber})`);
    }

    // Create class and enroll students
    const classData = await Class.create({
      name: 'Computer Networks',
      code: 'CS401',
      department: 'Computer Science',
      teacher: teacher._id,
      students: students.map((s) => s._id),
    });
    console.log(`✅ Class created: ${classData.name} (${classData.code})`);
    console.log(`✅ Enrolled ${students.length} students in ${classData.name}`);

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n--- Demo Credentials ---');
    console.log('Teacher: teacher@demo.com / Teacher@123');
    console.log('Student 1: student1@demo.com / Student@123 (CS2101)');
    console.log('Student 2: student2@demo.com / Student@123 (CS2102)');
    console.log('Student 3: student3@demo.com / Student@123 (CS2103)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
