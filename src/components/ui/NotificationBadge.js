export default function NotificationBadge({ count, className = '' }) {
  if (!count || count === 0) return null

  const displayCount = count > 9 ? '9+' : count.toString()

  return (
    <span className={`
      absolute -top-2 -right-2 
      min-w-[20px] h-[20px] 
      bg-red-500 text-white 
      text-xs font-bold 
      rounded-full 
      flex items-center justify-center 
      animate-pulse
      shadow-lg
      border-2 border-white dark:border-gray-800
      z-10
      ${className}
    `}>
      {displayCount}
    </span>
  )
} 