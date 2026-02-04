import React, { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { getApiUrl } from '../utils/helper';

export default function useFixMsgs(defaultEngineID, defaultSessionID) {
  const connectionRef = useRef(null);
  const fixMsgsRef = useRef(null);

  const start = async () => {
    try {
      await connectionRef?.current?.start();
      console.log('Connected:', connectionRef?.current?.connectionId);
    } catch (err) {
      console.error('SignalR start error:', err);
      setTimeout(start, 3000);
    }
  };

  useEffect(() => {
    if (connectionRef?.current || !defaultEngineID || !defaultSessionID) return;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${getApiUrl()}/clientUpdates`, {
        withCredentials: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connectionRef?.current?.on('InsertFixMessage', (fixMessage, engineID, sessionID) => {
      console.log("Insert Fix Message: ", defaultSessionID, engineID, sessionID, defaultEngineID, fixMsgsRef);
      if (engineID === defaultEngineID && sessionID === defaultSessionID) {
        fixMsgsRef?.current?.instance?.getDataSource?.()?.reload?.();
      }
    });
    start();

    return () => {
      connectionRef?.current?.off?.('InsertFixMessage');
      connectionRef?.current?.stop?.()?.catch?.(() => {});
    };
  }, [defaultEngineID, defaultSessionID])

  return { fixMsgsRef }
}
