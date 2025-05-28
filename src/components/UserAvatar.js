export default function UserAvatar({ user, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  }

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 ${className}`

  if (user.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={`Photo de profil de ${user.name}`}
        className={`${baseClasses} object-cover border-2 border-gray-200 dark:border-gray-600`}
      />
    )
  }

  return (
    <div className={`${baseClasses} bg-gradient-to-r from-blue-500 to-purple-600`}>
      <span className="text-white font-semibold">
        {user.name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
} 