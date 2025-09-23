"use client";

import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "../../../shared/presentation/components/form/button";
import {
  Card,
  CardContent,
} from "../../../shared/presentation/components/form/card";
import { Input } from "../../../shared/presentation/components/form/input";

interface SignInFormData {
  email: string;
  password: string;
}

type SignInScreenProps = {
  isLoading: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  register: UseFormRegister<SignInFormData>;
  errors: FieldErrors<SignInFormData>;
  message: string | null;
  onDemoLogin?: () => void;
};

function SignInScreenSimple({
  isLoading,
  onSubmit,
  register,
  errors,
  message,
  onDemoLogin,
}: SignInScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0486e4] to-[#0374c7] p-4">
      <Card className="w-full max-w-md bg-white rounded-lg shadow-xl border-none">
        <CardContent className="p-8">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 flex items-center justify-center mx-auto mb-4">
              <Image
                src="/strading_icon.png"
                alt="Strading Logo"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Connexion à Strading
            </h1>
          </div>

          {/* Formulaire de connexion */}
          <form onSubmit={onSubmit} className="space-y-6">
            {message && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {message}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0486e4] w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="pl-10 border-gray-300 focus:border-[#0486e4] focus:ring-[#0486e4]"
                  {...register("email", {
                    required: "L'email est requis",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email invalide",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0486e4] w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  className="pl-10 pr-10 border-gray-300 focus:border-[#0486e4] focus:ring-[#0486e4]"
                  {...register("password", {
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 8,
                      message:
                        "Le mot de passe doit contenir au moins 8 caractères",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0486e4]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Bouton de connexion */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0486e4] hover:bg-[#0374c7] text-white py-3"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                "Se connecter"
              )}
            </Button>

            {/* Lien vers l'inscription */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Vous n&apos;avez pas encore de compte ?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth/register")}
                  className="text-[#0486e4] hover:underline font-medium"
                >
                  Créer un compte
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignInScreenSimple;
