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

import type { ShotAngle, ShotConstraintMap } from './types';

export const SHOT_ANGLES: ShotAngle[] = [
  { name: 'Overhead View', description: 'Captured from a dramatic high angle, delivering a sweeping cinematic perspective — like viewing from a drone or helicopter.' },
  { name: 'Top View', description: 'Captured from a high, slightly elevated angle — looking down toward the standing subject at about 45 to 60 degrees. Keeps the subject upright while showcasing outfit shape, depth, and perspective, giving a cinematic overhead effect without flattening the scene.' },
  { name: 'Classic Headshot', description: 'A professional, business-style headshot. The shot should be framed from the chest up, focusing on the subject’s face in a clear and well-lit composition, suitable for a corporate profile or professional portfolio.' },
  { name: 'Detail Focus', description: 'Zooms in closely on a single feature, such as the eyes, lips, or another key detail.' },
  { name: 'Mid-Thigh View', description: 'From the subject’s mid-thigh height, angled slightly upward. This framing captures the subject from the upper thighs to just above the head, emphasizing posture and outfit structure. The composition mimics a mid-level editorial fashion photograph — confident, stylish, and elongated, without showing the full legs or feet.' },
  { name: 'Full Body View', description: 'Shows the entire subject from head to toe in full proportion.' },
  {
    name: 'Executive Seated Pose',
    description: 'Subject seated confidently on a chair with legs crossed, one hand resting under the chin and gaze direct — conveys power, focus, and elegance in a cinematic frame.',
  },
  { name: 'Half Body View', description: 'Composed from the waist up, capturing both body language and environment.' },
  { name: 'Upper Body View', description: 'Framed from the chest upward, balancing facial expression with subtle posture cues.' },
  { name: 'Wide View', description: 'Displays the full figure while incorporating the surrounding scenery for context.' },
  { name: 'Distant View', description: 'Also known as a cinematic wide shot, this captures the full subject from head to toe within a broad, detailed view of their environment. It focuses on atmosphere and the subject’s connection to their surroundings — such as elegant streets, studios, or open spaces — establishing scene, depth, and scale with natural light and visual storytelling.' },
  { name: 'Shoulder View', description: 'Shot over someone’s shoulder, keeping the main subject visible in front of them.' },
  { name: 'Editorial Frame', description: 'Single-subject composition inspired by a pair-style shot — the model is posed as if engaging with someone just outside the frame, creating balance and connection without adding a second person.' },
  { name: 'Tracking View', description: 'Simulates a moving camera that follows alongside the subject as they walk or turn. The subject stays sharp and in focus while the background shows a subtle sense of horizontal motion blur — capturing energy, movement, and the feeling of cinematic motion within a single frame.' },
  { name: 'Upward View', description: 'Inspired by the low-angle shot — captured from below the subject’s eye level, looking sharply upward. This view elongates the body, enhances posture, and gives a powerful, editorial presence as though the viewer is looking up toward the model.' },
  { name: 'Downward View', description: 'Photographed from a slightly elevated angle, looking gently down toward the model. This fashion-style high-angle view creates an elegant, reflective tone — the model appears softer and more introspective, with subtle emphasis on posture and flow.' },
  { name: 'Straight View', description: 'Based on the eye-level shot — photographed directly facing the subject at natural height. The frame feels neutral and balanced, creating a true-to-life look that mirrors direct human perspective with minimal distortion.' },
  { 
    name: 'Follow View', 
    description: 'Cinematic tracking shot from slightly behind and to the side of the subject as they walk confidently forward through an elegant space. Camera at mid-height, subject fills most of the frame, natural motion blur in background. Captured from ground level with a subtle upward tilt, it adds motion, depth, and realism—making the viewer feel as though they’re accompanying the model in the scene.' 
  },
  { name: 'Tilted View', description: 'Inspired by the Dutch-angle technique — the camera is intentionally tilted to one side, producing diagonal lines that add energy, tension, and drama. Perfect for creative, editorial fashion visuals that break symmetry for bold effect.' },
  { name: 'Perspective View', description: 'Presents the scene from the subject’s own perspective, immersing the viewer in their view.' },
  { name: 'Focus View', description: 'Simulates the effect of a telephoto zoom lens, keeping the subject in sharp focus while visually compressing and softening the background. The depth of field is shallow, with a naturally blurred, flattened backdrop that highlights the subject’s features, outfit, and detail — creating a cinematic sense of intimacy and focus.' },
  { name: 'Creator\'s View', description: 'A handheld, elevated selfie-style angle. The subject holds the camera high, with soft background blur for focus.' },
  { name: 'Prep Session (GRWM)', description: 'Captured from a mirror or vanity perspective, showing beauty, hair, or outfit prep in progress.' },
  { name: 'Fit Reveal (OOTD)', description: 'A full-body shot angle taken in front of a mirror, often taken slightly from below to elongate the figure and emphasize the outfit.' },
  { name: 'Reveal Frame (Unboxing)', description: 'Captured from a high or overhead angle, showing the subject’s hands as they open or reveal a product inside its packaging. Keep the camera looking directly downward to emphasize the unboxing moment. The product should be the clear hero of the composition, with clean background space and no visible faces or upper body.' },
  { name: 'Aesthetic Focus', description: 'A clean, stylized still-life product shot arranged artfully with complementary props on a textured or colored surface. Lighting should be soft and flattering, highlighting the product’s form and details. No people or models should appear in the frame — focus entirely on the product composition and visual harmony.' },
  { name: 'Travel Diaries', description: 'First-person POV lifestyle shot: the subject walks ahead in a scenic or elegant setting, glancing back over their shoulder, with one arm extended backward holding the camera holder’s hand — only the forearm and hand of the camera holder visible at the edge of frame. Warm, editorial travel aesthetic.' },
  { name: 'First-Person Frame', description: 'Captured from a true first-person point of view — as if seen through the viewer’s own eyes. Focus on the viewer’s hands holding an object such as a coffee cup, book, or flower, with the background softly visible to suggest location and mood. The frame should feel immersive and personal, without showing the person’s face or body.' },
  { name: 'Instructional Frame', description: 'A clear, close-up shot for tutorial or instructional content, showing hands demonstrating a specific process like cooking, crafting, or product use. Captured from a top-down or side angle to clearly highlight technique. The frame focuses entirely on the action — emphasizing the hands, tools, and materials involved, with no faces or upper bodies visible.' },
  { name: 'Car Point Of View', description: 'Framed from within a car interior, featuring the subject seated in the driver’s seat with bright, natural lighting, the shot should be a selfie.' },
  { name: 'Curve Walk', description: 'The subject walks across the frame in a subtle curve, showcasing natural movement and outfit flow.' },
  { name: 'POV (Point-of-View)', description: 'Seen directly from the subject’s perspective, highlighting their hands and actions to make the viewer feel part of the scene.' }
];

