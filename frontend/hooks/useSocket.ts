"use client";

import { useRef } from "react";
import { io, Socket } from "socket.io-client";

let socketSingleton: Socket | null = null;

const getSocketSingleton = (): Socket => {
  if (!socketSingleton) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:5000";

    socketSingleton = io(socketUrl, {
      autoConnect: true,
    });
  }

  return socketSingleton;
};

export const useSocket = (): Socket => {
  const socketRef = useRef<Socket | null>(null);

  if (!socketRef.current) {
    socketRef.current = getSocketSingleton();
  }

  return socketRef.current;
};
