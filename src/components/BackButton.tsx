'use client'

interface BackButtonProps {
  onClick: () => void
  className?: string
}

export default function BackButton({ onClick, className = "" }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn-game absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-4 sm:px-6 py-2 rounded-full text-sm font-bold text-gray-400 bg-gray-700 hover:bg-gray-600 transition-colors ${className}`}
    >
      Go Back ↩️
    </button>
  )
}