export const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/avif'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const NUM_SHOT_SELECTORS = 6;

export const GLOBAL_RULES: string[] = [
  "The final image must be a vertical 9:16 aspect ratio.",
  "This is a recomposition task. The goal is to adjust the camera's perspective using the original image as a base. Avoid creating entirely new subjects. The primary subject's identity and outfit should be preserved unless the specific shot angle requires focusing on a different detail (like hands or a product).",
  "Maintain a realistic photographic look. Do not change the time of day or lighting style unless the specific angle description calls for it."
];

export const SHOT_CONSTRAINTS: ShotConstraintMap = {
  "Classic Headshot": [
    "The shot should be a professional headshot, framed from the chest up.",
    "The composition should feel similar to a professional LinkedIn profile picture.",
    "The subject's face should be the primary focus, well-lit, and looking towards the camera.",
    "Please avoid dramatic shadows, extreme angles, or unusual cropping."
  ],
  "Travel Diaries": [
    "The shot should show the follower’s outstretched forearm/hand in the foreground, holding the subject’s hand.",
    "The subject should be ahead, turning back with a smile, with a travel scene in the background.",
    "Camera height should be around chest level to maintain a sense of forward motion.",
    "The connected hands are a key element and should not be cropped out."
  ],
  "Aesthetic Focus": [
    "This should be a top-down flat-lay composition of a product, arranged artfully with relevant props.",
    "No people or body parts (face, hair, arms, legs, or torso) should be visible in the shot.",
    "Use a clean, textured or colored background with soft, flattering light."
  ],
  "Reveal Frame (Unboxing)": [
    "This should be an overhead or high-angle shot looking directly down at the subject’s hands opening a box or product.",
    "The product and its packaging should be centered and the clear hero of the frame.",
    "The subject's face or torso should not be visible; the background must remain clean and uncluttered."
  ],
  "First-Person Frame": [
    "The composition should include the subject’s hand close to the camera, holding an object (e.g., coffee cup, passport, flower).",
    "The background should provide context to a larger story, perhaps with a shallow depth-of-field.",
    "The hand and object are the focal points; the face is optional and secondary."
  ],
  "Instructional Frame": [
    "Recompose the image to create a tight, close-up shot that focuses only on the subject's hands.",
    "The camera angle should be top-down or side-on to clearly show the action already present in the photo.",
    "The final image should be cropped so that the face and upper body are not visible. This is to highlight details of what the hands are holding or doing."
  ]
};