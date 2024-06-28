import CodeArea from "./components/ExtensionArea";
import Sidebar from "./components/Sidebar";
import Titlebar from "./components/Titlebar";
import { SourceProvider } from "./context/SourceContext";
import { ExtensionsProvider } from "./context/ExtensionsContext"; // Import the provider
import {ThemeProvider} from "./context/ThemeContext"
 
export default function App() {
  return ( 
    <div className="wrapper">
      <Titlebar />
      <div id="editor" className="h-screen flex items-start overflow-hidden bg-primary">
      <ThemeProvider>
        <SourceProvider>  
          <ExtensionsProvider>
            <Sidebar /> 
            <CodeArea /> 
          </ExtensionsProvider>
        </SourceProvider>
      </ThemeProvider>
      </div>
    </div>
  );
}