import { BackgroundText } from "@/components/common/BackgroundText";
import { useAuth } from "@/features/auth";
import { AlertCircle, Home } from "lucide-react";
import React from "react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

export const ErrorPage: React.FC = () => {
  const error = useRouteError();
  const { user, isAuthenticated } = useAuth();

  let errorMessage: string = "An unexpected error occurred.";
  let errorTitle: string = "Oops! Something went wrong.";
  let statusCode: string | number = "Error";

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    if (error.status === 404) {
      errorTitle = "Page Not Found";
      errorMessage = "Sorry, we couldn't find the page you're looking for.";
    } else {
      errorTitle = error.statusText || "Error";
      errorMessage = error.data?.message || "Something went wrong.";
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    statusCode =
      "status" in error && typeof error.status === "number"
        ? error.status
        : 500;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  const dashboardHref =
    isAuthenticated && user
      ? user.role === "admin"
        ? "/admin/events"
        : "/student/event-attendance"
      : "/";

  return (
    <div className="bg-background text-foreground animate-in fade-in relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 text-center font-sans duration-500 select-none">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-primary-100/20 absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl" />
      </div>

      <div className="relative mb-8">
        <div className="animate-in zoom-in inline-block rounded-full bg-red-50 p-6 shadow-sm ring-8 ring-red-50/50 duration-300">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <BackgroundText
          text={statusCode.toString()}
          parentStyle="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full text-center scale-150"
          childStyle="text-transparent bg-clip-text bg-gradient-to-br from-primary/20 to-primary/5"
        />
      </div>

      <div className="z-10 max-w-lg space-y-4">
        <h2 className="text-4xl font-bold tracking-tight">{errorTitle}</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {errorMessage}
        </p>

        <div className="pt-8">
          <Link
            to={dashboardHref ?? "/"}
            className="btn btn-primary hover:shadow-primary/25 gap-2 shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <Home className="h-5 w-5" />
            {dashboardHref
              ? user?.role === "admin"
                ? "Admin Dashboard"
                : "My Dashboard"
              : "Back to Home"}
          </Link>
        </div>

        <BackgroundText
          text="404"
          parentStyle="absolute -top-16 sm:-top-24 md:-top-32 lg:-top-44 xl:-top-56 left-1/2 -translate-x-1/2 w-full text-center -z-10"
          childStyle="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/80"
        />
        <BackgroundText
          text="PSITS"
          parentStyle="absolute -bottom-16 sm:-bottom-24 md:-bottom-32 lg:-bottom-44 xl:-bottom-56 left-1/2 -translate-x-1/2 w-full text-center -z-10"
          childStyle="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/80"
        />
      </div>
    </div>
  );
};
