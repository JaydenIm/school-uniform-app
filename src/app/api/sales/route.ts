import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const sales = await prisma.sales.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
      res.status(200).json(sales)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sales data' })
    }
  }
} 