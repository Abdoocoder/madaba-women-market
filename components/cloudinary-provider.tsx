'use client';

import { CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { CldUploadButton } from 'next-cloudinary';

// Wrapper component to ensure proper Cloudinary configuration
export function CloudinaryUploadButton(props: any) {
  return (
    <CldUploadButton
      signatureEndpoint="/api/sign-cloudinary-params"
      {...props}
    />
  );
}