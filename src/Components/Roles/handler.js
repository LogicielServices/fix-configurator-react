import { TreeItem } from "@mui/lab";
import { styled } from "@mui/material/styles";

export const rolesAccessesList = {
  Account: ["Register", "EditUser"],
  FIXConfiguration: ["ViewFIXSessions"],
  FixEngineConfiguration: ["ConnectToFixEngine", "DisconnectToFixEngine"],
  FixEngine: ["Save"],
  FixMessages: ["Download"],
  FixSession: ["ConnectDisconnectFIX", "SetSequenceNumber", "ResetSequenceNumber", "GetSessionConfiguration", "EditSessionConfiguration"],
  FixSessionStatus: ["DeleteFixSessionHistory"],
  FixTagValuesConfiguration: ["AddFIXMessageConfiguration", "GetAllPreviousStreamedFIXMessages"],
  GitHub: ["CloneGithubRepoBranch", "AddNewSession_Acceptor", "GetSessionDetail"],
  Home: ["Index", "Privacy", "Error", "About", "Contact"],
  JenkinsConfiguration: ["AddOrUpdateJenkinsConfiguration", "JenkinsTrigger", "StartFixEngine", "StopFixEngine", "GetJenkinsLatestJobStatus"],
  Role: ["Index", "GetRoleDetails", "Create", "EditRole", "RoleUsers"],
  Tcp: ["Telnet"],
}

export const buildTreeData = () => {
  let id = 1;
  const tree = [];

  Object.entries(rolesAccessesList).forEach(([parent, children]) => {
    const parentId = id++;
    tree.push({ id: parentId, parentId: 0, name: parent });

    children.map((c) => c.trim()).forEach((child) => {
      tree.push({
        id: id++,
        parentId: parentId,
        name: child,
      });
    });
  });

  return tree;
};

export const buildRolePermissions = (selectedKeys, treeData) => {
  const result = [];
  const parents = treeData?.filter?.(node => node?.parentId === 0);
  parents?.forEach?.(parent => {
    const children = treeData?.filter?.(x => x?.parentId === parent?.id);
    const selectedChildren = children
      ?.filter(x => selectedKeys?.includes?.(x?.id))
      ?.map(x => x?.name);
    const parentSelected = selectedKeys?.includes?.(parent?.id);
    const finalArray = parentSelected ? children?.map?.(c => c?.name) : selectedChildren;
    if (finalArray?.length > 0) {
      result?.push?.({
        c: parent?.name,
        a: finalArray
      });
    }
  });
  return JSON.stringify(result);
};

export const mapPermissionsToSelectedKeys = (backendPermissions, treeData) => {
  const keys = [];

  backendPermissions.forEach(({ c, a }) => {
    // find parent node
    const parentNode = treeData.find(n => n.name === c && n.parentId === 0);
    if (!parentNode) return;

    // ✅ Select parent only if all children were submitted
    const allChildren = treeData.filter(x => x.parentId === parentNode.id).map(x => x.name);
    const isFullSelection = a.length === allChildren.length;

    if (isFullSelection) {
      keys.push(parentNode.id);
    }

    // ✅ Always mark children individually
    a.forEach(childName => {
      const childNode = treeData.find(n => n.name === childName && n.parentId === parentNode.id);
      if (childNode) keys.push(childNode.id);
    });
  });

  return keys;
};
