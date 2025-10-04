
"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth } from "@/lib/firebase";
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { User, Upload, Edit3 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Mock order data (can be replaced with actual data fetching)
const orders = [
    { id: "ORD001", date: "2023-10-28", total: "150.00 ر.س", status: "تم التوصيل" },
    { id: "ORD002", date: "2023-11-15", total: "250.00 ر.س", status: "قيد الشحن" },
    { id: "ORD003", date: "2023-11-20", total: "95.50 ر.س", status: "تم التأكيد" },
];

export default function ProfileForm() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;

        setIsUploading(true);
        const storage = getStorage();
        const storageRef = ref(storage, `avatars/${user.id}/${avatarFile.name}`);

        try {
            await uploadBytes(storageRef, avatarFile);
            const photoURL = await getDownloadURL(storageRef);

            const userDocRef = doc(db, "users", user.id);
            await updateDoc(userDocRef, { photoURL });
            
            if(auth.currentUser) {
                await updateProfile(auth.currentUser, { photoURL });
            }

            toast({ title: "Success", description: "Avatar updated successfully!", variant: "success" });
        } catch (error) {
            console.error("Error uploading avatar: ", error);
            toast({ title: "Error", description: "Failed to upload avatar.", variant: "destructive" });
        } finally {
            setIsUploading(false);
            setAvatarFile(null);
        }
    };

    const handleProfileUpdate = async () => {
        const userDocRef = doc(db, "users", user.id);
        try {
            await updateDoc(userDocRef, { name });
            if(auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: name });
            }
            toast({ title: "Success", description: "Profile updated successfully!", variant: "success" });
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
        }
    };

    const handleEmailUpdate = async () => {
        const currentPassword = prompt("Please enter your current password to update your email.");
        if (!currentPassword || !auth.currentUser) return;

        const credential = EmailAuthProvider.credential(auth.currentUser.email || "", currentPassword);
        
        try {
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updateEmail(auth.currentUser, email);

            const userDocRef = doc(db, "users", user.id);
            await updateDoc(userDocRef, { email });

            toast({ title: "Success", description: "Email updated successfully!", variant: "success" });
        } catch (error) {
            console.error("Error updating email: ", error);
            toast({ title: "Error", description: "Failed to update email. Please check your password.", variant: "destructive" });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center md:text-left">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="items-center">
                            <Avatar className="w-24 h-24 mb-4">
                                <AvatarImage src={user.photoURL || "/placeholder-user.jpg"} />
                                <AvatarFallback><User className="w-12 h-12" /></AvatarFallback>
                            </Avatar>
                            <CardTitle>{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                             <div className="flex items-center gap-2 mt-2">
                                <Badge>{user.role}</Badge>
                                {user.role === 'seller' && <Badge variant={user.status === 'approved' ? 'success' : 'secondary'}>{user.status}</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center text-center">
                            <Input id="avatar-upload" type="file" onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)} className="mb-2" />
                            <Button onClick={handleAvatarUpload} disabled={isUploading || !avatarFile} className="w-full">
                                {isUploading ? "Uploading..." : <><Upload className="mr-2 h-4 w-4" /> Upload Picture</>}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                           <div className="flex justify-end">
                              <Button onClick={handleProfileUpdate}>Save Name</Button>
                           </div>
                            <div className="space-y-2 mt-4">
                                <Label htmlFor="email">Email</Label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    <Button variant="outline" onClick={handleEmailUpdate} className="w-full sm:w-auto"><Edit3 className="mr-2 h-4 w-4" />Update Email</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {user.role === 'customer' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Order History</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="py-2 px-4">Order ID</th>
                                            <th className="py-2 px-4">Date</th>
                                            <th className="py-2 px-4">Total</th>
                                            <th className="py-2 px-4">Status</th>
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
