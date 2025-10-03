"use client"
import { Check, X, Mail, ShieldAlert, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Seller } from "@/lib/types"
import { formatDate, formatCurrency } from "@/lib/utils"

interface SellerManagementProps {
  sellers: Seller[]
  onApprove: (sellerId: string) => void
  onReject: (sellerId: string) => void
  onSuspend: (sellerId: string) => void
  onDelete: (sellerId: string) => void
}

export function SellerManagement({ sellers, onApprove, onReject, onSuspend, onDelete }: SellerManagementProps) {
  const pendingSellers = sellers.filter((s) => !s.approved)
  const approvedSellers = sellers.filter((s) => s.approved)

  return (
    <div className="space-y-6">
      {pendingSellers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">البائعون قيد المراجعة ({pendingSellers.length})</h3>
          <div className="space-y-4">
            {pendingSellers.map((seller) => (
              <Card key={seller.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{seller.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        <span>{seller.email}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">تاريخ التسجيل: {formatDate(seller.joinedAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => onApprove(seller.id)}>
                        <Check className="ml-1 h-4 w-4" />
                        قبول
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onReject(seller.id)}>
                        <X className="ml-1 h-4 w-4" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">البائعون المعتمدون ({approvedSellers.length})</h3>
        <div className="space-y-4">
          {approvedSellers.map((seller) => (
            <Card key={seller.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{seller.name}</h4>
                      {seller.suspended ? (
                        <Badge variant="destructive">معلق</Badge>
                      ) : (
                        <Badge>معتمد</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3 w-3" />
                      <span>{seller.email}</span>
                    </div>
                    <div className="flex gap-4 text-sm mt-2">
                      <span className="text-muted-foreground">المنتجات: {seller.totalProducts}</span>
                      <span className="text-muted-foreground">المبيعات: {formatCurrency(seller.totalSales)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onSuspend(seller.id)}>
                      <ShieldAlert className="ml-1 h-4 w-4" />
                      {seller.suspended ? "رفع التعليق" : "تعليق"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(seller.id)}>
                      <Trash2 className="ml-1 h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
