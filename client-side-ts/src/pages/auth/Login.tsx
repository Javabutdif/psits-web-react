import sidePhoto from "@/assets/side_photo_forms.png";

import { LoginForm, useAuth, type LoginCredentials } from "@/features/auth";
import { showToast } from "@/utils/alertHelper";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "student") {
        navigate("/student/event-attendance", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (values: LoginCredentials) => {
    setIsSubmitting(true);
    try {
      const loggedInUser = await login({
        id_number: values.id,
        password: values.password,
      });

      showToast("success", "Signed in successfully");

      if (loggedInUser.role === "admin") {
        navigate("/admin/dashboard");
      } else if (loggedInUser.role === "student") {
        navigate("/student/event-attendance");
      } else {
        navigate("/");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen flex-row bg-gray-300">
      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-4 left-4 z-50 flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-sky-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Left Side: Login Form */}
      <div className="flex w-full items-center justify-center bg-white md:w-1/2">
        <LoginForm onLogin={handleLogin} isSubmitting={isSubmitting} />
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
