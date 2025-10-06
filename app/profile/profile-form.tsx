"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { User, Edit3 } from "lucide-react";
import { CldUploadButton } from 'next-cloudinary';
import { useCloudinaryConfig } from '@/hooks/use-cloudinary-config';
import { useLocale } from '@/lib/locale-context';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const orders = [
    { id: "ORD001", date: "2023-10-28", total: "150.00 ر.س", status: "تم التوصيل" },
    { id: "ORD002", date: "2023-11-15", total: "250.00 ر.س", status: "قيد الشحن" },
    { id: "ORD003", date: "2023-11-20", total: "95.50 ر.س", status: "تم التأكيد" },
];

export default function ProfileForm() {
    const { user, isLoading, refreshAuthUser } = useAuth();
    const { t } = useLocale();
    const { isConfigured: isCloudinaryConfigured, isLoading: isCloudinaryLoading } = useCloudinaryConfig();
    const router = useRouter();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            const userAvatar = user.avatar || "";
            setAvatar(userAvatar);
            console.log("User avatar updated:", userAvatar);
        }
    }, [user]);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">{t('common.loading')}</div>;
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    const handleUpload = async (result: any) => {
        console.log("Upload result:", result);
        
        if (!user || !user.id) return;

        // Check if upload was successful
        if (result.event !== "success" || !result.info?.secure_url) {
            console.error("Upload failed:", result);
            toast({ 
                title: "Error", 
                description: t('messages.failedToUploadImage'), 
                variant: "destructive" 
            });
            return;
        }

        const newAvatar = result.info.secure_url;
        console.log("New avatar URL:", newAvatar);

        try {
            const userDocRef = doc(db, "users", user.id);
            await updateDoc(userDocRef, { avatar: newAvatar });
            
            if(auth.currentUser) {
                await updateProfile(auth.currentUser, { photoURL: newAvatar });
            }
            
            // Update local state immediately for instant UI feedback
            setAvatar(newAvatar);
            
            await refreshAuthUser();

            toast({ title: "Success", description: t('messages.avatarUpdated'), variant: "success" });
        } catch (error) {
            console.error("Error updating avatar: ", error);
            toast({ title: "Error", description: t('messages.failedToUpdateAvatar'), variant: "destructive" });
        }
    };

    const handleProfileUpdate = async () => {
        if (!user || !user.id) return;
        const userDocRef = doc(db, "users", user.id);
        try {
            await updateDoc(userDocRef, { name });
            if(auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: name });
            }
            await refreshAuthUser();
            toast({ title: "Success", description: t('messages.profileUpdated'), variant: "success" });
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({ title: "Error", description: t('messages.failedToUpdateProfile'), variant: "destructive" });
        }
    };

    const handleEmailUpdate = async () => {
        if (!user || !user.id) return;
        const currentPassword = prompt(t('messages.enterPassword'));
        if (!currentPassword || !auth.currentUser) return;

        const credential = EmailAuthProvider.credential(auth.currentUser.email || "", currentPassword);
        
        try {
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updateEmail(auth.currentUser, email);

            const userDocRef = doc(db, "users", user.id);
            await updateDoc(userDocRef, { email });
            
            await refreshAuthUser();

            toast({ title: "Success", description: t('messages.emailUpdated'), variant: "success" });
        } catch (error) {
            console.error("Error updating email: ", error);
            toast({ title: "Error", description: t('messages.failedToUpdateEmail'), variant: "destructive" });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center md:text-left">{t('profile.myProfile')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="items-center">
                            <Avatar className="w-24 h-24 mb-4">
                                <AvatarImage src={avatar || "/placeholder-user.jpg"} />
                                <AvatarFallback><User className="w-12 h-12" /></AvatarFallback>
                            </Avatar>
                            <CardTitle>{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                             <div className="flex items-center gap-2 mt-2">
                                <Badge>{user.role}</Badge>
                                {user.role === 'seller' && <Badge variant={user.status === 'approved' ? 'default' : 'secondary'}>{user.status}</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center text-center">
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
                                    <div className="w-full">
                                        <Button asChild className="w-full">
                                            <span>{t('product.uploadPicture')}</span>
                                        </Button>
                                    </div>
                                </CldUploadButton>
                            ) : (
                                <Button disabled className="w-full">
                                    <span>{isCloudinaryLoading ? t('messages.uploadLoading') : t('messages.uploadDisabled')}</span>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('profile.accountSettings')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('admin.name')}</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                           <div className="flex justify-end">
                              <Button onClick={handleProfileUpdate}>{t('common.save')}</Button>
                           </div>
                            <div className="space-y-2 mt-4">
                                <Label htmlFor="email">{t('admin.email')}</Label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    <Button variant="outline" onClick={handleEmailUpdate} className="w-full sm:w-auto"><Edit3 className="mr-2 h-4 w-4" />{t('common.updateEmail')}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {user.role === 'customer' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('messages.orderHistory')}</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="py-2 px-4">{t('order.id')}</th>
                                            <th className="py-2 px-4">{t('order.date')}</th>
                                            <th className="py-2 px-4">{t('order.total')}</th>
                                            <th className="py-2 px-4">{t('order.status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id} className="border-t">
                                                <td className="py-2 px-4">{order.id}</td>
                                                <td className="py-2 px-4">{order.date}</td>
                                                <td className="py-2 px-4">{order.total}</td>
                                                <td className="py-2 px-4"><Badge>{order.status}</Badge></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
