import Landing from "./Landing";
import { AnimatedBackground } from "./Background";

export default function App() {
  return (
    <>
      {/* 
        Por ahora, renderizamos directamente la Landing Page sin lógica de Auth,
        tal como pediste para probar Convex a fondo más adelante sin bloqueos.
      */}
      <Landing
        onGetStarted={(role) => console.log("Registrar: ", role)}
        onSignIn={() => console.log("Iniciar sesión")}
      />
    </>
  );
}
