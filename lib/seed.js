import { PrismaClient } from '@prisma/client';
import { brandingConfig } from './branding-config.js';
import { seedCopy } from './seed-copy.js';

const prisma = new PrismaClient();

async function seedRelationshipData() {
  try {
    // First, let's get the existing users
    const walter = await prisma.user.findUnique({
      where: { email: brandingConfig.people.walter.email }
    });

    const angela = await prisma.user.findUnique({
      where: { email: brandingConfig.people.angela.email }
    });

    if (!walter || !angela) {
      throw new Error('Both users must exist before seeding relationship data');
    }

    console.log('Found users:', { walter: walter.name, angela: angela.name });

    // 1. Create Love Pact
    const lovePact = await prisma.lovePact.create({
      data: {
        title: seedCopy.lovePact.title,
        content: seedCopy.lovePact.content,
        declaration: `I, ${brandingConfig.people.walter.name}, promise to be your devoted partner, to love you unconditionally, and to build a beautiful future together.`,
        partnerDeclaration: `I, ${brandingConfig.people.angela.name}, promise to be your devoted partner, to love you unconditionally, and to build a beautiful future together.`,
        signatures: {
          walter: {
            signature: brandingConfig.people.walter.signature,
            signedAt: "2024-01-15T10:30:00Z",
            ipAddress: "192.168.1.100"
          },
          angela: {
            signature: brandingConfig.people.angela.signature,
            signedAt: "2024-01-15T10:35:00Z",
            ipAddress: "192.168.1.101"
          }
        },
        isActive: true
      }
    });

    // 2. Update users with love pact
    await prisma.user.update({
      where: { id: walter.id },
      data: { lovePactId: lovePact.id }
    });

    await prisma.user.update({
      where: { id: angela.id },
      data: { lovePactId: lovePact.id }
    });

    // 3. Create User Settings
    await prisma.userSettings.create({
      data: {
        userId: walter.id,
        theme: "dark",
        language: "en",
        fontSize: 18,
        enableDarkMode: true,
        notificationSound: true,
        emailDigests: true
      }
    });

    await prisma.userSettings.create({
      data: {
        userId: angela.id,
        theme: "light",
        language: "en",
        fontSize: 16,
        enableDarkMode: false,
        notificationSound: true,
        emailDigests: true
      }
    });

    // 4. Create Relationship
    const relationship = await prisma.relationship.create({
      data: {
        status: "ACTIVE",
        anniversaryDate: new Date("2023-06-14"),
        userId: walter.id,
        partnerId: angela.id
      }
    });

    // 5. Create Events
    const events = await prisma.event.createMany({
      data: [
        {
          title: seedCopy.events[0].title,
          description: seedCopy.events[0].description,
          location: "Le Bernardin, New York",
          startDate: new Date("2025-06-14T19:00:00Z"),
          endDate: new Date("2025-06-14T22:00:00Z"),
          isAllDay: false,
          reminderTime: new Date("2025-06-14T12:00:00Z"),
          creatorId: walter.id,
          relationshipId: relationship.id
        },
        {
          title: seedCopy.events[1].title,
          description: seedCopy.events[1].description,
          location: "Aspen, Colorado",
          startDate: new Date("2025-08-15T00:00:00Z"),
          endDate: new Date("2025-08-17T23:59:59Z"),
          isAllDay: true,
          reminderTime: new Date("2025-08-10T09:00:00Z"),
          creatorId: angela.id,
          relationshipId: relationship.id
        },
        {
          title: seedCopy.events[2].title,
          description: seedCopy.events[2].description,
          location: "Home",
          startDate: new Date("2025-07-11T20:00:00Z"),
          endDate: new Date("2025-07-11T23:00:00Z"),
          isAllDay: false,
          creatorId: walter.id,
          relationshipId: relationship.id
        }
      ]
    });

    // 6. Create Journal Entries
    const journals = await prisma.journal.createMany({
      data: [
        {
          title: seedCopy.journals[0].title,
          content: seedCopy.journals[0].content,
          mood: "HAPPY",
          isPrivate: false,
          userId: walter.id,
          relationshipId: relationship.id
        },
        {
          title: seedCopy.journals[1].title,
          content: seedCopy.journals[1].content,
          mood: "GRATEFUL",
          isPrivate: false,
          userId: angela.id,
          relationshipId: relationship.id
        },
        {
          title: seedCopy.journals[2].title,
          content: seedCopy.journals[2].content,
          mood: "THOUGHTFUL",
          isPrivate: true,
          userId: walter.id,
          relationshipId: relationship.id
        }
      ]
    });

    // 7. Create Messages
    const messages = await prisma.message.createMany({
      data: [
        {
          content: seedCopy.messages[0],
          senderId: walter.id,
          receiverId: angela.id,
          isRead: true
        },
        {
          content: seedCopy.messages[1],
          senderId: angela.id,
          receiverId: walter.id,
          isRead: true
        },
        {
          content: seedCopy.messages[2],
          senderId: walter.id,
          receiverId: angela.id,
          isRead: false
        },
        {
          content: seedCopy.messages[3],
          senderId: angela.id,
          receiverId: walter.id,
          isRead: false
        }
      ]
    });

    // 8. Create Memories
    const memories = await prisma.memory.createMany({
      data: [
        {
          title: seedCopy.memories[0].title,
          description: seedCopy.memories[0].description,
          date: new Date("2023-03-15T14:30:00Z"),
          location: "Blue Bottle Coffee, Manhattan",
          mediaUrls: [
            "https://example.com/photos/first-date-1.jpg",
            "https://example.com/photos/first-date-2.jpg"
          ],
          creatorId: walter.id,
          relationshipId: relationship.id
        },
        {
          title: seedCopy.memories[1].title,
          description: seedCopy.memories[1].description,
          date: new Date("2024-02-20T00:00:00Z"),
          location: "Maui, Hawaii",
          mediaUrls: [
            "https://example.com/photos/hawaii-1.jpg",
            "https://example.com/photos/hawaii-2.jpg",
            "https://example.com/photos/hawaii-3.jpg",
            "https://example.com/videos/hawaii-sunset.mp4"
          ],
          creatorId: angela.id,
          relationshipId: relationship.id
        },
        {
          title: seedCopy.memories[2].title,
          description: seedCopy.memories[2].description,
          date: new Date("2024-05-10T00:00:00Z"),
          location: "Our First Apartment, Brooklyn",
          mediaUrls: [
            "https://example.com/photos/moving-1.jpg",
            "https://example.com/photos/moving-2.jpg"
          ],
          creatorId: walter.id,
          relationshipId: relationship.id
        }
      ]
    });

    // 9. Create Quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: seedCopy.quiz.title,
        description: seedCopy.quiz.description,
        creatorId: walter.id,
        relationshipId: relationship.id
      }
    });

    // 10. Create Questions
    const questions = await prisma.question.createMany({
      data: [
        {
          content: seedCopy.quiz.questions[0],
          questionType: "MULTIPLE_CHOICE",
          options: ["Italian", "Thai", "Mexican", "Indian"],
          correctAnswer: "Italian",
          quizId: quiz.id
        },
        {
          content: seedCopy.quiz.questions[1],
          questionType: "OPEN_ENDED",
          quizId: quiz.id
        },
        {
          content: seedCopy.quiz.questions[2],
          questionType: "MULTIPLE_CHOICE",
          options: ["Mountains", "Beaches"],
          correctAnswer: "Mountains",
          quizId: quiz.id
        },
        {
          content: seedCopy.quiz.questions[3],
          questionType: "TRUE_FALSE",
          options: ["True", "False"],
          correctAnswer: "False",
          quizId: quiz.id
        },
        {
          content: seedCopy.quiz.questions[4],
          questionType: "OPEN_ENDED",
          quizId: quiz.id
        }
      ]
    });

    // 11. Get questions for creating responses
    const createdQuestions = await prisma.question.findMany({
      where: { quizId: quiz.id },
      orderBy: { createdAt: 'asc' }
    });

    // 12. Create Quiz Response from Angela
    const quizResponse = await prisma.quizResponse.create({
      data: {
        score: 4,
        userId: angela.id,
        quizId: quiz.id
      }
    });

    // 13. Create Question Responses
    await prisma.questionResponse.createMany({
      data: [
        {
          answer: "Italian",
          questionId: createdQuestions[0].id,
          quizResponseId: quizResponse.id
        },
        {
          answer: "Spiders and heights",
          questionId: createdQuestions[1].id,
          quizResponseId: quizResponse.id
        },
        {
          answer: "Mountains",
          questionId: createdQuestions[2].id,
          quizResponseId: quizResponse.id
        },
        {
          answer: "False",
          questionId: createdQuestions[3].id,
          quizResponseId: quizResponse.id
        },
        {
          answer: "Japan - especially Tokyo and Kyoto",
          questionId: createdQuestions[4].id,
          quizResponseId: quizResponse.id
        }
      ]
    });

    // 14. Create Settings
    await prisma.settings.create({
      data: {
        theme: "dark",
        notifications: true,
        relationshipId: relationship.id
      }
    });

    console.log('✅ Seeding completed successfully!');
    console.log('Created:');
    console.log('- 1 Love Pact');
    console.log('- 2 User Settings');
    console.log('- 1 Relationship');
    console.log('- 3 Events');
    console.log('- 3 Journal Entries');
    console.log('- 4 Messages');
    console.log('- 3 Memories');
    console.log('- 1 Quiz with 5 Questions');
    console.log('- 1 Quiz Response with 5 Question Responses');
    console.log('- 1 Settings record');

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedRelationshipData()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });