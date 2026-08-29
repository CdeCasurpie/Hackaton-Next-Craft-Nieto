import { useEffect, useState } from "react";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { AnimatePresence } from "framer-motion";
import { api } from "../convex/_generated/api";
import Landing from "./Landing";
import AuthModal from "./AuthModal";
import Dashboard from "./Dashboard";
import ProfileSetup from "./ProfileSetup";
import { AnimatedBackground } from "./Background";
import { clearPendingProfile, readPendingProfile } from "./pendingProfile";

type Role = "student" | "mentor";

function Loading() {
  return (
    <div className="relative grid min-h-screen place-items-center">
      <AnimatedBackground />
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
    </div>
  );
}

function AuthenticatedApp() {
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
  return (
    <Dashboard fullName={data.profile.fullName} role={data.profile.role as Role} />
  );
}

export default function App() {
  const [modal, setModal] = useState<{ mode: "signUp" | "signIn"; role?: Role } | null>(
    null,
  );

  return (
    <>
      <AuthLoading>
        <Loading />
      </AuthLoading>

      <Unauthenticated>
        <Landing
          onGetStarted={(role) => setModal({ mode: "signUp", role })}
          onSignIn={() => setModal({ mode: "signIn" })}
        />
        <AnimatePresence>
          {modal && (
            <AuthModal
              initialMode={modal.mode}
              initialRole={modal.role}
              onClose={() => setModal(null)}
            />
          )}
        </AnimatePresence>
      </Unauthenticated>

      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
    </>
  );
}
