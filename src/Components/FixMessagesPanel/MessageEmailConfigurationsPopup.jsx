import { useEffect, useState, memo } from "react";
import { getAllMessageEmailConfigurations, deleteMessageEmailConfiguration } from "../../Services/FixFiltersService";
import DataGrid, { Column, HeaderFilter, LoadPanel, Scrolling } from "devextreme-react/data-grid";
import { Popup, Button } from "devextreme-react";
import "./index.css";
import { confirm } from "devextreme/ui/dialog";
import { textMessages } from "../../utils/constants";

const MessageEmailConfigurationsPopup = ({
  messageEmailConfigurationsPopupVisible,
  setMessageEmailConfigurationsPopupVisible,
}) => {
  const [datasource, setDatasource] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (messageEmailConfigurationsPopupVisible) {
      loadMessageEmailConfigurations();
    }
  }, [messageEmailConfigurationsPopupVisible]);

  const loadMessageEmailConfigurations = async () => {
    try {
      setLoading(true);
      const response = await getAllMessageEmailConfigurations();
      if (Array.isArray(response)) {
        setDatasource(response);
      } else {
        setDatasource([]);
      }
    } catch (error) {
      console.error("Error loading message email configurations:", error);
      setDatasource([]);
    } finally {
      setLoading(false);
    }
  };

  const renderEmailTags = (value) => {
    if (!value) return null;
    const emails = typeof value === "string" ? value.split(",").filter((e) => e.trim()) : [];
    return (
      <div className="email-tags">
        {emails.map((email, index) => (
          <span key={index} className="email-tag">
            {email.trim()}
          </span>
        ))}
      </div>
    );
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteMessageEmailConfiguration(id);
      await loadMessageEmailConfigurations();
    } catch (error) {
      console.error("Error deleting configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popup
      visible={!!messageEmailConfigurationsPopupVisible}
      onHiding={() => {
        setMessageEmailConfigurationsPopupVisible(false);
        setDatasource([]);
      }}
      title="MESSAGE EMAIL CONFIGURATIONS"
      showCloseButton
      fullScreen
    >
      <DataGrid
        dataSource={datasource}
        showBorders
        rowAlternationEnabled
        hoverStateEnabled
        columnAutoWidth
        noDataText="No message email configurations found"
        allowColumnResizing
        columnResizingMode="widget"
        width="100%"
        height="calc(100vh - 90px)"
      >
        <LoadPanel visible={loading} message="Loading..." />
        <Column
          dataField="engine"
          caption="Engine"
          width="12%"
        />
        <Column
          dataField="sessionId"
          caption="Session ID"
          width="15%"
        />
        <Column
          dataField="fixTag"
          caption="Fix Tag"
          width="8%"
          alignment="center"
        />
        <Column
          dataField="fixValue"
          caption="Fix Value"
          width="8%"
          alignment="center"
        />
        <Column
          dataField="emailStatus"
          caption="Email Status"
          width="10%"
          alignment="center"
          dataType="boolean"
        />
        <Column
          dataField="toEmails"
          caption="To Emails"
          width="15%"
          cellRender={(cell) => renderEmailTags(cell.data?.toEmails)}
        />
        <Column
          dataField="ccEmails"
          caption="CC Emails"
          width="15%"
          cellRender={(cell) => renderEmailTags(cell.data?.ccEmails)}
        />
        <Column
          dataField="subject"
          caption="Subject"
          width="12%"
        />
        <Column
          dataField="body"
          caption="Body"
          width="15%"
        />
        <Column
          caption="Actions"
          width="10%"
          fixed
          fixedPosition="right"
          alignment="center"
          cellRender={(cell) => (
            <Button
              icon="trash"
              type="danger"
              stylingMode="text"
              onClick={() => handleDelete(cell.data?.id)}
              hint="Delete"
            />
          )}
        />
        <Scrolling mode="virtual" />
        <HeaderFilter visible />
      </DataGrid>
    </Popup>
  );
};

export default memo(MessageEmailConfigurationsPopup);
