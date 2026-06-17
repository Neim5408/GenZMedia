import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext({
  chatSocket: null,
  notifSocket: null,
  reconnect: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [chatSocket, setChatSocket] = useState(null);
  const [notifSocket, setNotifSocket] = useState(null);

  const connectSockets = useCallback(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user || !user.id) {
      setChatSocket(prev => {
        if (prev) prev.disconnect();
        return null;
      });
      setNotifSocket(prev => {
        if (prev) prev.disconnect();
        return null;
      });
      return;
    }

    // Connect to Chat Service Socket
    const chatUrl = import.meta.env.VITE_CHAT_SERVICE_URL || "http://localhost:50057";
    const cSocket = io(chatUrl, {
      autoConnect: true,
      transports: ["websocket"],
      query: { service: "chat" }
    });

    cSocket.on("connect", () => {
      console.log("Connected to Chat Service WebSocket:", cSocket.id);
      cSocket.emit("joinChat", user.id);
    });

    // Connect to Notification Service Socket
    const notifUrl = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || "http://localhost:50056";
    const nSocket = io(notifUrl, {
      autoConnect: true,
      transports: ["websocket"],
      query: { service: "notification" }
    });

    nSocket.on("connect", () => {
      console.log("Connected to Notification Service WebSocket:", nSocket.id);
      nSocket.emit("joinNotificationRoom", user.id);
    });

    setChatSocket(cSocket);
    setNotifSocket(nSocket);
  }, []);

  const disconnectSockets = useCallback(() => {
    setChatSocket(prev => {
      if (prev) prev.disconnect();
      return null;
    });
    setNotifSocket(prev => {
      if (prev) prev.disconnect();
      return null;
    });
  }, []);

  const reconnect = useCallback(() => {
    disconnectSockets();
    connectSockets();
  }, [disconnectSockets, connectSockets]);

  useEffect(() => {
    connectSockets();
    return () => {
      disconnectSockets();
    };
  }, [connectSockets, disconnectSockets]);

  // Listen to auth changes (storage events for cross-tab or custom triggers)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user") {
        reconnect();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-state-change", reconnect);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-state-change", reconnect);
    };
  }, [reconnect]);

  return (
    <SocketContext.Provider value={{ chatSocket, notifSocket, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
