import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { FocusNav } from "./components/FocusNav";
import "./styles/auricui.css";
import "./styles/chat.css";
import "./styles/agent.css";
import "./styles/primitives.css";
import "./styles/docs.css";
import "./styles/app.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FocusNav />
    <App />
    <div id="auricui-chat-layer" className="auricui-chat" />
  </React.StrictMode>
);
