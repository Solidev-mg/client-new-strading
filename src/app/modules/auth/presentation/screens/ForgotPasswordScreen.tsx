"use client";

import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";

function ForgotPasswordScreen() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");

  const { forgotPassword, isSubmitted, setIsSubmitted, isLoading } = useAuth();
  const router = useRouter();

  const handleBackToLogin = () => {
    setIsSubmitted(false);
    setEmail("");
    router.push("/auth/signin");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="w-full relative">
      <div className="rounded-xl  flex">
        {/* Left side - Image */}
        <div className="flex flex-col h-[95vh] justify-center w-1/2 items-center">
          {/* Dashboard Screenshots */}
          <div className="relative w-[700px] h-[494.74px]">
            <div className="relative w-[732px] h-[495px] -left-8">
              <div className="absolute w-[732px] h-[494px] top-0 left-0">
                <div className="absolute w-[512px] h-[344px] top-0 left-[100px]">
                  <div className="relative h-[344px]">
                    <img
                      className="absolute w-[512px] h-[336px] top-2 left-0 object-cover"
                      alt="Dashboard"
                      src="/assets/images/signup/dashboard.png"
                    />
                    <div className="flex flex-col w-[512px] h-[13px] items-start justify-center gap-2.5 px-2.5 py-[5px] absolute top-0 left-0 bg-[#b2d6e6] rounded-[3px_3px_0px_0px]">
                      <div className="flex w-[34px] h-2 items-center gap-0.5 relative mt-[-2.59px] mb-[-2.59px]">
                        <div className="bg-[#141414] relative w-1 h-1 rounded-sm" />
                        <div className="bg-[#141414] relative w-1 h-1 rounded-sm" />
                        <div className="bg-[#141414] relative w-1 h-1 rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>
                <img
                  className="absolute w-[185px] h-[382px] top-[111px] left-[547px] object-cover"
                  alt="Reservation"
                  src="/assets/images/signup/re-servation.png"
                />
                <img
                  className="absolute w-[267px] h-[138px] top-[252px] left-0 object-cover"
                  alt="Reservation bloc"
                  src="/assets/images/signup/re-servation-bloc-1.png"
                />
                <img
                  className="absolute w-[21px] h-[34px] top-[235px] left-[60px]"
                  alt="Vector"
                  src="/assets/images/signup/vector-1.png"
                />
                <img
                  className="absolute w-7 h-[30px] top-[380px] left-[122px]"
                  alt="Cursor"
                  src="/assets/images/signup/cursor.svg"
                />
              </div>
              <div className="flex flex-col w-[182px] h-[118px] items-start gap-2.5 absolute top-[377px] left-[365px]">
                <div className="relative w-[163px] h-[40.75px] bg-[#ffffff26] rounded-[5px]">
                  <img
                    className="absolute w-[162px] h-[41px] top-0 left-px object-cover"
                    alt="Gestion materiel"
                    src="/assets/images/signup/gestion-mate-riel-1.png"
                  />
                </div>
                <div className="relative w-[163px] h-[40.75px] bg-[#ffffff26] rounded-[5px]">
                  <img
                    className="absolute w-[162px] h-[41px] top-0 left-px object-cover"
                    alt="Gestion materiel"
                    src="/assets/images/signup/gestion-mate-riel-1-1.png"
                  />
                </div>
                <div className="inline-flex items-center gap-0.5 relative flex-[0_0_auto]">
                  <div className="bg-[#ffffff26] relative w-1 h-1 rounded-sm" />
                  <div className="bg-[#ffffff26] relative w-1 h-1 rounded-sm" />
                  <div className="bg-[#ffffff26] relative w-1 h-1 rounded-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Vector Arrow */}
          <img
            className="absolute w-[34px] h-[21px] top-[359px] left-[480px]"
            alt="Vector"
            src="/assets/images/signup/vector.png"
          />

          {/* Text Content */}
          <div className="flex flex-col items-center gap-5 relative self-stretch w-full">
            <h2 className="relative w-[428px] h-[70px] mt-[-1.00px] [font-family:'Neo_Chic-Light',Helvetica] font-normal text-transparent text-[35px] text-center tracking-[0] leading-[35px]">
              <span className="font-light neochic-bold text-white">
                {t("signin.sideText.title")}
                <br />
              </span>
              <span className="neochic-bold font-medium text-white">
                {t("signin.sideText.club")}
              </span>
            </h2>
            <p className="relative w-[580px] jost-regular font-normal text-white text-lg text-center tracking-[0] leading-[18px]">
              {t("signin.sideText.description")}
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full h-screen bg-[#ffffff] lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-[#2900ff] rounded-3xl shadow-2xl p-8 lg:p-10">
              {/* Logo */}
              <div className="text-center flex flex-col items-center mb-8">
                <img
                  className="relative w-[35.59px] h-[34px]"
                  alt="Logo Icon"
                  src="/assets/images/signup/bdj_logo.png"
                />
                <div className="relative w-[230.89px] mt-16 h-[111px]">
                  <div className="w-[231px] h-[111px]">
                    <div className="relative h-[111px]">
                      <img
                        className="absolute w-[300px] top-[9px]"
                        alt="Logo Text Top"
                        src="/assets/images/signup/logo.svg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {!isSubmitted ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {t("forgotPassword.title")}
                    </h2>
                    <p className="text-gray-100 leading-relaxed">
                      {t("forgotPassword.subtitle")}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-100 mb-2"
                      >
                        {t("forgotPassword.form.emailLabel")}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-100 w-5 h-5" />
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 text-white pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-100"
                          placeholder="votre@email.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#FFFFFF] text-[#2900FF] py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-[#2900FF] text-[#2900FF] border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t("forgotPassword.form.loading")}
                        </div>
                      ) : (
                        t("forgotPassword.form.sendButton")
                      )}
                    </button>
                  </form>

                  {/* Back to login */}
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleBackToLogin}
                      className="inline-flex cursor-pointer items-center text-gray-100 hover:text-gray-200 font-medium transition-colors duration-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t("forgotPassword.form.backToLogin")}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Success state */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4">
                      {t("forgotPassword.isSend.title")}
                    </h2>

                    <p className="text-gray-100 mb-2">
                      {t("forgotPassword.isSend.subtitle")}
                    </p>

                    <p className="font-semibold text-gray-100 mb-6">{email}</p>

                    <p className="text-sm text-gray-100 mb-8">
                      {t("forgotPassword.isSend.description")}
                    </p>

                    <div className="space-y-4">
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="w-full bg-[#FFFFFF] text-[#2900FF] py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {t("forgotPassword.isSend.resend")}
                      </button>

                      <button
                        onClick={handleBackToLogin}
                        className="w-full text-white hover:text-gray-100 font-medium py-2 transition-colors duration-200"
                      >
                        {t("forgotPassword.form.backToLogin")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-white/80 text-sm">
                {t("forgotPassword.help.title")}{" "}
                <a
                  href="#"
                  className="text-white hover:text-white/90 font-medium underline transition-colors duration-200"
                >
                  {t("forgotPassword.help.description")}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordScreen;
