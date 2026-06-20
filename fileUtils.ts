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

export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      resolve(base64Data);
    };
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};
