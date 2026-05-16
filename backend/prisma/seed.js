const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('Admin1234', 12);
  const memberPassword = await bcrypt.hash('Member1234', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@demo.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@demo.com',
      password: memberPassword,
      role: 'MEMBER'
    }
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@demo.com',
      password: memberPassword,
      role: 'MEMBER'
    }
  });

  console.log('✅ Users created');

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design patterns and improved UX.',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member1.id, role: 'MEMBER' },
          { userId: member2.id, role: 'MEMBER' }
        ]
      }
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App MVP',
      description: 'Build the minimum viable product for our cross-platform mobile application.',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member1.id, role: 'ADMIN' }
        ]
      }
    }
  });

  console.log('✅ Projects created');

  // Create tasks for Project 1
  const now = new Date();
  const pastDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const futureDate3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: 'Design new homepage mockup',
        description: 'Create high-fidelity mockups for the new homepage layout using Figma.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: pastDate,
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build a mobile-first responsive navigation bar with hamburger menu.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: futureDate1,
        projectId: project1.id,
        assignedToId: member2.id,
        createdById: admin.id
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: futureDate2,
        projectId: project1.id,
        assignedToId: admin.id,
        createdById: admin.id
      },
      {
        title: 'Write API documentation',
        description: 'Document all REST API endpoints using Swagger/OpenAPI specification.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: futureDate2,
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id
      },
      {
        title: 'Fix login page styling',
        description: 'The login button is misaligned on mobile devices. Needs CSS fix.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: pastDate,
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: member2.id
      },
      {
        title: 'Database optimization',
        description: 'Add indexes and optimize slow queries identified in performance audit.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: futureDate3,
        projectId: project1.id,
        assignedToId: null,
        createdById: admin.id
      }
    ]
  });

  // Create tasks for Project 2
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up React Native project',
        description: 'Initialize the React Native project with proper TypeScript configuration.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: pastDate,
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id
      },
      {
        title: 'Design authentication flow',
        description: 'Create login, signup, and password reset screens with proper validation.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: futureDate1,
        projectId: project2.id,
        assignedToId: admin.id,
        createdById: admin.id
      },
      {
        title: 'Implement push notifications',
        description: 'Set up Firebase Cloud Messaging for push notification support.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: futureDate2,
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id
      },
      {
        title: 'Create app store listing',
        description: 'Prepare screenshots, descriptions, and metadata for app store submission.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: pastDate,
        projectId: project2.id,
        assignedToId: null,
        createdById: admin.id
      }
    ]
  });

  console.log('✅ Tasks created');
  console.log('');
  console.log('📋 Seed Summary:');
  console.log('   Users: 3 (1 ADMIN, 2 MEMBER)');
  console.log('   Projects: 2');
  console.log('   Tasks: 10');
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('   Admin: admin@demo.com / Admin1234');
  console.log('   Alice: alice@demo.com / Member1234');
  console.log('   Bob:   bob@demo.com / Member1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
