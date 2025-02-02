import { useEffect, useState } from 'react'

interface Sale {
  id: number
  amount: number
  customer: string
  email: string
}

export function RecentSales() {
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    fetch('/api/sales')
      .then(res => res.json())
      .then(data => setSales(data))
      .catch(error => console.error('Error fetching sales:', error))
  }, [])

  return (
    <div className="space-y-8">
      {sales.map(sale => (
        <div key={sale.id} className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customer}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium">
            +${sale.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  )
} 