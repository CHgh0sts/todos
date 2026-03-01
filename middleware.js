import { NextResponse } from 'next/server'
import { maintenanceMiddleware } from '@/lib/maintenanceMiddleware'

export async function middleware(request) {
  const maintenanceResponse = await maintenanceMiddleware(request)

  if (maintenanceResponse) {
    return maintenanceResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 