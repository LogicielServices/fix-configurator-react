import React, { useState, useEffect, useRef } from 'react';
import TabPanel from 'devextreme-react/tab-panel';
import SessionsGrid from './SessionsGridsComponent';
import { Monitor, Add, Storage } from '@mui/icons-material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
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
      title: t?.engineName,
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
        <SessionsGrid
          sessions={item?.sessions}
          engineID={item?.engineID}
          title={item?.title}
        />
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
      
      {/* Modern Header Section - Clean Title and Action */}
      <div className="sess-header-modern">
        <div className="sess-header-left">
          <div className="sess-header-content">
            <h3 className="sess-title">Engine Sessions</h3>
            <p className="sess-sub">Manage and monitor FIX engine sessions in real-time</p>
          </div>
        </div>
        <div className="sess-header-right">
          <Button
            variant="contained"
            startIcon={<Monitor />}
            onClick={() => setShowSessionMonitorScreen(true)}
            className="sess-header-action-btn"
          >
            Session Monitoring Screen
          </Button>
        </div>
      </div>
      
      {/* Tabs or Empty State */}
      {
        !tabs || !tabs?.length ? (
          <div className="sess-empty-state-wrapper">
            <div className="sess-empty-state-content">
              <div className="sess-empty-icon">
                <Storage sx={{ fontSize: '56px' }} />
              </div>
              <h3 className="sess-empty-title">No engines connected</h3>
              <p className="sess-empty-description">
                Create your first engine to start configuring and monitoring FIX sessions.
              </p>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={showEnginesConfig}
                className="sess-empty-cta"
                aria-label="Add engine"
              >
                Add Engine
              </Button>
            </div>
          </div>
        ) : (
          <div className="sess-surface">
            <div className="sess-tabs-header-wrapper">
              <div className="sess-tabs-wrapper">
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
              <div className="sess-tabs-action">
                <Tooltip title="Add Engine" placement="left">
                  <IconButton
                    onClick={showEnginesConfig}
                    className="sess-add-engine-btn"
                    aria-label="Add engine"
                  >
                    <Add sx={{ fontSize: '20px' }} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}
