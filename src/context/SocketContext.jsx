import React, { createContext, useEffect, useState, useContext } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    // Connect if we have either a token or we are authenticated (have a user/id)
    const userId = localStorage.getItem('id');
    if (!isAuthenticated && !userId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    // Using the same base URL as axios (hardcoded for now based on axios.js)
    const socketUrl = "http://localhost:5051"; 
    
    const newSocket = io(socketUrl, {
      auth: {
        token: token || userId, // Fallback to userId if token is not available
      },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
