import { useState, useEffect } from 'react'

export function useCloudinaryConfig() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if Cloudinary is properly configured
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    setIsConfigured(Boolean(cloudName))
    setIsLoading(false)
  }, [])

  return { isConfigured, isLoading }
}
