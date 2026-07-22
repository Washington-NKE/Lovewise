// domains/message/service.ts
import { auth } from "@/lib/auth";
import * as MessageRepository from "./repository";
import * as RelationshipRepository from "../relationship/repository";

export async function getMessages() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const relationship = await RelationshipRepository.findActiveRelationshipByUserId(session.user.id);
  if (!relationship) return [];

  // Query messages where sender is current user and receiver is partner, or vice versa
  const partnerId = relationship.userId === session.user.id ? relationship.partnerId : relationship.userId;

  return MessageRepository.findMessages(relationship.id, {
    OR: [
      { senderId: session.user.id, receiverId: partnerId },
      { senderId: partnerId, receiverId: session.user.id },
    ],
  });
}

export async function sendMessage(content: string, attachments?: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const relationship = await RelationshipRepository.findActiveRelationshipByUserId(session.user.id);
  if (!relationship) throw new Error("No active relationship found");

  const partnerId = relationship.userId === session.user.id ? relationship.partnerId : relationship.userId;

  return MessageRepository.createMessage({
    content,
    senderId: session.user.id,
    receiverId: partnerId,
    attachments,
  });
}

export async function markMessageAsRead(messageId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const message = await MessageRepository.findMessageById(messageId);
  if (!message) throw new Error("Message not found");

  if (message.receiverId !== session.user.id) {
    throw new Error("Forbidden");
  }

  return MessageRepository.updateMessage(messageId, { isRead: true });
}

export async function getUnreadMessagesCount(userId: string, senderId: string) {
  return MessageRepository.countMessages({
    receiverId: userId,
    senderId,
    isRead: false,
  });
}
