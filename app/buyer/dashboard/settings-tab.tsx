"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useLocale } from "@/lib/locale-context";

export function SettingsTab() {
  const { user, logout, refreshAuthUser } = useAuth();
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
    
    if (!auth.currentUser) return;

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
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email || "",
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwordData.newPassword);
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setIsChangingPassword(false);
      
      toast({ 
        title: t('messages.success'), 
        description: t('messages.passwordUpdated'), 
        variant: "success" 
      });
    } catch (error: any) {
      console.error("Error changing password: ", error);
      let errorMessage = t('messages.failedToUpdatePassword');
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = t('auth.wrongPassword');
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = t('auth.tooManyRequests');
      }
      
      toast({ 
        title: t('messages.error'), 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !user) return;

    if (deleteConfirmation !== t('settings.deleteAccountConfirmation')) {
      toast({ 
        title: t('messages.error'), 
        description: t('settings.deleteAccountConfirmationError'), 
        variant: "destructive" 
      });
      return;
    }

    try {
      // Re-authenticate before deletion
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email || "",
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete user document from Firestore
      const userDocRef = doc(db, "users", user.id);
      await deleteDoc(userDocRef);
      
      // Delete user from Firebase Auth
      await deleteUser(auth.currentUser);
      
      // Sign out
      await signOut(auth);
      
      toast({ 
        title: t('messages.success'), 
        description: t('messages.accountDeleted'), 
        variant: "success" 
      });
      
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting account: ", error);
      let errorMessage = t('messages.failedToDeleteAccount');
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = t('auth.requiresRecentLogin');
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = t('auth.wrongPassword');
      }
      
      toast({ 
        title: t('messages.error'), 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      toast({ 
        title: t('messages.success'), 
        description: t('messages.loggedOut'), 
        variant: "success" 
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
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('settings.newPassword')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
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
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
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
                  {t('settings.typeConfirmation')} "{t('settings.deleteAccountConfirmation')}"
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
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
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
