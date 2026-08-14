"use client";

import { useEffect, useState } from "react";

import { getHealth } from "@/lib/api/health";

type ConnectionStatus = "checking" | "connected" | "unavailable";

export function ApiHealthStatus() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("checking");

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then(() => {
        if (isMounted) {
          setConnectionStatus("connected");
        }
      })
      .catch(() => {
        if (isMounted) {
          setConnectionStatus("unavailable");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const label =
    connectionStatus === "connected"
      ? "API connected"
      : connectionStatus === "unavailable"
        ? "API unavailable"
        : "Checking API connection";

  return (
    <p
      className="text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {label}
    </p>
  );
}
