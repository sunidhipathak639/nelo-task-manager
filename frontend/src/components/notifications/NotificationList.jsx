import { Bell, CheckCircle2, AlertCircle, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'

const NotificationList = ({ notifications, onMarkAsRead, onClearAll, onClose }) => {
  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_created':
        return <CheckCircle2 className="h-4 w-4 text-clickup-green" />
      case 'task_due':
        return <AlertCircle className="h-4 w-4 text-clickup-red" />
      case 'task_completed':
        return <CheckCircle2 className="h-4 w-4 text-clickup-blue" />
      default:
        return <Bell className="h-4 w-4 text-gray-400" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_created':
        return 'bg-green-50 border-green-200'
      case 'task_due':
        return 'bg-red-50 border-red-200'
      case 'task_completed':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
      return format(date, 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  return (
    <div className="flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-clickup-purple/5 to-clickup-blue/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-clickup-purple" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-clickup-red text-white text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-gray-600 hover:text-clickup-red"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 font-medium">No notifications</p>
            <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? getNotificationColor(notification.type) : 'bg-white'
                }`}
                onClick={() => {
                  if (!notification.read) {
                    onMarkAsRead(notification.id)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${
                    !notification.read ? 'bg-white' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-[10px] bg-clickup-blue/10 text-clickup-blue border-clickup-blue/20">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-clickup-purple hover:bg-clickup-purple/10"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  )
}

export default NotificationList

