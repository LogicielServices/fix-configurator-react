import React, { useState, useEffect, useRef } from 'react';
import TabPanel from 'devextreme-react/tab-panel';
import SessionsGrid from './SessionsGridsComponent';
import { Monitor, Settings } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { Popup } from 'devextreme-react';
import SessionsDataGrid from './SessionsDataGrid';

export default function SessionsTabs({ tabs, activeEngineID, onActivate, onCloseTab, showEnginesConfig }) {
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSessionMonitorScreen, setShowSessionMonitorScreen] = useState(false);
  const tabPanelRef = useRef();

  useEffect(() => {
    const newTabs = (tabs || [])?.map?.((t) => ({
      key: t?.engineID,
      title: `${t?.engineName} (${t?.engineID})`,
      engineID: t?.engineID,
      sessions: t?.sessions || [],
    }));
    setItems(newTabs);
  }, [tabs]);

  useEffect(() => {
    const idx = items?.findIndex?.((i) => i?.engineID === activeEngineID);
    const selectIdx = idx >= 0 ? idx : 0;
    tabPanelRef?.current?.instance?.option?.('selectedIndex', selectIdx);
    setSelectedIndex(selectIdx);
  }, [items, activeEngineID]);

  const onSelectionChanged = (e) => {
    const item = items?.[e?.component?.option?.('selectedIndex')];
    if (item && item?.engineID) {
      onActivate?.(item?.engineID);
    }
  };

  const titleRender = (item) => {
    return (
      <div className="sess-tab-title" title={item.title}>
        <span className="sess-tab-text">{item.title}</span>
        <button
          className="sess-tab-close"
          onClick={(ev) => {
            ev.stopPropagation();
            onCloseTab?.(item.engineID);
          }}
          aria-label="Close tab"
          title="Close"
        >
          ×
        </button>
      </div>
    );
  };

  const itemRender = (item) => {
    return (
      <div className="sess-tab-content">
        <SessionsGrid sessions={item?.sessions} engineID={item?.engineID} />
      </div>
    );
  };

  return (
    <div className="sess-wrap">
      <Popup
        visible={showSessionMonitorScreen}
        onHiding={() => setShowSessionMonitorScreen(false)}
        fullScreen
        title="Sessions Monitoring Screen"
        showCloseButton
      >
        <div className="sess-wrap"><SessionsDataGrid /></div>
      </Popup>
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center gap-4">
          <div className="sess-head">
            <h3 className="sess-title">Engine Sessions</h3>
            <p className="sess-sub">Tabs appear as you connect engines</p>
          </div>
          <Settings
            color="primary"
            style={{ cursor: 'pointer' }}
            fontSize="large"
            onClick={showEnginesConfig}
          />
        </div>
        <div className="align-content-center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Monitor />}
            onClick={() => setShowSessionMonitorScreen(true)}
            sx={{ textTransform: "none", borderRadius: "6px" }}
          >
            Session Monitoring Screen
          </Button>
        </div>
      </div>
      {
        !tabs || !tabs?.length ? (
          <div className="sess-empty-wrapper">
            <div className="sess-empty">No data to display</div>
          </div>
        ) : (
          <div className="sess-surface">
            <TabPanel
              items={items}
              deferRendering={false}
              ref={tabPanelRef}
              itemRender={itemRender}
              itemTitleRender={titleRender}
              selectedIndex={items?.length ? selectedIndex : 0}
              onSelectionChanged={onSelectionChanged}
              showNavButtons={true}
              loop={false}
              animationEnabled={true}
            />
          </div>
        )
      }
    </div>
  );
}
