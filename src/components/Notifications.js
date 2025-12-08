"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isBellActive, setIsBellActive] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const [swipeX, setSwipeX] = useState({});
  const startXRef = useRef({});
  const isDraggingRef = useRef({});
  const router = useRouter();

  // Fetch notifications for a given user
  const fetchNotifications = async (user) => {
    try {
      if (!user) return;
      const idToken = await user.getIdToken();
      const uid = user.uid;

      const res = await fetch(
        `/api/notifications?userId=${uid}&limit=10&unreadFirst=true`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data.notifications) ? data.notifications : [];

      setNotifications(list);
      setUnreadCount(
        typeof data.unreadCount === "number"
          ? data.unreadCount
          : list.filter((n) => !n.isRead).length
      );
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  // Auth listener – load notifications when user logs in
  useEffect(() => {
    setIsClient(true);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchNotifications(user);
      } else {
        setCurrentUser(null);
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // Optional polling


  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSwipeX((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleTouchStart = (id, e) => {
    const touch = e.touches[0];
    startXRef.current[id] = touch.clientX;
    isDraggingRef.current[id] = true;
  };

  const handleTouchMove = (id, e) => {
    if (!isDraggingRef.current[id]) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startXRef.current[id];
    if (deltaX < 0) {
      setSwipeX((prev) => ({ ...prev, [id]: deltaX }));
    }
  };

  const handleTouchEnd = (id) => {
    if (!isDraggingRef.current[id]) return;
    isDraggingRef.current[id] = false;
    const deltaX = swipeX[id] || 0;
    const threshold = -80;
    if (deltaX <= threshold) {
      clearNotification(id);
    } else {
      setSwipeX((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  const handleOpenNotification = async (notif) => {
    // optimistic UI
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    // persist isRead = true
    try {
      await fetch(`/api/notifications?id=${notif.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }

    // navigate if URL exists (stored in data.url)
    if (notif?.url) {
      router.push(notif.url);
    }
  };

  if (!isClient) return <Bell className="h-6 w-6 text-gray-400" />;

  return (
    <>
      {/* Bell button */}
      <button
        onClick={() => {
          setIsOpen((v) => !v);
          setIsBellActive(true);
          setTimeout(() => setIsBellActive(false), 180);
        }}
        className={`relative p-2 rounded-full focus:outline-none ${
          isOpen ? "bg-emerald-50" : "hover:bg-gray-100"
        }`}
        aria-label="Notifications"
      >
        <span
          className={`inline-flex transition-transform duration-150 ${
            isBellActive ? "rotate-12 scale-110" : "rotate-0 scale-100"
          }`}
        >
          <Bell
            className={`h-6 w-6 ${
              isOpen ? "text-emerald-600 fill-emerald-100" : "text-gray-700"
            }`}
          />
        </span>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 flex items-start justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="
              mt-20
              w-full
              max-w-2xl
              mx-3 sm:mx-auto
              bg-white/95
              rounded-2xl
              shadow-xl
              ring-1 ring-black/5
              overflow-hidden
              animate-fade-in
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Notification Centre
                  </p>
                  <p className="text-xs text-gray-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "All caught up"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Mark all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/70 border border-transparent hover:border-gray-200"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100 overflow-y-auto max-h-[60vh]">
              {notifications.map((notif) => {
                const translateX = swipeX[notif.id] || 0;
                const clampedX = Math.max(translateX, -120);

                const safeDate = notif.createdAt
                  ? new Date(notif.createdAt)
                  : null;
                const dateText =
                  safeDate && !isNaN(safeDate.getTime())
                    ? `${safeDate.toLocaleDateString()} ${safeDate.toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}`
                    : "—";

                return (
                  <div
                    key={notif.id}
                    className="relative touch-pan-y select-none bg-gray-50"
                  >
                    {/* Clear background */}
                    <div className="absolute inset-0 flex justify-end items-center pr-4 bg-red-50">
                      <button
                        onClick={() => clearNotification(notif.id)}
                        className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold shadow-sm"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Foreground row */}
                    <button
                      onClick={() => handleOpenNotification(notif)}
                      onTouchStart={(e) => handleTouchStart(notif.id, e)}
                      onTouchMove={(e) => handleTouchMove(notif.id, e)}
                      onTouchEnd={() => handleTouchEnd(notif.id)}
                      className={`
                        relative w-full text-left px-4 py-3 flex gap-3 bg-white
                        ${!notif.isRead ? "bg-emerald-50/70" : ""}
                        hover:bg-gray-50 transition-colors
                      `}
                      style={{
                        transform: `translateX(${clampedX}px)`,
                        transition:
                          isDraggingRef.current[notif.id] === true
                            ? "none"
                            : "transform 0.18s ease-out",
                      }}
                    >
                      <div className="mt-1">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            notif.isRead ? "bg-gray-300" : "bg-emerald-600"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="mt-0.5 text-sm font-semibold text-gray-900 line-clamp-1">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-gray-400 whitespace-nowrap">
                            {dateText}
                          </p>
                        </div>

                        <p
                          className="mt-0.5 text-xs text-gray-600 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: notif.body }}
                        />
                      </div>
                    </button>
                  </div>
                );
              })}

              {notifications.length === 0 && (
                <div className="px-6 py-14 text-center text-gray-500 text-sm">
                  <p className="font-medium text-gray-700 mb-1">
                    You have no notifications
                  </p>
                  <p className="text-xs text-gray-400">
                    Updates about your orders and messages will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
