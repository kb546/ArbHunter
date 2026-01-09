import { Discovery } from '@/types';

// In-memory storage for when Supabase is not configured
// This will reset on server restart, but it's fine for MVP
let mockDiscoveries: Discovery[] = [];

export function getMockDiscoveries(): Discovery[] {
  return [...mockDiscoveries]; // Return a copy to prevent mutation
}

export function addMockDiscovery(discovery: Discovery): void {
  mockDiscoveries = [discovery, ...mockDiscoveries];
}

export function clearMockDiscoveries(): void {
  mockDiscoveries = [];
}


