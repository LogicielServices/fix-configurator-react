import React, { useState, useEffect } from 'react';
import TabPanel from 'devextreme-react/tab-panel';
import SessionsGrid from './SessionsGrid';
import { Typography } from '@mui/material';
import { Settings } from '@mui/icons-material';

export default function SessionsTabs({ tabs, activeEngineID, onActivate, onCloseTab, showEnginesConfig }) {
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    setSelectedIndex(idx >= 0 ? idx : 0);
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
              itemRender={itemRender}
              itemTitleRender={titleRender}
              selectedIndex={items?.length ? selectedIndex : -1}
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
