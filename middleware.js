// Middleware Next.js désactivé
// Le mode maintenance est géré par le HOC withMaintenanceCheck dans les pages
// et par l'API /api/maintenance-status

// Pour réactiver le middleware Next.js (non recommandé) :
// import { NextResponse } from 'next/server'
// import { maintenanceMiddleware } from './src/lib/maintenanceMiddleware'
// 
// export async function middleware(request) {
//   const maintenanceResponse = await maintenanceMiddleware(request)
//   if (maintenanceResponse) {
//     return maintenanceResponse
//   }
//   return NextResponse.next()
// }
// 
// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
// } 