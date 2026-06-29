/** DTO de persona desaparecida tal como lo consume el panel admin. */

export type MissingStatus = "active" | "found";

export interface MissingPerson {
  id: string;
  name: string;
  age: number | null;
  nationality: string;
  description: string;
  lastSeen: string;
  contact: string;
  photoUrl: string | null;
  status: MissingStatus;
  resolutionNote: string | null;
  resolutionPhotoUrl: string | null;
  resolvedAt: number | null;
  createdAt: number;
}
