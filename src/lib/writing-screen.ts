import { writable } from 'svelte/store';

// Store for the current text content
export const textContent = writable('');

// Store for the word count
export const wordCount = writable(0);

// Store for the current prompt
export const currentPrompt = writable('');

// Array of randomized story prompts
const storyPrompts = [
    "A mysterious package arrives at your door with no return address...",
    "You wake up to find that everyone in your town has disappeared except you...",
    "A stranger approaches you with a map to a place that doesn't exist...",
    "You discover a door in your basement that wasn't there yesterday...",
    "The last person on Earth sits alone in a room. There is a knock on the door...",
    "You find an old diary that seems to be writing itself...",
    "A time traveler from the year 3000 needs your help...",
    "You inherit a house from a relative you've never heard of...",
    "Every night at midnight, you hear the same song playing from nowhere...",
    "You can suddenly understand what animals are saying...",
    "A painting in a museum starts moving when you look at it...",
    "You receive a text message from your future self...",
    "The elevator in your building has a button for a floor that doesn't exist...",
    "You find a key that opens any door, but each door leads somewhere unexpected...",
    "A street that you walk down every day suddenly leads to a different city..."
];

// Function to get a random prompt
export function getRandomPrompt(): string {
    const randomIndex = Math.floor(Math.random() * storyPrompts.length);
    return storyPrompts[randomIndex];
}

// Function to update word count based on text content
export function updateWordCount(text: string): number {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    
    // Update the store
    wordCount.set(count);
    
    return count;
}

// Function to limit text to 300 words
export function limitTextTo300Words(text: string): string {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length > 300) {
        const limitedWords = words.slice(0, 300);
        return limitedWords.join(' ');
    }
    
    return text;
}

// Function to handle text input with word limit
export function handleTextInput(text: string): string {
    const limitedText = limitTextTo300Words(text);
    const count = updateWordCount(limitedText);
    
    // Update the text content store
    textContent.set(limitedText);
    
    return limitedText;
}

// Function to handle story submission
export function handleSubmit(text: string, count: number): void {
    if (text.trim()) {
        alert(`Story submitted! Word count: ${count}`);
        // Here you could add logic to save the story to a database or API
        console.log('Story submitted:', { text, wordCount: count });
    }
}

// Function to generate a new prompt
export function generateNewPrompt(): string {
    const newPrompt = getRandomPrompt();
    currentPrompt.set(newPrompt);
    return newPrompt;
}

// Function to initialize the writing screen
export function initializeWritingScreen(): void {
    // Set initial prompt
    generateNewPrompt();
    
    // Reset text content and word count
    textContent.set('');
    wordCount.set(0);
}

// Function to get word count status (for styling)
export function getWordCountStatus(count: number): 'normal' | 'warning' | 'limit' {
    if (count >= 300) return 'limit';
    if (count > 250) return 'warning';
    return 'normal';
}
