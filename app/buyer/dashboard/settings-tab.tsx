"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useLocale } from "@/lib/locale-context";

export function SettingsTab() {
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t('messages.error'),
        description: t('auth.passwordsDoNotMatch'),
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: t('messages.error'),
        description: t('auth.passwordTooShort'),
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setIsChangingPassword(false);

      toast({
        title: t('messages.success'),
        description: t('messages.passwordUpdated')
      });
    } catch (error) {
      console.error("Error changing password: ", error);
      toast({
        title: t('messages.error'),
        description: t('messages.failedToUpdatePassword'),
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    // Supabase client-side deletion is restricted for security.
    // Usually handled via service role on server side or self-deletion RLS.
    // For now, we'll show a message that this requires administrative action.
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "default"
    });
    setIsDeletingAccount(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      toast({
        title: t('messages.success'),
        description: t('messages.loggedOut')
      });
    } catch (error) {
      console.error("Error logging out: ", error);
      toast({
        title: t('messages.error'),
        description: t('messages.failedToLogout'),
        variant: "destructive"
      });
    }
  };
  // ... rest of the file ...

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.password')}</CardTitle>
          <CardDescription>{t('dashboard.passwordDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isChangingPassword ? (
            <Button onClick={() => setIsChangingPassword(true)}>
              {t('settings.changePassword')}
            </Button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t('settings.currentPassword')}</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">{t('settings.newPassword')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('settings.confirmPassword')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{t('common.save')}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.logout')}</CardTitle>
          <CardDescription>{t('dashboard.logoutDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogout}>
            {t('auth.logout')}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t('settings.deleteAccount')}</CardTitle>
          <CardDescription>{t('settings.deleteAccountDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isDeletingAccount ? (
            <Button
              variant="destructive"
              onClick={() => setIsDeletingAccount(true)}
            >
              {t('settings.deleteAccount')}
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {t('settings.deleteAccountWarning')}
              </p>

              <div className="space-y-2">
                <Label htmlFor="delete-confirmation">
                  {t('settings.typeConfirmation')} &quot;{t('settings.deleteAccountConfirmation')}&quot;
                </Label>
                <Input
                  id="delete-confirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delete-password">{t('settings.enterPassword')}</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                >
                  {t('settings.deleteAccount')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeletingAccount(false);
                    setDeleteConfirmation("");
                    setPasswordData({
                      ...passwordData,
                      currentPassword: ""
                    });
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
