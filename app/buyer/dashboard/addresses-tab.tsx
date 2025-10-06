"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useLocale } from "@/lib/locale-context";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export function AddressesTab() {
  const { user } = useAuth();
  const { t } = useLocale();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const addressesRef = doc(db, "addresses", user.id);
        const addressesSnap = await getDoc(addressesRef);

        if (addressesSnap.exists()) {
          const addressesData = addressesSnap.data().addresses || [];
          setAddresses(addressesData);
        } else {
          setAddresses([]);
        }
      } catch (error) {
        console.error("Error fetching addresses: ", error);
        toast({ 
          title: t('messages.error'), 
          description: t('messages.failedToFetchAddresses'), 
          variant: "destructive" 
        });
        setAddresses([]); // Set empty array even on error
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAddresses();
    }
  }, [user, t, toast]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const newAddress: Address = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        isDefault: addresses.length === 0, // First address is default
      };

      const updatedAddresses = [...addresses, newAddress];
      const addressesRef = doc(db, "addresses", user.id);
      await setDoc(addressesRef, { addresses: updatedAddresses });

      setAddresses(updatedAddresses);
      setIsAdding(false);
      setFormData({
        name: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
      });

      toast({ 
        title: t('messages.success'), 
        description: t('messages.addressAdded'), 
        variant: "success" 
      });
    } catch (error) {
      console.error("Error saving address: ", error);
      toast({ 
        title: t('messages.error'), 
        description: t('messages.failedToAddAddress'), 
        variant: "destructive" 
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));

      const addressesRef = doc(db, "addresses", user.id);
      await setDoc(addressesRef, { addresses: updatedAddresses });

      setAddresses(updatedAddresses);
      toast({ 
        title: t('messages.success'), 
        description: t('messages.defaultAddressUpdated'), 
        variant: "success" 
      });
    } catch (error) {
      console.error("Error setting default address: ", error);
      toast({ 
        title: t('messages.error'), 
        description: t('messages.failedToUpdateDefaultAddress'), 
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('common.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.addresses')}</CardTitle>
        <CardDescription>{t('dashboard.addressesDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{address.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{address.phone}</div>
                      <div className="text-sm mt-2">
                        {address.address}, {address.city}, {address.postalCode}
                      </div>
                      {address.isDefault && (
                        <Badge className="mt-2">{t('address.default')}</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          {t('address.setDefault')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('address.noAddresses')}</p>
            </div>
          )}

          {isAdding ? (
            <form onSubmit={handleSaveAddress} className="space-y-4 border rounded-lg p-4">
              <h3 className="font-medium">{t('address.addNew')}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">{t('address.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t('address.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">{t('address.address')}</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('address.city')}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t('address.postalCode')}</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">{t('common.save')}</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setIsAdding(true)}>
              {t('address.addNewAddress')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}