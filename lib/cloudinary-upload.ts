/**
 * Cloudinary Upload Configuration
 * This handles multiple upload preset fallbacks and debugging
 */

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  // Try multiple presets in order of preference
  uploadPresets: [
    'madaba-women-market-presets', // Your custom preset (if created)
    'unsigned_uploads',             // Common default
    'ml_default',                   // Cloudinary default
    '', // Last resort: no preset (only works if unsigned uploads are enabled globally)
  ],
};

export async function uploadToCloudinary(file: File): Promise<string> {
  const { cloudName, uploadPresets } = cloudinaryConfig;
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }
  
  console.log('🎨 Starting Cloudinary upload...');
  
  // Try each preset until one works
  for (const preset of uploadPresets) {
    try {
      console.log(`Trying upload preset: "${preset || 'no preset'}"`);
      
      const formData = new FormData();
      formData.append('file', file);
      
      if (preset) {
        formData.append('upload_preset', preset);
      }
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Upload successful with preset:', preset || 'no preset');
        return result.secure_url;
      } else {
        const errorText = await response.text();
        console.warn(`❌ Upload failed with preset "${preset}":`, response.status, errorText);
        
        // If this is the last preset, throw the error
        if (preset === uploadPresets[uploadPresets.length - 1]) {
          throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }
      }
    } catch (error) {
      console.warn(`Error with preset "${preset}":`, error);
      
      // If this is the last preset, throw the error
      if (preset === uploadPresets[uploadPresets.length - 1]) {
        throw error;
      }
    }
  }
  
  throw new Error('All upload presets failed');
}