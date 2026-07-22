// database/db.ts
"use server";

import * as JournalService from "@/domains/journal/service";
import * as MemoryService from "@/domains/memory/service";
import * as RelationshipService from "@/domains/relationship/service";
import * as EventService from "@/domains/event/service";
import * as GiftService from "@/domains/gift/service";
import * as WishlistService from "@/domains/wishlist/service";
import * as OccasionService from "@/domains/occasion/service";
import * as ThoughtfulIdeaService from "@/domains/thoughtful-idea/service";
import * as SecretPlanService from "@/domains/secret-plan/service";
import * as LoveLetterService from "@/domains/love-letter/service";
import * as UserService from "@/domains/user/service";
import * as GameService from "@/domains/game/service";

export type { JournalEntry } from "@/domains/journal/service";
export type { Memory, NewMemoryData } from "@/domains/memory/service";
export type { Event, NewEventData } from "@/domains/event/service";

// Journal
export async function getJournalEntries() {
  return JournalService.getJournalEntries();
}
export async function getSharedJournalEntries() {
  return JournalService.getSharedJournalEntries();
}
export async function getPrivateJournalEntries() {
  return JournalService.getPrivateJournalEntries();
}
export async function createJournalEntry(formData: any) {
  return JournalService.createJournalEntry(formData);
}
export async function updateJournalEntry(id: string, formData: any) {
  return JournalService.updateJournalEntry(id, formData);
}
export async function deleteJournalEntry(id: string) {
  return JournalService.deleteJournalEntry(id);
}
export async function getJournalEntryById(id: string) {
  return JournalService.getJournalEntryById(id);
}

// Memory
export async function getRandomGradient() {
  return MemoryService.getRandomGradient();
}
export async function getMemoriesByRelationship(relationshipId: string) {
  return MemoryService.getMemoriesByRelationship(relationshipId);
}
export async function getFavoriteMemoriesByRelationship(relationshipId: string) {
  return MemoryService.getFavoriteMemoriesByRelationship(relationshipId);
}
export async function getMemoriesByAlbum(albumId: string) {
  return MemoryService.getMemoriesByAlbum(albumId);
}
export async function getAlbumsByRelationship(relationshipId: string) {
  return MemoryService.getAlbumsByRelationship(relationshipId);
}
export async function createMemory(data: any) {
  return MemoryService.createMemory(data);
}
export async function toggleMemoryFavorite(id: string) {
  return MemoryService.toggleMemoryFavorite(id);
}
export async function toggleMemorySaved(id: string) {
  return MemoryService.toggleMemorySaved(id);
}
export async function getMemoryById(id: string) {
  return MemoryService.getMemoryById(id);
}
export async function deleteMemory(id: string) {
  return MemoryService.deleteMemory(id);
}
export async function updateMemory(id: string, data: any) {
  return MemoryService.updateMemory(id, data);
}
export async function getMemoryStats(relationshipId: string) {
  return MemoryService.getMemoryStats(relationshipId);
}
export async function updateMultipleMemories(ids: string[], data: any) {
  return MemoryService.updateMultipleMemories(ids, data);
}
export async function getMemoriesByCreator(userId: string) {
  return MemoryService.getMemoriesByCreator(userId);
}

// Relationship
export async function getRelationshipId() {
  return RelationshipService.getRelationshipId();
}
export async function getCurrentUserRelationshipDetails() {
  return RelationshipService.getCurrentUserRelationshipDetails();
}
export async function getCurrentUserRelationships() {
  return RelationshipService.getCurrentUserRelationships();
}

// Event
export async function getRandomEventGradient() {
  return EventService.getRandomEventGradient();
}
export async function getUpcomingEventsByRelationship(relationshipId: string) {
  return EventService.getUpcomingEventsByRelationship(relationshipId);
}
export async function getPastEventsByRelationship(relationshipId: string) {
  return EventService.getPastEventsByRelationship(relationshipId);
}
export async function createEvent(data: any) {
  return EventService.createEvent(data);
}

