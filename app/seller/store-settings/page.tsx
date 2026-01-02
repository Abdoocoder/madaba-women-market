'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { useLocale } from '@/lib/locale-context'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/use-toast'

export default function StoreSettingsPage() {
  const { user, refreshAuthUser } = useAuth()
  const router = useRouter()
  const { t } = useLocale()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storeData, setStoreData] = useState({
    storeName: '',
    storeDescription: '',
    storeCoverImage: '',
    instagramUrl: '',
    whatsappUrl: ''
  })

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      router.push('/login')
      return
    }

    const fetchStoreData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data && !error) {
          setStoreData({
            storeName: data.store_name || data.name || '',
            storeDescription: data.store_description || '',
            storeCoverImage: data.store_cover_image || '',
            instagramUrl: data.instagram_url || '',
            whatsappUrl: data.whatsapp_url || ''
          })
        }
      } catch (error) {
        console.error('Error fetching store data:', error)
        toast({
          title: t('common.error'),
          description: t('messages.failedToFetchData'),
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStoreData()
  }, [user, router, t])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          store_name: storeData.storeName,
          store_description: storeData.storeDescription,
          store_cover_image: storeData.storeCoverImage,
          instagram_url: storeData.instagramUrl,
          whatsapp_url: storeData.whatsappUrl
        })
        .eq('id', user.id)

      if (error) throw error

      await refreshAuthUser()

      toast({
        title: t('common.success'),
        description: t('messages.storeSettingsUpdated')
      })
    } catch (error) {
      console.error('Error saving store settings:', error)
      toast({
        title: t('common.error'),
        description: t('messages.failedToUpdateStoreSettings'),
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }
  // ... rest of the file ...

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStoreData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return <div className="container mx-auto py-8">{t('common.loading')}</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('seller.storeSettings')}</CardTitle>
          <CardDescription>{t('seller.manageYourStore')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">{t('seller.storeName')}</Label>
            <Input
              id="storeName"
              name="storeName"
              value={storeData.storeName}
              onChange={handleInputChange}
              placeholder={t('seller.enterStoreName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeDescription">{t('seller.storeDescription')}</Label>
            <Textarea
              id="storeDescription"
              name="storeDescription"
              value={storeData.storeDescription}
              onChange={handleInputChange}
              placeholder={t('seller.enterStoreDescription')}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeCoverImage">{t('seller.storeCoverImage')}</Label>
            <Input
              id="storeCoverImage"
              name="storeCoverImage"
              value={storeData.storeCoverImage}
              onChange={handleInputChange}
              placeholder={t('seller.enterCoverImageUrl')}
            />
            {storeData.storeCoverImage && (
              <div className="mt-2">
                <Image
                  src={storeData.storeCoverImage}
                  alt={t('seller.storeCoverPreview')}
                  width={800}
                  height={300}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramUrl">{t('seller.instagramUrl')}</Label>
            <Input
              id="instagramUrl"
              name="instagramUrl"
              value={storeData.instagramUrl}
              onChange={handleInputChange}
              placeholder={t('seller.enterInstagramUrl')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappUrl">{t('seller.whatsappUrl')}</Label>
            <Input
              id="whatsappUrl"
              name="whatsappUrl"
              value={storeData.whatsappUrl}
              onChange={handleInputChange}
              placeholder={t('seller.enterWhatsappUrl')}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
