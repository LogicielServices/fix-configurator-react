import { createContext, useState, useCallback, useMemo } from "react";
import { isLoggedIn } from "../utils/helper";

const GlobalContext = createContext();

export const GlobalProvider = ({ children, appConfig }) => {

  const [isAuthenticated, setIsAuthenticated] = useState(!!isLoggedIn());

  const handleLoginSuccess = useCallback(
    () => setIsAuthenticated(!!isLoggedIn()),
    []
  );

  const contextValue = useMemo(
    () => ({
      appConfig,
      isAuthenticated,
      handleLoginSuccess,
    }),
    [appConfig, isAuthenticated, handleLoginSuccess]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
