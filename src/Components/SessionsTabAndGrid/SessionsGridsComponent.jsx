import { useState, useEffect, useMemo } from "react";
import FixMessagesPanel from "../FixMessagesPanel/index.jsx";
import SessionsDataGrid from "./SessionsDataGrid.jsx";
import "../FixMessagesPanel/index.css";

export default function SessionsGrid({ sessions, engineID }) {
  const [selectedSessionID, setSelectedSessionID] = useState(null);

  useEffect(() => {
    setSelectedSessionID(null);
  }, [sessions]);

  return (
    <div className="sg-surface p-2">
      <SessionsDataGrid
        engineID={engineID}
        sessions={sessions}
        setSelectedSessionID={setSelectedSessionID}
      />
      <div className="sg-messages-block">
        <FixMessagesPanel engineID={engineID} sessionID={selectedSessionID} />
      </div>
    </div>
  );
}
