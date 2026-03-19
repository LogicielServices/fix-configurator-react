import { useCallback, useMemo } from 'react';
import { DataGrid, Column, Paging, Pager } from 'devextreme-react/data-grid';
import { ConnectionCard, EmptyState, LoadingSkeleton } from './handler';
import { Button } from 'devextreme-react';
import './index.css';

export default function SessionStatusGrid({ updates, clearHistory }) {
  const cellRender = useCallback((cellData) => <ConnectionCard data={cellData.data} />, []);

  /* Determine loading vs empty vs data state */
  const isLoading = updates === undefined || updates === null;
  const isEmpty = Array.isArray(updates) && updates.length === 0;

  /* Memoize the noDataText to avoid React re-creates */
  const noDataText = useMemo(() => ' ', []);  // space to suppress default DX text; we render EmptyState instead

  return (
    <div className="session-status-datagrid dxl-wrap" role="region" aria-label="Session Status History">
      <div className="dxl-head">
        <div className="dxl-head-left">
          <h2 className="dxl-h2">Session Status History</h2>
          <p className="dxl-subtitle">Real-time connection activity</p>
        </div>
        <div className="dxl-head-right" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {Array.isArray(updates) && updates.length > 0 && (
            <span className="dxl-count-chip" aria-label={`${updates.length} sessions`}>
              {updates.length} session{updates.length !== 1 ? 's' : ''}
            </span>
          )}
          <Button
            text="Clear"
            type="danger"
            stylingMode="contained"
            disabled={!updates?.length}
            onClick={clearHistory}
            icon="trash"
            width={100}
          />
        </div>
      </div>

      <div className="dxl-surface">
        {isLoading ? (
          <LoadingSkeleton count={5} />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <DataGrid
            dataSource={updates}
            keyExpr="connectionID"
            showBorders={false}
            showColumnHeaders={false}
            height="calc(100vh - 110px)"
            width="100%"
            hoverStateEnabled={false}
            rowAlternationEnabled={false}
            wordWrapEnabled={true}
            columnAutoWidth={true}
            columnHidingEnabled={false}
            allowColumnReordering={false}
            allowColumnResizing={false}
            noDataText={noDataText}
          >
            <Column
              dataField="connectionID"
              caption=""
              cellRender={cellRender}
            />

            <Paging defaultPageSize={7} />
            <Pager
              showInfo={true}
              showNavigationButtons={true}
              showPageSizeSelector={true}
              allowedPageSizes={[7, 12, 18]}
              visible={true}
              infoText="{2} items"
            />
          </DataGrid>
        )}
      </div>
    </div>
  );
}
