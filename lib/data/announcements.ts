export type AnnouncementType = 'seasonal' | 'promotion' | 'info' | 'warning';

export interface Announcement {
  id: string;
  type: AnnouncementType;
  title: string;
  titleRw: string;
  titleFr: string;
  message: string;
  messageRw: string;
  messageFr: string;
  icon?: string;
  link?: string;
  linkText?: string;
  startDate: string;
  endDate: string;
  priority: number; // Higher number = higher priority
  dismissible: boolean;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'announcements';

// Load from localStorage
export function getAnnouncements(): Announcement[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load announcements:', error);
  }
  
  return [];
}

// Save to localStorage
export function saveAnnouncements(announcements: Announcement[]) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
    // Trigger event for website sync
    window.dispatchEvent(new Event('announcements-updated'));
  } catch (error) {
    console.error('Failed to save announcements:', error);
  }
}

// Get single announcement
export function getAnnouncement(id: string): Announcement | undefined {
  return getAnnouncements().find(a => a.id === id);
}

// Add announcement
export function addAnnouncement(announcement: Announcement) {
  const announcements = getAnnouncements();
  saveAnnouncements([...announcements, announcement]);
}

// Update announcement
export function updateAnnouncement(id: string, updates: Partial<Announcement>) {
  const announcements = getAnnouncements();
  const updated = announcements.map(a =>
    a.id === id ? { ...a, ...updates } : a
  );
  saveAnnouncements(updated);
}

// Delete announcement
export function deleteAnnouncement(id: string) {
  const announcements = getAnnouncements();
  saveAnnouncements(announcements.filter(a => a.id !== id));
}

// Toggle active status
export function toggleAnnouncementActive(id: string) {
  const announcements = getAnnouncements();
  const updated = announcements.map(a =>
    a.id === id ? { ...a, active: !a.active } : a
  );
  saveAnnouncements(updated);
}

// Get active announcements (for preview)
export function getActiveAnnouncements(): Announcement[] {
  const now = new Date();
  
  return getAnnouncements()
    .filter((announcement) => {
      if (!announcement.active) return false;
      
      const start = new Date(announcement.startDate);
      const end = new Date(announcement.endDate);
      
      return now >= start && now <= end;
    })
    .sort((a, b) => b.priority - a.priority);
}
