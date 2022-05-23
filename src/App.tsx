import React, { useCallback, useEffect } from "react";
import "./App.css";
import "./index.scss";
import "./App.scss";
import "./styles/spacing.scss";
import "./emoji.scss";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@material-ui/core";
import Main from "./pages/Main";
import AppToastNotification from "./components/AppToastNotification";
import { useSelector } from "react-redux";
import TextareaAutosize from "react-textarea-autosize";
import GlobalVariable from "./services/GlobalVariable";
import SocketUtils from "./utils/SocketUtils";

type AppProps = {
  findUser?: () => any;
  getInitial?: () => () => void;
};

const App = ({ findUser, getInitial }: AppProps) => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user.userData);
  const imgDomain = useSelector((state: any) => state.user.imgDomain);
  const initApp = useCallback(async () => {
    await findUser?.();
    if (!imgDomain) {
      await getInitial?.();
    }
    navigate("/home");
  }, [findUser, getInitial, imgDomain, navigate]);
  useEffect(() => {
    TextareaAutosize.defaultProps = {
      ...TextareaAutosize.defaultProps,
      onFocus: () => {
        GlobalVariable.isInputFocus = true;
      },
      onBlur: () => {
        GlobalVariable.isInputFocus = false;
      },
    };
    const eventOffline = () => {
      SocketUtils.socket?.disconnect?.();
    };
    const eventOnline = () => {
      if (!user) {
        initApp();
      } else {
        SocketUtils.reconnectIfNeeded();
      }
    };
    const eventPaste = (e: any) => {
      e.preventDefault();
      if (!e.clipboardData.types.includes("Files")) {
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }
    };
    window.addEventListener("offline", eventOffline);
    window.addEventListener("online", eventOnline);
    window.addEventListener("paste", eventPaste);
    return () => {
      window.removeEventListener("offline", eventOffline);
      window.removeEventListener("online", eventOnline);
      window.removeEventListener("paste", eventPaste);
    };
  }, [user, initApp]);
  const overrides: any = {
    MuiPickersDay: {
      day: {
        color: "var(--color-primary-text)",
      },
      daySelected: {
        backgroundColor: "var(--color-stroke)",
      },
      dayDisabled: {
        color: "var(--color-secondary-text)",
      },
      current: {
        color: "var(--color-success)",
      },
    },
  };
  const materialTheme = createTheme({
    overrides,
  });
  return (
    <ThemeProvider theme={materialTheme}>
      <div>
        <Main />
        <AppToastNotification />
      </div>
    </ThemeProvider>
  );
};

// function App() {
//   return (
//     <div className="App">
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="about" element={<About />} />
//       </Routes>
//     </div>
//   );
// }

export default App;
