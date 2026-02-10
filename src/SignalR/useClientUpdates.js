import React, { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { getApiUrl } from '../utils/helper';
import { getSessionsConnectivityStatus } from '../Services/FixSessionService';

export default function useClientUpdates(defaultEngineID, sessions) {
  const connectionRef = useRef(null);
  const dataGridRef = useRef(null);
  const updates = useRef(null);

  const getAllSessions = async () => {
    const response = await getSessionsConnectivityStatus();
    updates.current = response || [];
    dataGridRef?.current?.instance?.refresh?.();
  }

  useEffect(() => {
    if (!defaultEngineID && !sessions) {
      getAllSessions()
      return;
    }
    updates.current = sessions;
    dataGridRef?.current?.instance?.refresh?.();
  }, [sessions])

  const start = async () => {
    try {
      await connectionRef?.current?.start();
      console.log('Connected Client Updates:', connectionRef?.current?.connectionId);
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
      if (!defaultEngineID && !sessions && (commandType === 'insert' || commandType === 'update')) {
        const index = updates?.current?.findIndex?.(x => x?.connectionID === sessionObj?.connectionID);
        if (index >= 0) {
          updates.current[index] = sessionObj;
        } else {
          updates?.current?.push(sessionObj);
        }
        dataGridRef?.current?.instance?.refresh?.();
      } else if (engineID === defaultEngineID && commandType === 'update') {
        const index = sessions?.findIndex?.(x => x?.connectionID === sessionObj?.connectionID);
        if (index >= 0) {
          sessions[index] = sessionObj;
          dataGridRef?.current?.instance?.refresh?.();
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

  return { updates: updates?.current, dataGridRef }
}
