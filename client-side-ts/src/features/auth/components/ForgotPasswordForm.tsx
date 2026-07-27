import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import logo from "@/assets/logo_forms_100x100.png";

const formSchema = z.object({
  id: z.string().min(8, "ID Number must at least be 8 digits."),
  email: z.string().email("Please enter a valid email address."),
});

export type ForgotPasswordCredentials = z.infer<typeof formSchema>;

export interface ForgotPasswordFormProps {
  onSubmit?: (values: ForgotPasswordCredentials) => void;
}

export default function ForgotPasswordForm({
  onSubmit,
}: ForgotPasswordFormProps) {
  const form = useForm({
    defaultValues: {
      id: "",
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }: { value: ForgotPasswordCredentials }) =>
      onSubmit && onSubmit(value),
  });

  return (
    <Card className="w-full border-none shadow-none sm:max-w-md">
      <CardHeader className="mb-[12px] flex flex-col items-center space-y-2 text-center">
        {/* Logo Placeholder */}
        <div className="mb-4 flex h-18 w-18 items-center justify-center overflow-hidden rounded-full bg-slate-100">
          <img src={logo} alt="Logo" className="h-full w-full object-cover" />
        </div>
        <CardTitle className="text-4xl font-semibold">
          Forgot Password
        </CardTitle>
        <CardDescription>
          Enter your student ID number to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="forgot-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="id"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Student ID Number
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter your student ID number"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter your email address"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Field orientation="horizontal">
          <Button type="submit" form="forgot-password-form" className="w-full">
            Reset Password
          </Button>
        </Field>
        <p className="mt-2 flex flex-row items-center justify-center text-sm font-extralight text-gray-300">
          Remember your password?&nbsp;
          <Link to="/auth/login" className="text-black">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
