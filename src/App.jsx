import { BrowserRouter } from "react-router-dom";
import { GlobalProvider } from "./Provider/GlobalProvider";
import RoutesComponent from "./Components/RoutesComponent/Routes.jsx";
import { Toaster } from 'react-hot-toast';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

const App = ({ appConfig }) => {
  return (
    <GlobalProvider appConfig={appConfig}>
      <BrowserRouter>
        <RoutesComponent />
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </GlobalProvider>
  )
}

export default App;
