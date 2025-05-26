'use client'

import { Toaster } from 'react-hot-toast'
import { useTheme } from '@/contexts/ThemeContext'

export default function CustomToaster() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster 
      position="top-right"
      containerStyle={{
        top: 70, // Décalage adapté pour la navbar dynamique
      }}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '8px',
          border: resolvedTheme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
          background: resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF',
          color: resolvedTheme === 'dark' ? '#F9FAFB' : '#111827',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: resolvedTheme === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF',
          },
        },
        loading: {
          iconTheme: {
            primary: '#6B7280',
            secondary: resolvedTheme === 'dark' ? '#1F2937' : '#FFFFFF',
          },
        },
      }}
    />
  )
} 