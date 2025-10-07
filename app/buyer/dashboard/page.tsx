"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./profile-tab";
import { OrdersTab } from "./orders-tab";
import { WishlistTab } from "./wishlist-tab";
import { AddressesTab } from "./addresses-tab";
import { SettingsTab } from "./settings-tab";
import { useLocale } from "@/lib/locale-context";

export default function BuyerDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "customer")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex items-center justify-center">
          <div className="text-center">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "customer") {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-2">{t('dashboard.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">{t('dashboard.profile')}</TabsTrigger>
          <TabsTrigger value="orders">{t('dashboard.orders')}</TabsTrigger>
          <TabsTrigger value="wishlist">{t('dashboard.wishlist')}</TabsTrigger>
          <TabsTrigger value="addresses">{t('dashboard.addresses')}</TabsTrigger>
          <TabsTrigger value="settings">{t('dashboard.settings')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        
        <TabsContent value="wishlist">
          <WishlistTab />
        </TabsContent>
        
        <TabsContent value="addresses">
          <AddressesTab />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}