import { useState } from "react";
import { SignupForm, type SignupCredentials } from "@/features/auth";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import sidePhoto from "@/assets/side_photo_forms.png";
import { useNavigate } from "react-router";
const courses = ["BSIT", "BSCS"];
import { showToast } from "@/utils/alertHelper";

export default function Signup() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (values: SignupCredentials) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v2/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(
          "error",
          data.message || "Something went wrong. Please try again."
        );
        console.error(data.message);
        return;
      }
      showToast("success", "Welcome! Your PSITS account is ready.");
      navigate("/auth/login");
    } catch (err) {
      console.error(err);
      showToast("error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen flex-row bg-gray-300">
      <Link
        to="/"
        className="absolute top-4 left-4 z-50 flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-sky-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="flex w-full items-center justify-center bg-white md:w-1/2">
        <SignupForm
          onSignup={handleSignup}
          courses={courses}
          isSubmitting={isSubmitting}
        />
      </div>
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
