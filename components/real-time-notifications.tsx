"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface RealTimeNotificationsProps {
  userId?: string
}

export function RealTimeNotifications({ userId }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    // Fetch initial notifications
    fetchNotifications()

    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [userId])

  const fetchNotifications = async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      const data = await response.json()

      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  if (!userId) return null

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications yet</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
