import { PrismaClient, Prisma } from '@prisma/client'
import { logger } from './logger'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
})

// 쿼리 로깅
prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
  try {
    const paramsArray = e.params.slice(1, -1).split(',').map((param: string) => param.trim())
    let queryIndex = 0
    
    const query = e.query.replace(/\?/g, () => {
      const param = paramsArray[queryIndex]
      queryIndex++
      
      if (param === undefined) return '?'
      if (param === 'null') return 'NULL'
      return isNaN(param as any) ? `'${param}'` : param
    })
    
    const formattedQuery = query
      .replace(/LIMIT \?/g, () => `LIMIT ${paramsArray[queryIndex - 1]}`)
      .replace(/OFFSET \?/g, () => `OFFSET ${paramsArray[queryIndex - 1]}`)
    
    logger.info({
      query: `\n${formattedQuery}`,
      duration: `${e.duration}ms`,
      timestamp: new Date().toISOString()
    }, 'Database Query')
  } catch (error) {
    logger.error({
      query: `\n${e.query}`,
      params: e.params,
      error: error,
      timestamp: new Date().toISOString()
    }, 'Database Query Error')
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 