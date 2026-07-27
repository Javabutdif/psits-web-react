import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import logo from "@/assets/logo_forms_100x100.png";
import { Check } from "lucide-react";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
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
        {/* Logo Placeholder */}
        <div className="mb-4 flex h-18 w-18 items-center justify-center overflow-hidden rounded-full bg-slate-100">
          <img src={logo} alt="Logo" className="h-full w-full object-cover" />
        </div>
        <CardTitle className="text-4xl font-semibold">
          Set New Password
        </CardTitle>
        <CardDescription>
          Enter your email and ID number to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="set-new-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
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
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter new password"
                        autoComplete="off"
                      />
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
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Confirm New Password
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter password again"
                        autoComplete="off"
                      />
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
                    <div className="-mt-3 flex flex-col gap-1 text-sm text-gray-600">
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
            <Field orientation="vertical" className="-mb-3">
              <Button type="submit">Reset Password</Button>
            </Field>
            <Field orientation="vertical">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                asChild={!onBack}
              >
                {onBack ? "Back" : <Link to="/auth/login">Back</Link>}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
