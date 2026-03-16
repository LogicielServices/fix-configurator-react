import { useCallback } from 'react';
import { DataGrid, Column, Paging, Pager } from 'devextreme-react/data-grid';
import { ConnectionCard } from './handler';
import './index.css';
import useFixSessionStatusFeed from '../../SignalR/useFixSessionStatusFeed';

export default function SessionStatusGrid() {
  const updates = useFixSessionStatusFeed();
  const cellRender = useCallback((cellData) => <ConnectionCard data={cellData.data} />, []);

  return (
    <div className="session-status-datagrid dxl-wrap">
      <div className="dxl-head">
        <h2 className="dxl-h2">Session Status History</h2>
      </div>

      <div className="dxl-surface">
        <DataGrid
          dataSource={updates}
          keyExpr="connectionID"
          showBorders={false}
          showColumnHeaders={false}
          style={{ width: 552 }}
          height="calc(100vh - 73px)"
          hoverStateEnabled={false}
          rowAlternationEnabled={false}
          wordWrapEnabled={true}
          columnAutoWidth={true}
          columnHidingEnabled={false}
          allowColumnReordering={false}
          allowColumnResizing={false}
          noDataText="Nothing to show"
        >
          <Column
            dataField="connectionID"
            caption=""
            cellRender={cellRender}
            width={520}
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
      </div>
    </div>
  );
}
