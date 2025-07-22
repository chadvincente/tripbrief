// TypeScript declarations for Umami analytics

interface UmamiEventData {
  [key: string]: string | number | boolean | null
}

interface Umami {
  track(eventName: string, eventData?: UmamiEventData): void
}

declare global {
  interface Window {
    umami?: Umami
  }
}

export {}