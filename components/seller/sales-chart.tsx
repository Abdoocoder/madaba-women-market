'use client'

import { useState, useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/lib/locale-context'
import { useAuth } from '@/lib/auth-context' // Import the auth hook
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Helper to create authorization headers
const createAuthHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`,
});

// Define the structure of the data we expect from the API
interface SalesData {
  name: string;
  total: number;
}

export function SalesChart() {
  const { t, language } = useLocale()
  const { token } = useAuth() // Get the token
  const [monthlyData, setMonthlyData] = useState<SalesData[]>([])
  const [dailyData, setDailyData] = useState<SalesData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setIsLoading(false);
        setError('Authentication token not found.');
        return;
      }

      try {
        setIsLoading(true)
        const response = await fetch('/api/stats', {
            headers: createAuthHeaders(token),
        })
        if (!response.ok) {
          throw new Error('Failed to fetch sales statistics')
        }
        const data = await response.json()
        setMonthlyData(data.monthlySales || [])
        setDailyData(data.dailySales || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [token]) // Re-run if the token changes

  const renderChart = (data: SalesData[], yAxisLabel: string) => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${yAxisLabel}${value}`}
          reversed={language === 'ar'}
        />
        <Tooltip
          cursor={false}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            borderColor: "hsl(var(--border))",
            color: "hsl(var(--popover-foreground))",
          }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('seller.salesOverTime') || 'Sales Over Time'}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>{t('messages.loading') || 'Loading chart data...'}</p>
        ) : error ? (
          <p className="text-destructive">{t('messages.error')}: {error}</p>
        ) : (
          <Tabs defaultValue="monthly" className="space-y-4">
            <TabsList>
              <TabsTrigger value="monthly">{t('seller.monthly') || 'Monthly'}</TabsTrigger>
              <TabsTrigger value="daily">{t('seller.daily') || 'Daily (Current Month)'}</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly">
              {renderChart(monthlyData, ' د.أ')}
            </TabsContent>
            <TabsContent value="daily">
              {renderChart(dailyData, ' د.أ')}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
