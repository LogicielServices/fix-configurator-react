import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getApiUrl } from "../utils/helper";
import { fixSessionHistory } from "../Services/FixSessionHistory";

export default function useFixSessionStatusFeed(maxItems = 200) {
  const connectionRef = useRef(null);
  const isConnectedRef = useRef(false);
  const [updates, setUpdates] = useState([]);

  // ---- Initial History Fetch ---- //
  useEffect(() => {
    (async () => {
      try {
        const response = await fixSessionHistory();
        if (response?.length) {
          setUpdates(response);
        }
      } catch (err) {
        console.error("Initial history fetch failed:", err);
      }
    })();
  }, []);

  // ---- Start SignalR ---- //
  const startConnection = async () => {
    try {
      await connectionRef.current.start();
      isConnectedRef.current = true;

      console.log(
        "SignalR Connected:",
        connectionRef.current.connectionId
      );
    } catch (err) {
      console.error("SignalR connection failed. Retrying...", err);

      setTimeout(startConnection, 3000);
    }
  };

  // ---- Initialize Connection ---- //
  useEffect(() => {
    if (connectionRef.current) return;

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(`${getApiUrl()}/clientUpdates`, {
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: () => 3000,
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = hub;

    // ---- Incoming SignalR Message ---- //
    hub.on("UpdateFixSessionStatusMessage", (message) => {
        console.log("Received UpdateFixSessionStatusMessage:", message);
      setUpdates((prev) => {
        const newList = [...prev, message];
        // optional limit to prevent unbounded memory growth
        return newList.slice(-maxItems);
      });
    });

    startConnection();
  }, []);

  // ---- Cleanup on Unmount ---- //
  useEffect(() => {
    return () => {
      try {
        if (connectionRef.current) {
          connectionRef.current.off("UpdateFixSessionStatusMessage");
          connectionRef.current.stop();
        }
      } catch (_) {}
    };
  }, []);

  return updates;
}