import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "../api/auth/authSlice";
import { useRefreshMutation } from "../pages/authApi";

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const REFRESH_LOCK_KEY = "token_refresh_lock";
const REFRESH_LOCK_DURATION = 5000; // 5 seconds lock duration

/**
 * Hook that automatically refreshes the access token before it expires
 * Coordinates refresh across multiple tabs to prevent redundant calls
 * Access tokens expire after 15 minutes, this hook refreshes at 10 minutes
 */
export const useAutoRefreshToken = () => {
  const token = useSelector(selectCurrentToken);
  const [refresh] = useRefreshMutation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Initialize BroadcastChannel for cross-tab communication
    if (!channelRef.current) {
      channelRef.current = new BroadcastChannel("token_refresh_channel");
    }

    const channel = channelRef.current;

    // Listen for refresh events from other tabs
    const handleRefreshMessage = (event: MessageEvent) => {
      if (event.data === "token_refreshed") {
        console.log("Token refreshed by another tab, resetting timer");
        // Reset the timer since another tab just refreshed
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (token) {
          timeoutRef.current = setTimeout(() => {
            attemptRefresh();
          }, REFRESH_INTERVAL);
        }
      }
    };

    channel.addEventListener("message", handleRefreshMessage);

    // Attempt to acquire lock and refresh token
    const attemptRefresh = async () => {
      const now = Date.now();
      const lockData = localStorage.getItem(REFRESH_LOCK_KEY);

      // Check if another tab is currently refreshing
      if (lockData) {
        const lockTime = parseInt(lockData, 10);
        if (now - lockTime < REFRESH_LOCK_DURATION) {
          console.log("Another tab is refreshing, skipping");
          return;
        }
      }

      // Acquire lock
      localStorage.setItem(REFRESH_LOCK_KEY, now.toString());

      // Double-check lock after a small delay to handle race conditions
      await new Promise((resolve) => setTimeout(resolve, 50));
      const currentLock = localStorage.getItem(REFRESH_LOCK_KEY);

      if (currentLock !== now.toString()) {
        console.log("Lost lock race, another tab is refreshing");
        return;
      }

      // Perform refresh
      try {
        await refresh({}).unwrap();
        console.log("Token auto-refreshed successfully");

        // Notify other tabs
        channel.postMessage("token_refreshed");
      } catch (error) {
        console.error("Failed to auto-refresh token:", error);
      } finally {
        // Release lock
        const finalLock = localStorage.getItem(REFRESH_LOCK_KEY);
        if (finalLock === now.toString()) {
          localStorage.removeItem(REFRESH_LOCK_KEY);
        }
      }
    };

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set up auto-refresh if user is logged in (has a token)
    if (token) {
      // Set up the refresh timeout
      timeoutRef.current = setTimeout(() => {
        attemptRefresh();
      }, REFRESH_INTERVAL);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      channel.removeEventListener("message", handleRefreshMessage);
    };
  }, [token, refresh]);

  // Cleanup BroadcastChannel on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, []);
};
