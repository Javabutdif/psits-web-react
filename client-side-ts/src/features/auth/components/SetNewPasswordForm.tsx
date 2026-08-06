import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import logo from "@/assets/logo_forms_100x100.png";
import { Check } from "lucide-react";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must include at least one small letter")
      .regex(/[A-Z]/, "Must include at least one capital letter")
      .regex(/[\d\W]/, "Must include at least one number or symbol"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SetNewPasswordCredentials = z.infer<typeof formSchema>;

export interface SetNewPasswordFormProps {
  onResetPassword?: (values: SetNewPasswordCredentials) => void;
  onBack?: () => void;
}

const inputClasses =
  "peer h-12 rounded-xl border-gray-200 bg-transparent px-3 text-gray-900 placeholder-transparent focus:border-sky-500 focus:outline-none focus-visible:border-sky-500 focus-visible:ring-0";

const floatingLabelClasses =
  "pointer-events-none absolute top-0 left-3 -translate-y-1/2 cursor-text bg-white px-1 text-xs text-sky-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-sky-500";

export default function SetNewPasswordForm({
  onResetPassword,
  onBack,
}: SetNewPasswordFormProps) {
  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    } as SetNewPasswordCredentials,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }: { value: SetNewPasswordCredentials }) =>
      onResetPassword && onResetPassword(value),
  });

  return (
    <Card className="w-full border-none shadow-none sm:max-w-md">
      <CardHeader className="mb-[12px] flex flex-col items-center space-y-2 text-center">
        <div className="mb-4 flex h-18 w-18 items-center justify-center overflow-hidden rounded-full bg-slate-100">
          <img src={logo} alt="Logo" className="h-full w-full object-cover" />
        </div>
        <CardTitle className="text-4xl font-semibold tracking-tight text-gray-900">
          Set New Password
        </CardTitle>
        <CardDescription className="text-base text-gray-500">
          Enter your email and ID number to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <form
          id="set-new-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <FieldGroup>
            <FieldSet>
              {/* New Password */}
              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="space-y-0">
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder=" "
                          autoComplete="off"
                          className={inputClasses}
                        />
                        <label
                          htmlFor={field.name}
                          className={floatingLabelClasses}
                        >
                          New Password
                        </label>
                      </div>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              {/* Confirm Password */}
              <form.Field
                name="confirmPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="space-y-0">
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder=" "
                          autoComplete="off"
                          className={inputClasses}
                        />
                        <label
                          htmlFor={field.name}
                          className={floatingLabelClasses}
                        >
                          Confirm New Password
                        </label>
                      </div>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              {/* Password requirements checklist */}
              <form.Subscribe selector={(state) => state.values.password}>
                {(password) => {
                  const requirements = [
                    {
                      label: "At least 8 characters",
                      met: password.length >= 8,
                    },
                    {
                      label: "At least one small letter",
                      met: /[a-z]/.test(password),
                    },
                    {
                      label: "At least one capital letter",
                      met: /[A-Z]/.test(password),
                    },
                    {
                      label: "At least one number or symbol",
                      met: /[\d\W]/.test(password),
                    },
                  ];

                  return (
                    <div className="-mt-2 flex flex-col gap-1 text-sm text-gray-600">
                      {requirements.map((req) => (
                        <div
                          key={req.label}
                          className="flex items-center gap-2"
                        >
                          <Check
                            className={`h-4 w-4 ${req.met ? "text-green-500" : "text-gray-300"}`}
                          />
                          <p
                            className={`text-xs ${req.met ? "text-green-600" : "text-gray-500"}`}
                          >
                            {req.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                }}
              </form.Subscribe>
            </FieldSet>

            <Field orientation="vertical">
              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-[#1C9DDE] text-base font-semibold shadow-sm hover:bg-sky-600"
              >
                Reset Password
              </Button>
              {onBack ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="h-11 w-full rounded-full text-base font-medium text-gray-700"
                >
                  Back
                </Button>
              ) : (
                <Link to="/auth/login">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-full text-base font-medium text-gray-700"
                  >
                    Back to sign in
                  </Button>
                </Link>
              )}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
