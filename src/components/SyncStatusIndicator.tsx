'use client'

import { SyncStatus } from '@/utils/firebaseSync'

interface SyncStatusIndicatorProps {
  status: SyncStatus
  variant?: 'inline' | 'pill'
}

export default function SyncStatusIndicator({ status, variant = 'inline' }: SyncStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: '✓',
          text: 'Synced',
          color: 'text-green-400',
          bgColor: 'bg-green-500'
        }
      case 'syncing':
        return {
          icon: '⟳',
          text: 'Syncing',
          color: 'text-blue-400 animate-spin',
          bgColor: 'bg-blue-500'
        }
      case 'offline':
        return {
          icon: '○',
          text: 'Offline',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500'
        }
      case 'error':
        return {
          icon: '!',
          text: 'Error',
          color: 'text-red-400',
          bgColor: 'bg-red-500'
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  
  if (!config) return null

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${config.bgColor}`}>
        <span className={config.color.replace('text-', 'text-').replace('animate-spin', '')}>
          {config.icon}
        </span>
        <span>{config.text}</span>
      </div>
    )
  }

  // Inline variant (default)
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`text-lg ${config.color}`}>
        {config.icon}
      </span>
      <span className="text-gray-300">{config.text}</span>
    </div>
  )
}

