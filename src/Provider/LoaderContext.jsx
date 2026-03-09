import { createContext, useState, useCallback, useMemo, useContext } from "react";
import Loader from "../Components/LoaderComponent/index.jsx";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      isLoading,
      showLoader,
      hideLoader,
    }),
    [isLoading, showLoader, hideLoader]
  );

  return (
    <LoaderContext.Provider value={contextValue}>
      {isLoading && <Loader />}
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within LoaderProvider");
  }
  return context;
};

export default LoaderContext;
