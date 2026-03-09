import { useState, useCallback, useEffect } from "react";
import FixEnginesGrid from "../Components/FixEnginesGrid/index.jsx";
import SessionsTabs from "../Components/SessionsTabAndGrid/SessionsTab.jsx";
import "../Components/Dashboard/index.css";
import { Dialog } from "@mui/material";
import { confirm } from "devextreme/ui/dialog";
import { textMessages } from "../utils/constants.js";
import { disconnectFixEngine, getConnectedEngines } from "../Services/FixSessionService.js";

export default function FixDashboard() {
  const [tabs, setTabs] = useState([]);
  const [activeEngineID, setActiveEngineID] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const getConnectedEnginesData = async () => {
    const response = await getConnectedEngines();
    if (response?.length) {
      setTabs(response || []);
    }
  }

  useEffect(() => {
    getConnectedEnginesData();
  }, [])

  const handleEngineConnected = useCallback(async (engineDetail) => {
    const engineID = engineDetail?.engineID;
    const engineName = engineDetail?.engineName;
    const sessions = Array.isArray(engineDetail?.sessions)
      ? engineDetail.sessions
      : [];

    if (!engineID) return;
    setTabs((prev) => {
      const exists = prev.some((t) => t.engineID === engineID);
      if (exists) {
        return prev.map((t) =>
          t.engineID === engineID ? { ...t, engineName, sessions } : t,
        );
      }
      return [...prev, { engineID, engineName, sessions }];
    });
    setActiveEngineID(engineID);
  }, []);

  const handleCloseTab = useCallback(
    async (engineIDToClose) => {
      const result = await confirm(textMessages?.areYouSure, "Disconnect Engine");
      if (!result) return;
      const engineToDisconnect = tabs?.find(t => t?.engineID === engineIDToClose);
      if (!engineToDisconnect) return;
      engineToDisconnect.fixEngineIpAddress = engineIDToClose?.split?.(':')?.[0];
      engineToDisconnect.fixEngineIpPort = engineIDToClose?.split?.(':')?.[1];
      engineToDisconnect.redisIpAddress = engineIDToClose?.split?.(':')?.[0];
      engineToDisconnect.redisIpPort = engineIDToClose?.split?.(':')?.[1];
      engineToDisconnect.redisDB = engineIDToClose?.split?.(':')?.[
        engineIDToClose?.length - 1
      ];
      engineToDisconnect.lastReadStreamEntryID = "";
      await disconnectFixEngine(engineToDisconnect);
      setTabs((prev) => prev.filter((t) => t.engineID !== engineIDToClose));
      setActiveEngineID((current) => {
        if (current === engineIDToClose) {
          // If closing the active tab, pick the last tab in the new list (if any)
          const remaining = tabs.filter((t) => t.engineID !== engineIDToClose);
          return remaining.length
            ? remaining[remaining.length - 1].engineID
            : null;
        }
        return current;
      });
    },
    [tabs],
  );

  const showEnginesConfig = () => setShowPopup(true);

  return (
    <div className="fx-dashboard">
      {/* Top: two panes (left Engines, right Connections list) */}
      {/* <CollapsibleSection title="Engines Details & Sessions History" defaultOpen={true}>
          <div className="fx-two-pane">
            <div className="fx-pane-left">
              <FixEnginesGrid handleEngineConnected={handleEngineConnected} />
            </div>
            <div className="fx-pane-right">
              <SessionStatusGrid />
            </div>
          </div>
        </CollapsibleSection> */}
      <Dialog
        open={showPopup}
        onClose={() => setShowPopup(false)}
        maxWidth="md"
        fullWidth={true}
      >
        <FixEnginesGrid handleEngineConnected={handleEngineConnected} connectedEngines={tabs} setShowPopup={setShowPopup} />
      </Dialog>
      {/* Bottom: tabs for sessions of connected engines */}
      <div className="fx-tabs-area">
        <SessionsTabs
          tabs={tabs}
          activeEngineID={activeEngineID}
          onActivate={setActiveEngineID}
          onCloseTab={handleCloseTab}
          showEnginesConfig={showEnginesConfig}
        />
      </div>
    </div>
  );
}
