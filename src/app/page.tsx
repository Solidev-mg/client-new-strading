"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./modules/auth/presentation/providers/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { authInfos, tokenInfos } = useAuth();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    if (authInfos && tokenInfos) {
      // Rediriger vers le dashboard si l'utilisateur est connecté
      router.replace("/dashboard");
    } else {
      // Rediriger vers la page de connexion si non connecté
      router.replace("/auth/signin");
    }
  }, [authInfos, tokenInfos, router]);

  // Afficher un loader pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0486e4]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Chargement...</p>
      </div>
    </div>
  );
}
