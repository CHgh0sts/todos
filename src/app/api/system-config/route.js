import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getOptimizedSystemSettings } from '@/lib/dbOptimization'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    console.log('🔍 [System Config API] Récupération des paramètres système publics')
    
    // Utiliser la fonction optimisée avec cache
    const settings = await getOptimizedSystemSettings()
    
    // Retourner seulement les paramètres publics (pas les paramètres sensibles)
    const publicSettings = {
      maxProjectsPerUser: settings.maxProjectsPerUser || 10,
      maxTodosPerProject: settings.maxTodosPerProject || 100,
      registrationEnabled: settings.registrationEnabled !== false,
      emailVerificationRequired: settings.emailVerificationRequired !== false
    }
    
    console.log('✅ [System Config API] Paramètres publics récupérés:', Object.keys(publicSettings))
    
    return NextResponse.json({ 
      success: true, 
      config: publicSettings 
    })
  } catch (error) {
    console.error('❌ [System Config API] Erreur:', error)
    
    // Retourner des valeurs par défaut en cas d'erreur
    const defaultConfig = {
      maxProjectsPerUser: 10,
      maxTodosPerProject: 100,
      registrationEnabled: true,
      emailVerificationRequired: true
    }
    
    return NextResponse.json({ 
      success: true, 
      config: defaultConfig 
    })
  } finally {
    await prisma.$disconnect()
  }
} 