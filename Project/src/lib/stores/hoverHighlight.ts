// Store for tracking hovered subtask and major task for highlight overlay

import { writable } from 'svelte/store';

export const hoveredSubtaskId = writable<number | null>(null);
export const hoveredMajorTaskId = writable<string | null>(null);
