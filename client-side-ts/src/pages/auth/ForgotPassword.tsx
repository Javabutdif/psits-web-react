import sidePhoto from "@/assets/side_photo_forms.png";

import {
  ForgotPasswordForm,
  type ForgotPasswordCredentials,
} from "@/features/auth";
import { forgotPassword } from "@/features/auth/api/forgot";

export default function ForgotPassword() {
  const handleForgotPassword = (_values: ForgotPasswordCredentials) => {
    forgotPassword(_values.email, _values.id);
  };

  return (
    <div className="flex h-screen w-screen flex-row bg-gray-300">
      <div className="flex w-full items-center justify-center bg-white md:w-1/2">
        <ForgotPasswordForm onSubmit={handleForgotPassword} />
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
