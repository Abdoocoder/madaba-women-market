"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { Order, CartItem, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";
import { useToast } from "@/components/ui/use-toast";

export function OrdersTab() {
  const { user } = useAuth();
  const { t } = useLocale();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*, products(*))")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const ordersData: Order[] = data.map((order: any) => ({
          id: order.id,
          customerId: order.customer_id,
          customerName: order.customer_name,
          sellerId: order.seller_id,
          sellerName: order.seller_name,
          total: order.total_price,
          status: order.status,
          shippingAddress: order.shipping_address,
          customerPhone: order.customer_phone,
          createdAt: new Date(order.created_at),
          items: order.order_items.map((item: any) => ({
            product: {
              id: item.products.id,
              name: item.products.name,
              nameAr: item.products.name_ar,
              price: item.products.price,
              image: item.products.image_url,
              // ... other fields if needed
            } as Product,
            quantity: item.quantity
          }))
        }));

        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: t('messages.error'),
          description: t('messages.failedToFetchOrders'),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, t, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">{t('orders.statuses.pending')}</Badge>;
      case "processing":
        return <Badge variant="default">{t('orders.statuses.processing')}</Badge>;
      case "shipped":
        return <Badge variant="default">{t('orders.statuses.shipped')}</Badge>;
      case "delivered":
        return <Badge variant="default" className="bg-green-500 text-white">{t('orders.statuses.delivered')}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{t('orders.statuses.cancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  // ... rest of the file ...

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const closeOrderDetails = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('buyer.orders')}</CardTitle>
          <CardDescription>{t('buyer.ordersDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('order.noOrders')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">#{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="font-medium">{formatCurrency(order.total)}</div>
                      {getStatusBadge(order.status)}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openOrderDetails(order)}
                    >
                      {t('common.viewDetails')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {isDialogOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{t('order.details')}</h3>
                <button
                  onClick={closeOrderDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">#{selectedOrder.id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">{t('order.items')}</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.nameAr || item.product.name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.product.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(item.product.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>{t('order.total')}</span>
                  <span className="font-medium">{formatCurrency(selectedOrder.total)}</span>
                </div>

                <div className="flex justify-end">
                  <Button onClick={closeOrderDetails}>{t('common.close')}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
