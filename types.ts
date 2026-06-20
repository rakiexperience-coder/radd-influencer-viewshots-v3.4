/**
 * RADD Influencer ViewShots App
 * Copyright (c) 2025 Raki AI Digital DEN
 * ALL rights reserved.
 *
 * Licensed under the RADD Proprietary License.
 * Unauthorized copying, modification, distribution, or use
 * of this software, via any medium, is strictly prohibited
 * without prior written permission from Raki AI Digital DEN.
 */

export interface ShotAngle {
  name: string;
  description: string;
}

export interface GeneratedImage {
  id: string;
  angleName: string;
  imageUrl: string | null;
  error?: string;
}

// Type for mapping constraints to shot angle names
export type ShotConstraintMap = Record<string, string[]>;
