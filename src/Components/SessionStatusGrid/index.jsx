
import { useCallback, useEffect, useState } from 'react';
import { DataGrid, Column, Paging, Pager } from 'devextreme-react/data-grid';
import { ConnectionCard } from './handler';
import { getSessionsConnectivityStatus } from '../../Services/FixSessionService';
import './index.css';

export default function SessionStatusGrid() {
  const [rows, setRows] = useState([]);
  const cellRender = useCallback((cellData) => <ConnectionCard data={cellData.data} />, []);

  const getData = async () => {
    const response = await getSessionsConnectivityStatus();
    if (response?.length) {
      setRows(response);
      return;
    }
    setRows([]);
  }

  useEffect(() => {
    getData();
  }, [])

  return (
    <div className="session-status-datagrid dxl-wrap">
      <div className="dxl-head">
        <h2 className="dxl-h2">Session Status History</h2>
      </div>

      <div className="dxl-surface">
        <DataGrid
          dataSource={rows}
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
