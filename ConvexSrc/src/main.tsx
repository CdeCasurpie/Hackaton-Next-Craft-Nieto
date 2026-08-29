import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import App from "./App";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function MissingConvex() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center text-white bg-slate-900">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold">Falta conectar Convex</h1>
        <p className="mt-3 text-slate-400">
          No se encontró <code>VITE_CONVEX_URL</code>. Asegúrate de que
          <code> npx convex dev</code> esté corriendo y reinicia el servidor.
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {convex ? (
      <ConvexAuthProvider client={convex}>
        <App />
      </ConvexAuthProvider>
    ) : (
      <MissingConvex />
    )}
  </React.StrictMode>,
);
