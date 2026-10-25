import type { PlatformId } from '../platforms';

export type MediaType = 'video' | 'photo' | 'gif' | 'audio';

export interface MediaItem {
  type: MediaType;
  url: string;
  filename: string;
  thumbnail?: string;
  /** e.g. "1080p", "HD", "Audio" */
  label?: string;
  /** bytes, when the source tells us */
  size?: number;
  /** upstream request headers the CDN needs; forces the /dl proxy */
  headers?: Record<string, string>;
}

export interface ExtractResult {
  platform: PlatformId;
  title?: string;
  author?: string;
  thumbnail?: string;
  items: MediaItem[];
}

/** An error whose message is safe to show to users. */
export class ExtractError extends Error {
  constructor(
    message: string,
    public status = 422,
  ) {
    super(message);
  }
}