// Gift
export async function createGift(data: any) {
  return GiftService.createGift(data);
}
export async function getGiftHistory(relationshipId: string) {
  return GiftService.getGiftHistory(relationshipId);
}
export async function updateGift(id: string, data: any) {
  return GiftService.updateGift(id, data);
}
export async function deleteGift(id: string) {
  return GiftService.deleteGift(id);
}
export async function getFavoriteGifts(relationshipId: string) {
  return GiftService.getFavoriteGifts(relationshipId);
}
export async function getGiftStats(relationshipId: string) {
  return GiftService.getGiftStats(relationshipId);
}
export async function getGiftsForRelationship(relationshipId: string) {
  return GiftService.getGiftsForRelationship(relationshipId);
}

// Wishlist
export async function createWishlistItem(data: any) {
  return WishlistService.createWishlistItem(data);
}
export async function getWishlist(userId: string, relationshipId: string) {
  return WishlistService.getWishlist(userId, relationshipId);
}
export async function updateWishlistItem(id: string, data: any) {
  return WishlistService.updateWishlistItem(id, data);
}
export async function deleteWishlistItem(id: string) {
  return WishlistService.deleteWishlistItem(id);
}
export async function markAsGifted(id: string) {
  return WishlistService.markAsGifted(id);
}

// Occasion
export async function createSpecialOccasion(data: any) {
  return OccasionService.createSpecialOccasion(data);
}
export async function getSpecialOccasions(userId: string) {
  return OccasionService.getSpecialOccasions(userId);
}
export async function updateSpecialOccasion(id: string, data: any) {
  return OccasionService.updateSpecialOccasion(id, data);
}
export async function deleteSpecialOccasion(id: string) {
  return OccasionService.deleteSpecialOccasion(id);
}
export async function getUpcomingOccasions(userId: string, daysAhead?: number) {
  return OccasionService.getUpcomingOccasions(userId, daysAhead);
}

// ThoughtfulIdea
export async function createThoughtfulIdea(data: any) {
  return ThoughtfulIdeaService.createThoughtfulIdea(data);
}
export async function getThoughtfulIdeas(userId: string) {
  return ThoughtfulIdeaService.getThoughtfulIdeas(userId);
}
export async function updateThoughtfulIdea(id: string, data: any) {
  return ThoughtfulIdeaService.updateThoughtfulIdea(id, data);
}
export async function deleteThoughtfulIdea(id: string) {
  return ThoughtfulIdeaService.deleteThoughtfulIdea(id);
}

// SecretPlan
export async function createSecretPlan(data: any) {
  return SecretPlanService.createSecretPlan(data);
}
export async function getSecretPlans(userId: string) {
  return SecretPlanService.getSecretPlans(userId);
}
export async function updateSecretPlan(id: string, data: any) {
  return SecretPlanService.updateSecretPlan(id, data);
}
export async function deleteSecretPlan(id: string) {
  return SecretPlanService.deleteSecretPlan(id);
}
export async function createSecretPlanItem(data: any) {
  return SecretPlanService.createSecretPlanItem(data);
}
export async function updateSecretPlanItem(id: string, data: any) {
  return SecretPlanService.updateSecretPlanItem(id, data);
}
export async function deleteSecretPlanItem(id: string) {
  return SecretPlanService.deleteSecretPlanItem(id);
}

// LoveLetter
export async function createLoveLetter(data: any) {
  return LoveLetterService.createLoveLetter(data);
}
export async function getLoveLetters(userId: string) {
  return LoveLetterService.getLoveLetters(userId);
}
export async function updateLoveLetter(id: string, data: any) {
  return LoveLetterService.updateLoveLetter(id, data);
}
export async function deleteLoveLetter(id: string) {
  return LoveLetterService.deleteLoveLetter(id);
}

// User
export async function createUser(data: any) {
  return UserService.createUser(data);
}
export async function getUser(id: string) {
  return UserService.getUser(id);
}
export async function getUserByEmail(email: string) {
  return UserService.getUserByEmail(email);
}

// Game
export async function getAllGames() {
  return GameService.getAllGames();
}
export async function createGame(data: any) {
  return GameService.createGame(data);
}