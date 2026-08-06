import sidePhoto from "@/assets/side_photo_forms.png";

import { useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import backendConnection from "@/api/backendApi";
import {
  SetNewPasswordForm,
  type SetNewPasswordCredentials,
} from "@/features/auth";

export default function SetNewPassword() {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const token = searchParams.get("token") || routeParams.token;
  const navigate = useNavigate();
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleSetNewPassword = async (values: SetNewPasswordCredentials) => {
    if (!token) {
      setMessage({ type: "error", text: "Invalid or missing reset token." });
      return;
    }

    try {
      const response = await fetch(
        `${backendConnection()}/api/student/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: values.password }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data?.message || "Something went wrong.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Password updated!",
      });
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch {
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    }
  };

  return (
    <div className="flex h-screen w-screen flex-row bg-gray-300">
      <div className="flex w-full items-center justify-center bg-white md:w-1/2">
        <div className="w-full max-w-md">
          {message && (
            <p
              className={`mb-4 text-center text-sm ${
                message.type === "error" ? "text-red-500" : "text-green-600"
              }`}
            >
              {message.text}
            </p>
          )}
          <SetNewPasswordForm onResetPassword={handleSetNewPassword} />
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="hidden h-full w-1/2 md:flex">
        <img
          src={sidePhoto}
          alt="Login visual"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
