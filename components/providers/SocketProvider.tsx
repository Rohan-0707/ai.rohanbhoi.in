"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

type SocketProviderProps = {
  children: ReactNode;
};

function resolveSocketUrl(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_SOCKET_URL || "";
  }

  const configured = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (!configured) {
    return window.location.origin;
  }

  try {
    const configuredOrigin = new URL(configured).origin;
    if (configuredOrigin === window.location.origin) {
      return window.location.origin;
    }
  } catch {
    return window.location.origin;
  }

  return configured;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const instanceRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketUrl = resolveSocketUrl();

    if (!socketUrl) {
      return;
    }

    const instance = io(socketUrl, {
      path: "/socket.io",
      transports: ["polling"],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
    });

    instanceRef.current = instance;

    instance.on("connect", () => {
      setIsConnected(true);
    });

    instance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(instance);

    return () => {
      instance.removeAllListeners();
      instance.disconnect();
      instanceRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  const value = useMemo(
    () => ({ socket, isConnected }),
    [socket, isConnected],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
