"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "../../modules/auth/presentation/providers/AuthProvider";
import SignUpScreen from "../../modules/auth/presentation/screens/SignUpScreen";

interface SignUpFormData {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const { register: registerUser, isLoading, message } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpFormData>();

  const onSubmit = async (data: SignUpFormData) => {
    try {
      // Vérifier que les mots de passe correspondent
      if (data.password !== data.confirmPassword) {
        setError("confirmPassword", {
          type: "manual",
          message: "Les mots de passe ne correspondent pas",
        });
        return;
      }

      // Ici, vous devrez implémenter la fonction d'inscription dans AuthProvider
      await registerUser({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        deliveryAddress: data.deliveryAddress,
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
    }
  };

  return (
    <SignUpScreen
      isLoading={isLoading}
      onSubmit={handleSubmit(onSubmit)}
      register={register}
      errors={errors}
      message={message}
    />
  );
}
