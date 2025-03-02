import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App';
interface CustomWindow extends Window {
  _qdnBase: string;
}

const customWindow = window as unknown as CustomWindow;
const baseUrl = customWindow?._qdnBase || "";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={baseUrl}>
    <App />
  </BrowserRouter>
);
