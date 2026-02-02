import { createRoot } from "react-dom/client";
import App from './App';

fetch("/config.json")
  .then((data) => data?.json?.())
  .then((appConfig) => {
    createRoot(document.getElementById("root")).render(
      <App appConfig={appConfig} />
    );
  });
