import { useEffect, useState } from "react";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { api } from "../convex/_generated/api";
import Landing from "./Landing";
import AuthModal from "./AuthModal";
import Dashboard from "./Dashboard";
import ProfileSetup from "./ProfileSetup";
import { AnimatedBackground } from "./Background";
import { clearPendingProfile, readPendingProfile } from "./pendingProfile";
import { DirectorioPublico } from "./components/DirectorioPublico";

type Role = "student" | "mentor";

function Loading() {
  return (
    <div className="relative grid min-h-screen place-items-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
    </div>
  );
}


function AuthenticatedApp({ currentView, onGoHome }: { currentView: "landing" | "dashboard" | "directorio", onGoHome: () => void }) {
  const data = useQuery(api.users.getCurrentUser);
  const completeProfile = useMutation(api.users.completeProfile);

  const needsProfile = data !== undefined && (data === null || data.profile === null);

  useEffect(() => {
    if (!needsProfile) return;
    const pending = readPendingProfile();
    if (pending) {
      void completeProfile(pending).then(() => clearPendingProfile());
    }
  }, [needsProfile, completeProfile]);

  if (data === undefined) {
    return <Loading />;
  }
  if (data === null || data.profile === null) {
    if (readPendingProfile()) {
      return <Loading />;
    }
    return <ProfileSetup />;
  }

  if (currentView === "landing") {
    return (
      <Landing
        onGetStarted={() => {}}
        onSignIn={() => {}}
        userProfile={{ fullName: data.profile.fullName }}
        onGoToDashboard={() => {
          window.dispatchEvent(new CustomEvent("navigate", { detail: "dashboard" }));
        }}
      />
    );
  }

  if (currentView === "directorio") {
    return (
      <DirectorioPublico
        userProfile={{ fullName: data.profile.fullName }}
        onGoToDashboard={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "dashboard" }))}
        onGoHome={onGoHome}
        onSignIn={() => {}}
        onGetStarted={() => {}}
      />
    );
  }

  return (
    <Dashboard fullName={data.profile.fullName} role={data.profile.role as Role} onGoHome={onGoHome} />
  );
}

export default function App() {
  const [modal, setModal] = useState<{ mode: "signUp" | "signIn"; role?: Role } | null>(null);
  const [view, setView] = useState<"landing" | "dashboard" | "directorio">("landing");
  const [searchParams, setSearchParams] = useState<{ query: string; location: string }>({ query: "", location: "" });

  useEffect(() => {
    const handleNav = (e: any) => {
      setView(e.detail.view || e.detail);
      if (e.detail.searchParams) {
        setSearchParams(e.detail.searchParams);
      }
    };
    window.addEventListener("navigate", handleNav);
    return () => window.removeEventListener("navigate", handleNav);
  }, []);

  return (
    <>
      <AnimatedBackground />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#14141d",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
          },
          success: {
            iconTheme: { primary: "#f47286", secondary: "#0a0a0f" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#0a0a0f" },
          },
        }}
      />

      <AuthLoading>
        <Loading />
      </AuthLoading>

      <Unauthenticated>
        {view === "directorio" ? (
          <DirectorioPublico
            initialSearchParams={searchParams}
            onGoHome={() => setView("landing")}
            onSignIn={() => setModal({ mode: "signIn" })}
            onGetStarted={(role) => setModal({ mode: "signUp", role })}
          />
        ) : (
          <Landing
            onGetStarted={(role) => setModal({ mode: "signUp", role })}
            onSignIn={() => setModal({ mode: "signIn" })}
          />
        )}
        <AnimatePresence>
          {modal && (
            <AuthModal
              initialMode={modal.mode}
              initialRole={modal.role}
              onClose={() => setModal(null)}
              onSuccess={() => setView("dashboard")}
            />
          )}
        </AnimatePresence>
      </Unauthenticated>

      <Authenticated>
        <AuthenticatedApp currentView={view} onGoHome={() => setView("landing")} />
      </Authenticated>
    </>
  );
}
