// domains/event/service.ts
import * as EventRepository from "./repository";

export interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  date: string;
  time?: string;
  isAllDay: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  reminderTime?: string;
  creatorId: string;
  relationshipId: string;
  gradient?: string;
}

export interface NewEventData {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  time?: string;
  type: string;
  isAllDay: boolean;
  reminderTime?: Date | string | null;
  relationshipId: string;
  creatorId: string;
}

const eventGradients = [
  "from-red-400 to-pink-600",
  "from-purple-400 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-fuchsia-500 to-purple-600",
  "from-amber-400 via-orange-500 to-red-500",
  "from-blue-500 to-cyan-600",
  "from-green-400 to-teal-500",
  "from-yellow-400 to-amber-500",
  "from-emerald-400 to-teal-500",
  "from-violet-500 to-purple-600",
  "from-sky-400 to-blue-500",
  "from-lime-400 to-green-500",
  "from-rose-400 to-pink-500",
  "from-indigo-500 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-teal-400 to-green-500",
];

export const getRandomEventGradient = async (): Promise<string> => {
  return eventGradients[Math.floor(Math.random() * eventGradients.length)];
};

const attachGradientToEvent = async (event: Event): Promise<Event> => {
  const gradient = await getRandomEventGradient();
  return {
    ...event,
    createdAt: event.createdAt.toString(),
    updatedAt: event.updatedAt.toString(),
    gradient,
  };
};

export const getUpcomingEventsByRelationship = async (relationshipId: string): Promise<Event[]> => {
  try {
    const events = await EventRepository.findEvents(relationshipId, {
      startDate: {
        gte: new Date(),
      },
    });

    if (!events || events.length === 0) return [];

    const mappedEvents: Event[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description ?? "",
      location: event.location ?? undefined,
      date: event.startDate ? event.startDate.toISOString() : new Date().toISOString(),
      time: event.time ?? undefined,
      isAllDay: event.isAllDay,
      type: event.type ?? "other",
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      reminderTime: event.reminderTime ? event.reminderTime.toISOString() : undefined,
      creatorId: event.creatorId,
      relationshipId: event.relationshipId,
    }));

    return Promise.all(mappedEvents.map(attachGradientToEvent));
  } catch (error: any) {
    console.error("Error fetching upcoming events:", error);
    throw new Error("Failed to fetch events: " + error.message);
  }
};

export const getPastEventsByRelationship = async (relationshipId: string): Promise<Event[]> => {
  try {
    const events = await EventRepository.findEvents(relationshipId, {
      startDate: {
        lt: new Date(),
      },
    });

    if (!events || events.length === 0) return [];

    const mappedEvents: Event[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description ?? "",
      location: event.location ?? undefined,
      date: event.startDate ? event.startDate.toISOString() : new Date().toISOString(),
      time: event.time ?? undefined,
      isAllDay: event.isAllDay,
      type: event.type ?? "other",
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      reminderTime: event.reminderTime ? event.reminderTime.toISOString() : undefined,
      creatorId: event.creatorId,
      relationshipId: event.relationshipId,
    }));

    return Promise.all(mappedEvents.map(attachGradientToEvent));
  } catch (error: any) {
    console.error("Error fetching past events:", error);
    throw new Error("Failed to fetch events: " + error.message);
  }
};

export const createEvent = async (data: NewEventData): Promise<Event> => {
  try {
    let finalReminderTime: Date | null = null;
    if (data.reminderTime && typeof data.reminderTime === "string") {
      finalReminderTime = new Date(data.reminderTime);
    } else if (data.reminderTime instanceof Date) {
      finalReminderTime = data.reminderTime;
    }

    const event = await EventRepository.createEvent({
      title: data.title,
      description: data.description,
      location: data.location,
      startDate: data.startDate,
      endDate: data.endDate || data.startDate,
      time: data.time,
      type: data.type,
      isAllDay: data.isAllDay,
      reminderTime: finalReminderTime,
      relationshipId: data.relationshipId,
      creatorId: data.creatorId,
    });

    const mappedEvent: Event = {
      id: event.id,
      title: event.title,
      description: event.description ?? "",
      location: event.location ?? undefined,
      date: event.startDate.toISOString(),
      time: event.time ?? undefined,
      isAllDay: event.isAllDay,
      type: event.type ?? "other",
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      reminderTime: event.reminderTime ? event.reminderTime.toISOString() : undefined,
      creatorId: event.creatorId,
      relationshipId: event.relationshipId,
    };

    return attachGradientToEvent(mappedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Failed to create event");
  }
};
