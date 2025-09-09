"use client";

import { Button } from "@/modules/shared/presentation/components/form/button";
import {
  Card,
  CardContent,
} from "@/modules/shared/presentation/components/form/card";
import { Checkbox } from "@/modules/shared/presentation/components/form/checkbox";
import { Input } from "@/modules/shared/presentation/components/form/input";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SignInScreenProps = {
  isLoading: boolean;
  onSubmit: (data: any) => void;
  register: any;
  errors: any;
  message: string | null;
};

function SignInScreen({
  isLoading,
  onSubmit,
  register,
  errors,
  message,
}: SignInScreenProps) {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <div className="w-full relative">
      <div className="relative w-full flex gap-10 justify-between">
        <img
          className="absolute w-full h-[90vh] top-0 left-0"
          alt="Background"
          src="/assets/images/signup/group-1171275431.png"
        />

        {/* Login Card */}
        <Card className="w-1/2 h-[95vh] bg-neutral-100 rounded-[10px] border-none shadow-none">
          <CardContent className="p-0 h-full flex items-center justify-center gap-50 flex-col">
            {/* Logo */}
            <div className="flex flex-col w-[231px] justify-center items-center">
              <img
                className="relative w-[35.59px] h-[34px]"
                alt="Logo Icon"
                src="/assets/images/signup/group-110.png"
              />
              <div className="relative w-[230.89px] h-[111px]">
                <div className="w-[231px] h-[111px]">
                  <div className="relative h-[111px]">
                    <img
                      className="absolute w-[182px] h-[49px] top-[9px] left-[49px]"
                      alt="Logo Text Top"
                      src="/assets/images/signup/group.png"
                    />
                    <img
                      className="absolute w-[215px] h-[50px] top-[61px] left-[15px]"
                      alt="Logo Text Bottom"
                      src="/assets/images/signup/group-1.png"
                    />
                    <img
                      className="absolute w-[55px] h-[72px] top-0 left-0"
                      alt="Logo Vector"
                      src="/assets/images/signup/vector-2.svg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form
              onSubmit={onSubmit}
              className="flex flex-col w-[580px] items-start"
            >
              {/* Header */}
              <div className="flex flex-col items-start gap-[5px] mb-8 relative self-stretch w-full">
                <h1 className="relative self-stretch mt-[-1.00px] neochic-bold font-normal text-[#141414] text-[35px] tracking-[0] leading-[35px]">
                  {t("signin.title")}
                  <br />
                  {t("signin.club")}
                </h1>
                <p className="relative self-stretch jost-regular font-normal text-[#838383] text-[21px] tracking-[0] leading-4">
                  {t("signin.subtitle")}
                </p>
              </div>

              {/* Input Fields */}
              <div className="flex flex-col items-start gap-5 relative self-stretch w-full">
                {message && (
                  <div className="flex flex-col items-start w-full bg-red-400 p-4 rounded-lg gap-2.5 relative self-stretch w-full">
                    <p className="mt-1 text-sm text-white">{message}</p>
                  </div>
                )}
                {/* Email Input */}
                <div className="flex items-center gap-2.5 p-2.5 relative self-stretch w-full">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                    <MailIcon className="w-6 h-6 text-[#2900ff]" />
                  </div>
                  <Input
                    className="border-none bg-[#14141408] pl-12 py-4 pr-4 h-auto font-jost placeholder:italic text-[#2900ff] text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                    type="email"
                    placeholder={t("signin.form.emailLabel")}
                    id="email"
                    {...register("email", {
                      required: t("signin.form.emailForm.required"),
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full">
                  <div className="flex items-center gap-2.5 p-2.5 relative self-stretch w-full">
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                      <LockIcon className="w-6 h-6 text-[#2900ff]" />
                    </div>
                    <Input
                      id="password"
                      className="border-none bg-[#14141408] pl-12 py-4 pr-4 h-auto  font-jost placeholder:italic text-[#2900ff] text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("signin.form.passwordLabel")}
                      {...register("password", {
                        required: t("signin.form.passwordForm.required"),
                        minLength: {
                          value: 8,
                          message: t("signin.form.passwordForm.minLength"),
                        },
                      })}
                    />

                    <div
                      className="p-0 cursor-pointer h-6 w-6 absolute right-6 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-6 w-6 text-[#2900ff]" />
                      ) : (
                        <EyeIcon className="h-6 w-6 text-[#2900ff]" />
                      )}
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div
                    onClick={() => router.push("/auth/forgot-password")}
                    className="relative self-stretch jost-italic italic font-normal text-[#838383] text-sm text-right tracking-[0.14px] leading-[14px] cursor-pointer"
                  >
                    {t("signin.form.forgotPassword")}
                  </div>
                </div>
              </div>

              {/* Remember Me & Login Button */}
              <div className="flex flex-col items-start gap-5 relative self-stretch w-full">
                <div className="flex w-[328px] items-center gap-2.5 relative">
                  <Checkbox
                    id="remember"
                    className="w-6 h-6 rounded-sm data-[state=checked]:bg-[#2900ff] border-[#2900ff]"
                  />
                  <label
                    htmlFor="remember"
                    className="relative jost-regular flex-1 [font-family:'Jost',Helvetica] font-normal text-[#141414] text-lg tracking-[0] leading-[15px] cursor-pointer"
                  >
                    {t("signin.form.rememberMe")}
                  </label>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex cursor-pointer items-center justify-center gap-2.5 px-2.5 py-6 relative self-stretch w-full bg-[#2900ff] rounded-[10px] hover:bg-[#2200d6]"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("signin.form.loading")}
                    </div>
                  ) : (
                    <span className="relative w-fit mt-[-1.00px] neochic-bold font-medium text-white text-lg tracking-[0] leading-[normal] whitespace-nowrap">
                      {t("signin.form.loginButton")}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Side - Dashboard Preview */}
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
              <span className="font-light text-white">
                {t("signin.sideText.title")}
                <br />
              </span>
              <span className="[font-family:'Neo_Chic-Medium',Helvetica] font-medium text-white">
                {t("signin.sideText.club")}
              </span>
              <span className="[font-family:'Neo_Chic-Medium',Helvetica] font-medium text-white text-3xl">
                ✨
              </span>
            </h2>
            <p className="relative w-[580px] [font-family:'Jost',Helvetica] font-normal text-white text-lg text-center tracking-[0] leading-[18px]">
              {t("signin.sideText.description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInScreen;
