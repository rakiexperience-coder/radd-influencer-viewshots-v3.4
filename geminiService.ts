
import { GoogleGenAI } from "@google/genai";
import type { UploadedFile } from '../types';
import { SHOT_ANGLES, GLOBAL_RULES, SHOT_CONSTRAINTS } from '../constants';

/**
 * Creates a fresh instance of the Gemini API client.
 * Using a function to ensure we always use the latest key from the BYOK flow.
 */
const getAIInstance = () => {
  const key = localStorage.getItem('radd_user_api_key') || process.env.API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Internal helper to handle the API call with the correct structure.
 */
async function callGeminiModel(model: string, imagePart: any, textPart: any, aspectRatio: string) {
  const ai = getAIInstance();
  if (!ai) throw new Error("Gemini API key is not configured.");

  return await ai.models.generateContent({
    model,
    contents: [{ parts: [textPart, imagePart] }],
    config: {
      imageConfig: {
        aspectRatio: aspectRatio === '9:16' ? '9:16' : (aspectRatio === '16:9' ? '16:9' : '1:1')
      }
    }
  });
}

/**
 * Extracts base64 image data from a Gemini response.
 */
const extractImage = (response: any) => {
  const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (part?.inlineData) {
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  return null;
};

export const generateViewShot = async (
  uploadedFile: UploadedFile,
  angleLabel: string,
  aspectRatio: string
): Promise<string> => {
  const ai = getAIInstance();
  if (!ai && !process.env.API_KEY) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomSeed = Math.random().toString(36).substring(7);
        const [width, height] = aspectRatio === '1:1' ? [600, 600] : aspectRatio === '16:9' ? [960, 540] : [540, 960];
        resolve(`https://picsum.photos/seed/${randomSeed}/${width}/${height}`);
      }, 1000 + Math.random() * 2000);
    });
  }

  const selectedAngle = SHOT_ANGLES.find(angle => angle.name === angleLabel);
  const angleDescription = selectedAngle ? selectedAngle.description : '';
  const specificConstraints = SHOT_CONSTRAINTS[angleLabel] || [];
  
  const promptText = [
    "Task: Photorealistic Image Recomposition",
    `Subject: Maintain exact person, outfit, and likeness from the reference.`,
    `Angle: ${angleLabel}`,
    `Description: ${angleDescription}`,
    "",
    "Rules:",
    ...GLOBAL_RULES,
    ...specificConstraints,
  ].join("\n");

  const imagePart = {
    inlineData: {
      data: uploadedFile.base64,
      mimeType: uploadedFile.type,
    },
  };

  const textPart = { text: promptText };

  // Primary Attempt: Standard Flash Model
  try {
    const response = await callGeminiModel('gemini-2.5-flash-image', imagePart, textPart, aspectRatio);
    const result = extractImage(response);
    if (result) return result;
  } catch (error: any) {
    // If Flash fails with a hard error, we continue to fallback logic below
    console.warn(`Flash model error for ${angleLabel}:`, error.message);
  }

  // Fallback Logic:
  // We reach here if Flash returned no image OR threw an error.
  
  // Strategy 1: Try Pro Model (Robust for complex angles)
  try {
    const response = await callGeminiModel('gemini-3-pro-image-preview', imagePart, textPart, aspectRatio);
    const result = extractImage(response);
    if (result) return result;
  } catch (error: any) {
    const isPermissionError = error?.message?.includes("403") || error?.message?.includes("PERMISSION_DENIED");
    
    if (isPermissionError) {
      console.warn("API key lacks permission for Pro model. Falling back to simplified Flash prompt.");
      // Strategy 2: Permission denied for Pro? Try a super-simplified prompt on Flash.
      // Often, simpler prompts bypass internal "complex scene" constraints.
      try {
        const simpleTextPart = { text: `A photorealistic photo of the subject from the reference image, seen from a ${angleLabel}. ${angleDescription}` };
        const response = await callGeminiModel('gemini-2.5-flash-image', imagePart, simpleTextPart, aspectRatio);
        const result = extractImage(response);
        if (result) return result;
      } catch (retryError) {
        console.error("Simplified Flash retry also failed:", retryError);
      }
      
      throw new Error(`Your API key does not have permission to use the high-quality model required for the "${angleLabel}". Please upgrade your key to a paid tier or try a different angle.`);
    }
    
    console.error(`Pro model fallback failed for ${angleLabel}:`, error.message);
  }

  throw new Error(`The model was unable to generate the "${angleLabel}" due to internal constraints or safety filters. Please try a different angle or a clearer upload.`);
};
