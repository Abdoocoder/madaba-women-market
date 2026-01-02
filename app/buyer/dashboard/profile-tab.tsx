"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { User } from "lucide-react";
import { CldUploadButton } from 'next-cloudinary';
import { useCloudinaryConfig } from '@/hooks/use-cloudinary-config';
import { useToast } from "@/components/ui/use-toast";
import { useLocale } from "@/lib/locale-context";

export function ProfileTab() {
  const { user, refreshAuthUser } = useAuth();
  const { t } = useLocale();
  const { isConfigured: isCloudinaryConfigured, isLoading: isCloudinaryLoading } = useCloudinaryConfig();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [avatar, setAvatar] = useState(user?.avatar || user?.photoURL || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setAvatar(user.avatar || user.photoURL || "");
    }
  }, [user]);

  const handleUpload = async (result: unknown) => {
    // Type assertion for Cloudinary result
    const cloudinaryResult = result as { event?: string; info?: { secure_url: string } };
    if (!user || !user.id) return;

    if (cloudinaryResult.event !== "success" || !cloudinaryResult.info?.secure_url) {
      toast({
        title: t('messages.error'),
        description: t('messages.failedToUploadImage'),
        variant: "destructive"
      });
      return;
    }

    const newAvatar = cloudinaryResult.info!.secure_url;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatar })
        .eq("id", user.id);

      if (error) throw error;

      setAvatar(newAvatar);
      await refreshAuthUser();

      toast({
        title: t('messages.success'),
        description: t('messages.avatarUpdated')
      });
    } catch (error) {
      console.error("Error updating avatar: ", error);
      toast({
        title: t('messages.error'),
        description: t('messages.failedToUpdateAvatar'),
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            name: formData.name,
            phone: formData.phone,
            avatar_url: avatar
          })
          .eq("id", user.id);

        if (error) throw error;

        await refreshAuthUser();

        toast({
          title: t('messages.success'),
          description: t('messages.profileUpdated')
        });

        setIsEditing(false);
      }
    } catch (error: unknown) {
      toast({
        title: t('messages.error'),
        description: (error as Error).message || t('messages.failedToUpdateProfile'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // ... rest of the file ...

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.profile')}</CardTitle>
        <CardDescription>{t('dashboard.profileDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={avatar} alt={user?.name} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>

            {!isCloudinaryLoading && isCloudinaryConfigured ? (
              <CldUploadButton
                options={{
                  sources: ['local', 'url', 'camera'],
                  multiple: false,
                  maxFiles: 1,
                  folder: 'avatars',
                }}
                onUpload={handleUpload}
                uploadPreset="madaba-women-market-presets"
              >
                <div className="inline-block">
                  <Button variant="outline" size="sm" asChild>
                    <span>{t('profile.changeAvatar')}</span>
                  </Button>
                </div>
              </CldUploadButton>
            ) : (
              <Button disabled variant="outline" size="sm">
                {isCloudinaryLoading ? t('messages.uploadLoading') : t('messages.uploadDisabled')}
              </Button>
            )}
          </div>

          <div className="flex-1 w-full">
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{formData.name}</h3>
                  <p className="text-gray-600">{formData.email}</p>
                  {formData.phone && <p className="text-gray-600">{formData.phone}</p>}
                </div>
                <Button onClick={() => setIsEditing(true)}>
                  {t('common.edit')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('admin.name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('admin.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled
                  />
                  <p className="text-xs text-gray-500">{t('profile.emailChangeNote')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('profile.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t('common.saving') : t('common.save')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      if (user) {
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                          phone: user.phone || "",
                        });
                      }
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
