import { snackbar, requestNotificationPermission, sendNotification } from 'snackbar-project';
import type { Subtask } from './stores/subtasks';

// Request notification permissions on first interaction
let permissionRequested = false;

export async function ensureNotificationPermission() {
  if (!permissionRequested) {
    permissionRequested = true;
    await requestNotificationPermission();
  }
}

// Notify when an event is created
export function notifyEventCreated(event: Subtask) {
  ensureNotificationPermission();
  
  snackbar.success(`Event created: ${event.title}`, {
    duration: 4000,
    position: 'bottom-right'
  });

  sendNotification(
    'Event Created', 
    `${event.title} scheduled for ${event.date} at ${event.startTime}`,
    {
      icon: '/favicon.svg',
      tag: `event-created-${event.id}`
    }
  );
}

// Notify when an event is modified
export function notifyEventModified(event: Subtask) {
  snackbar.info(`Event updated: ${event.title}`, {
    duration: 4000,
    position: 'bottom-right'
  });

  sendNotification(
    'Event Updated', 
    `${event.title} has been modified`,
    {
      icon: '/favicon.svg',
      tag: `event-updated-${event.id}`
    }
  );
}

// Notify when an event is within 1 hour
export function notifyEventReminder(event: Subtask) {
  const minutesUntil = getMinutesUntilEvent(event);
  
  snackbar.warning(`Reminder: ${event.title} starts in ${minutesUntil} minutes`, {
    duration: 6000,
    position: 'top-center',
    showClose: true
  });

  sendNotification(
    'Event Reminder', 
    `${event.title} starts in ${minutesUntil} minutes`,
    {
      icon: '/favicon.svg',
      tag: `event-reminder-${event.id}`,
      requireInteraction: true
    }
  );
}

// Calculate minutes until an event starts
function getMinutesUntilEvent(event: Subtask): number {
  const now = new Date();
  const [year, month, day] = event.date.split('-').map(Number);
  const [hours, minutes] = event.startTime.split(':').map(Number);
  const eventDate = new Date(year, month - 1, day, hours, minutes);
  
  return Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60));
}

// Check if an event is within the reminder window (< 60 minutes)
export function isEventWithinReminderWindow(event: Subtask): boolean {
  const minutesUntil = getMinutesUntilEvent(event);
  return minutesUntil > 0 && minutesUntil <= 60;
}

// Check all events and send reminders for upcoming ones
export function checkUpcomingEvents(events: Subtask[]) {
  const now = new Date();
  const remindersSent = new Set<string>(
    JSON.parse(localStorage.getItem('remindersSent') || '[]')
  );

  events.forEach(event => {
    const minutesUntil = getMinutesUntilEvent(event);
    const eventIdStr = String(event.id);
    
    // Send reminder if within 60 minutes and not already sent
    if (minutesUntil > 0 && minutesUntil <= 60 && !remindersSent.has(eventIdStr)) {
      notifyEventReminder(event);
      remindersSent.add(eventIdStr);
    }
    
    // Clear reminder flag if event has passed
    if (minutesUntil < 0) {
      remindersSent.delete(eventIdStr);
    }
  });

  localStorage.setItem('remindersSent', JSON.stringify(Array.from(remindersSent)));
}
