import React, { useState } from "react";
import { Heart, MessageCircle, UserPlus, Share2, Trash2, Check } from "lucide-react";
import { assets, dummyUserData } from "../assets/assets";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "like",
      user: {
        name: "Richard Hendricks",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
        username: "richard_hendricks",
      },
      action: "liked your post",
      time: "2 minutes ago",
      read: false,
      postPreview: "Just launched our new feature!",
    },
    {
      id: 2,
      type: "comment",
      user: {
        name: "Alexa James",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
        username: "alexa_james",
      },
      action: "commented on your post",
      time: "15 minutes ago",
      read: false,
      comment: "This is amazing! Great work 🎉",
    },
    {
      id: 3,
      type: "follow",
      user: {
        name: "Sarah Wilson",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
        username: "sarah_wilson",
      },
      action: "started following you",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 4,
      type: "like",
      user: {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
        username: "john_doe",
      },
      action: "liked your comment",
      time: "3 hours ago",
      read: true,
      postPreview: "Amazing insights!",
    },
    {
      id: 5,
      type: "follow",
      user: {
        name: "Emma Brown",
        avatar: "https://images.unsplash.com/photo-1517440467341-bac88d1eb89e?q=80&w=200",
        username: "emma_brown",
      },
      action: "started following you",
      time: "1 day ago",
      read: true,
    },
    {
      id: 6,
      type: "comment",
      user: {
        name: "Mike Johnson",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
        username: "mike_johnson",
      },
      action: "replied to your comment",
      time: "2 days ago",
      read: true,
      comment: "Totally agree with your perspective!",
    },
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-indigo-500" />;
      case "share":
        return <Share2 className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAsUnread = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: false } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-4 transition ${
                  !notification.read ? "border-l-4 border-indigo-600" : ""
                } hover:shadow-md`}
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={notification.user.avatar}
                      alt={notification.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {notification.user.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notification.action}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {notification.time}
                      </span>
                    </div>

                    {/* Preview */}
                    {notification.postPreview && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        "{notification.postPreview}"
                      </p>
                    )}
                    {notification.comment && (
                      <p className="text-sm text-gray-500 mt-1 bg-gray-50 p-2 rounded line-clamp-2">
                        "{notification.comment}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded transition"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark read
                        </button>
                      )}
                      {notification.read && (
                        <button
                          onClick={() => markAsUnread(notification.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded transition"
                          title="Mark as unread"
                        >
                          <Check className="w-3.5 h-3.5 opacity-50" />
                          Unread
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition ml-auto"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-500">
              You have no notifications at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
