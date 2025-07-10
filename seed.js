import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRelationshipData() {
  try {
    // First, let's get the existing users
    const walter = await prisma.user.findUnique({
      where: { email: 'walter@gmail.com' }
    });

    const risper = await prisma.user.findUnique({
      where: { email: 'risper@gmail.com' }
    });

    if (!walter || !risper) {
      throw new Error('Both users must exist before seeding relationship data');
    }

    console.log('Found users:', { walter: walter.name, risper: risper.name });

    // 1. Create Love Pact
    const lovePact = await prisma.lovePact.create({
      data: {
        title: "Our Forever Promise",
        content: "We promise to love, cherish, and support each other through all of life's adventures. To communicate openly, laugh together, and grow as individuals while building our life together.",
        declaration: "I, Walter, promise to be your devoted partner, to love you unconditionally, and to build a beautiful future together.",
        partnerDeclaration: "I, Risper, promise to be your devoted partner, to love you unconditionally, and to build a beautiful future together.",
        signatures: {
          walter: {
            signature: "Walter M.",
            signedAt: "2024-01-15T10:30:00Z",
            ipAddress: "192.168.1.100"
          },
          risper: {
            signature: "Risper K.",
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
      where: { id: risper.id },
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
        userId: risper.id,
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
        partnerId: risper.id
      }
    });

    // 5. Create Events
    const events = await prisma.event.createMany({
      data: [
        {
          title: "Anniversary Dinner",
          description: "Celebrating our 2nd anniversary at our favorite restaurant",
          location: "Le Bernardin, New York",
          startDate: new Date("2025-06-14T19:00:00Z"),
          endDate: new Date("2025-06-14T22:00:00Z"),
          isAllDay: false,
          reminderTime: new Date("2025-06-14T12:00:00Z"),
          creatorId: walter.id,
          relationshipId: relationship.id
        },
        {
          title: "Weekend Getaway",
          description: "Romantic weekend in the mountains",
          location: "Aspen, Colorado",
          startDate: new Date("2025-08-15T00:00:00Z"),
          endDate: new Date("2025-08-17T23:59:59Z"),
          isAllDay: true,
          reminderTime: new Date("2025-08-10T09:00:00Z"),
          creatorId: risper.id,
          relationshipId: relationship.id
        },
        {
          title: "Movie Night",
          description: "Weekly movie night at home",
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
          title: "Amazing Day Together",
          content: "Today was incredible! We went hiking in the morning and had a picnic by the lake. Risper looked so beautiful in the sunlight, and we talked for hours about our dreams and future plans. I feel so grateful to have her in my life.",
          mood: "HAPPY",
          isPrivate: false,
          userId: walter.id,
          relationshipId: relationship.id
        },
        {
          title: "Feeling Grateful",
          content: "I've been reflecting on how much Walter means to me. His support during my stressful work week has been amazing. He made me dinner every night and listened to me vent without judgment. I'm so lucky to have such a caring partner.",
          mood: "GRATEFUL",
          isPrivate: false,
          userId: risper.id,
          relationshipId: relationship.id
        },
        {
          title: "Personal Thoughts",
          content: "Sometimes I worry about whether I'm being a good enough partner. I want to make sure I'm always showing Walter how much I appreciate him. Maybe I should plan a surprise date night this weekend.",
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
          content: "Good morning beautiful! Hope you have an amazing day at work. Can't wait to see you tonight ❤️",
          senderId: walter.id,
          receiverId: risper.id,
          isRead: true
        },
        {
          content: "Thank you for the sweet message! You made my morning so much better. Love you too! 💕",
          senderId: risper.id,
          receiverId: walter.id,
          isRead: true
        },
        {
          content: "Don't forget we have dinner with your parents tomorrow at 7 PM. Should I bring flowers for your mom?",
          senderId: walter.id,
          receiverId: risper.id,
          isRead: false
        },
        {
          content: "Yes, she'd love that! Maybe some white roses? You're so thoughtful 🌹",
          senderId: risper.id,
          receiverId: walter.id,
          isRead: false
        }
      ]
    });

    // 8. Create Memories
    const memories = await prisma.memory.createMany({
      data: [
        {
          title: "First Date",
          description: "Our magical first date at the coffee shop downtown. We talked for 4 hours straight and I knew you were special. The rain started but we didn't care - we just kept talking under the little café awning.",
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
          title: "Beach Vacation",
          description: "Our incredible week in Hawaii. Swimming with dolphins, watching sunsets, and just being completely happy together. This trip made me realize how much I want to travel the world with you.",
          date: new Date("2024-02-20T00:00:00Z"),
          location: "Maui, Hawaii",
          mediaUrls: [
            "https://example.com/photos/hawaii-1.jpg",
            "https://example.com/photos/hawaii-2.jpg",
            "https://example.com/photos/hawaii-3.jpg",
            "https://example.com/videos/hawaii-sunset.mp4"
          ],
          creatorId: risper.id,
          relationshipId: relationship.id
        },
        {
          title: "Moving In Together",
          description: "The day we got the keys to our first apartment together. So many boxes, so much chaos, but we were laughing the whole time. Pizza on the floor in our empty living room was the best dinner ever.",
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
        title: "How Well Do You Know Me?",
        description: "A fun quiz to test how well we know each other's preferences, dreams, and quirks!",
        creatorId: walter.id,
        relationshipId: relationship.id
      }
    });

    // 10. Create Questions
    const questions = await prisma.question.createMany({
      data: [
        {
          content: "What's my favorite type of cuisine?",
          questionType: "MULTIPLE_CHOICE",
          options: ["Italian", "Thai", "Mexican", "Indian"],
          correctAnswer: "Italian",
          quizId: quiz.id
        },
        {
          content: "What's my biggest fear?",
          questionType: "OPEN_ENDED",
          quizId: quiz.id
        },
        {
          content: "Do I prefer mountains or beaches?",
          questionType: "MULTIPLE_CHOICE",
          options: ["Mountains", "Beaches"],
          correctAnswer: "Mountains",
          quizId: quiz.id
        },
        {
          content: "I'm a morning person.",
          questionType: "TRUE_FALSE",
          options: ["True", "False"],
          correctAnswer: "False",
          quizId: quiz.id
        },
        {
          content: "What's my dream vacation destination?",
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

    // 12. Create Quiz Response from Risper
    const quizResponse = await prisma.quizResponse.create({
      data: {
        score: 4,
        userId: risper.id,
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