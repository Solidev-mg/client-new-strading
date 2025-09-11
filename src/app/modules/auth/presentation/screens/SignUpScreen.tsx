"use client";

import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
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

interface SignUpFormData {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

type SignUpScreenProps = {
  isLoading: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  register: UseFormRegister<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
  message: string | null;
};

function SignUpScreen({
  isLoading,
  onSubmit,
  register,
  errors,
  message,
}: SignUpScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0486e4] to-[#0374c7] p-4">
      <Card className="w-full max-w-lg bg-white rounded-lg shadow-xl border-none">
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
              Créer votre compte Strading
            </h1>
          </div>

          {/* Formulaire d'inscription */}
          <form onSubmit={onSubmit} className="space-y-6">
            {message && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {message}
              </div>
            )}

            {/* Nom complet */}
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Nom complet *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0486e4] w-5 h-5" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Votre nom complet"
                  className="pl-10 border-gray-300 focus:border-[#0486e4] focus:ring-[#0486e4]"
                  {...register("fullName", {
                    required: "Le nom complet est requis",
                    minLength: {
                      value: 2,
                      message: "Le nom doit contenir au moins 2 caractères",
                    },
                  })}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-600 text-sm">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Numéro de téléphone */}
            <div className="space-y-2">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Numéro de téléphone *
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0486e4] w-5 h-5" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+261 XX XX XX XX"
                  className="pl-10 border-gray-300 focus:border-[#0486e4] focus:ring-[#0486e4]"
                  {...register("phoneNumber", {
                    required: "Le numéro de téléphone est requis",
                    pattern: {
                      value: /^[\+]?[\d\s\-\(\)]{10,}$/,
                      message: "Numéro de téléphone invalide",
                    },
                  })}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-600 text-sm">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Adresse de livraison */}
            <div className="space-y-2">
              <label
                htmlFor="deliveryAddress"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse de livraison *
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 text-[#0486e4] w-5 h-5" />
                <textarea
                  id="deliveryAddress"
                  placeholder="Votre adresse complète de livraison"
                  className="pl-10 w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0486e4] focus:border-[#0486e4] resize-none text-black placeholder:text-gray-500"
                  {...register("deliveryAddress", {
                    required: "L'adresse de livraison est requise",
                    minLength: {
                      value: 10,
                      message: "L'adresse doit être plus détaillée",
                    },
                  })}
                />
              </div>
              {errors.deliveryAddress && (
                <p className="text-red-600 text-sm">
                  {errors.deliveryAddress.message}
                </p>
              )}
            </div>

            {/* Email (facultatif) */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email (facultatif)
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0486e4] w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="pl-10 border-gray-300 focus:border-[#0486e4] focus:ring-[#0486e4]"
                  {...register("email", {
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
                Mot de passe *
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
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre",
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

            {/* Confirmation du mot de passe */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0486e4] w-5 h-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  className="pl-10 pr-10 border-gray-300 focus:border-[#0486e4] focus:ring-[#0486e4]"
                  {...register("confirmPassword", {
                    required: "La confirmation du mot de passe est requise",
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0486e4]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Bouton d'inscription */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0486e4] hover:bg-[#0374c7] text-white py-3"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                "Créer mon compte"
              )}
            </Button>

            {/* Lien vers la connexion */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth/signin")}
                  className="text-[#0486e4] hover:underline font-medium"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUpScreen;
