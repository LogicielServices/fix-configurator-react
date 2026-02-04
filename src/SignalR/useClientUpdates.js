import React, { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { getApiUrl } from '../utils/helper';

export default function useClientUpdates(defaultEngineID, sessions) {
  const connectionRef = useRef(null);
  const dataGridRef = useRef(null);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    setUpdates(sessions)
  }, [sessions])

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
    if (connectionRef?.current) return;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${getApiUrl()}/clientUpdates`, {
        withCredentials: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connectionRef?.current?.on('UpdateFixSession', (sessionObj, engineID, commandType) => {
      console.log(sessionObj, engineID, commandType, dataGridRef);
      if (commandType === 'update' && engineID === defaultEngineID) {
        const index = sessions?.findIndex?.(x => x?.connectionID === sessionObj?.connectionID);
        if (index >= 0) {
          sessions[index] = sessionObj;
          const inst = dataGridRef?.current?.instance;
          inst?.refresh?.();
        }
      }
    });
    start();
  }, [sessions]);

  useEffect(() => {
    return () => {
      connectionRef?.current?.off?.('UpdateFixSession');
      connectionRef?.current?.stop?.()?.catch?.(() => {});
    };
  }, [])

  return { updates, dataGridRef }
}
