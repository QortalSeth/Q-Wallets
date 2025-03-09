import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from "react-router-dom";
import App from './App';

interface CustomWindow extends Window {
  _qdnBase: string;
}

const customWindow = window as unknown as CustomWindow;
const baseUrl = customWindow?._qdnBase || "";

export const useIframe = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    function handleNavigation(event) {
      if (event.data?.action === "NAVIGATE_TO_PATH" && event.data.path) {
        navigate(event.data.path); // Navigate directly to the specified path

        // Send a response back to the parent window after navigation is handled
        window.parent.postMessage(
          { action: "NAVIGATION_SUCCESS", path: event.data.path },
          "*"
        );
      }
    }

    window.addEventListener("message", handleNavigation);

    return () => {
      window.removeEventListener("message", handleNavigation);
    };
  }, [navigate]);
  return { navigate };
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={baseUrl}>
    <App />
  </BrowserRouter>
);
