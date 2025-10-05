// Cloudinary Upload Debug Helper
// This will help us understand what's happening with the upload

export function debugCloudinaryUpload() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  console.log('🎨 Cloudinary Debug Info:');
  console.log('Cloud Name:', cloudName);
  console.log('Upload Preset:', uploadPreset);
  
  if (!cloudName) {
    console.error('❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing');
    return false;
  }
  
  if (!uploadPreset) {
    console.error('❌ NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is missing');
    return false;
  }
  
  return true;
}

export async function testCloudinaryPreset() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    console.error('Missing Cloudinary configuration');
    return false;
  }
  
  try {
    // Test if the upload preset exists by making a simple request
    const testUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const formData = new FormData();
    formData.append('upload_preset', uploadPreset);
    formData.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='); // 1x1 transparent PNG
    
    const response = await fetch(testUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      console.log('✅ Cloudinary upload preset is working');
      const result = await response.json();
      console.log('Test upload result:', result.public_id);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Cloudinary upload preset test failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Cloudinary test error:', error);
    return false;
  }
}
