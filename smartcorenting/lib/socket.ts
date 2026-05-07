import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!url) {
      console.error(
        "[socket] NEXT_PUBLIC_SOCKET_URL not set. Socket will attempt default host.",
      );
    } else {
      console.log("[socket] connecting to:", url);
    }

    socket = io(url || undefined, {
      transports: ["websocket"], // prefer websocket
      withCredentials: true,
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[socket] connected", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] connect_error", err);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[socket] disconnected", reason);
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log("[socket] reconnect_attempt", attempt);
    });

    socket.on("error", (err) => {
      console.error("[socket] error", err);
    });
  }

  return socket;
}
