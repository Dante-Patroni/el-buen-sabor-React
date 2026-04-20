import React from "react";
import ReactDOM from "react-dom/client";
import { AppRouter } from "./app/routes";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AppRouter />
);
