import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setRecruitmentAccessToken } from '../../api/client';
import { useAuth } from '../../features/auth/auth.context';
import { toast } from 'sonner';

type LoginResponse = {
  accessToken: string;
  user: {
    role: 'admin' | 'student';
    id: string;
  };
};

const getLandingPath = (role: LoginResponse['user']['role']) => {
  return role === 'admin' ? '/admin' : '/applications';
};

const Login = () => {
  const navigate = useNavigate();
  const { user, loading, setUser } = useAuth();
  const redirectPath = window.localStorage.getItem('redirectPath');

  const [formData, setFormData] = useState({ idNumber: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(getLandingPath(user.role), { replace: true });
    }
  }, [loading, navigate, user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post<LoginResponse>('/v2/auth/login', {
        id_number: formData.idNumber,
        password: formData.password,
      });

      const { accessToken, user: signedInUser } = response.data;
      setRecruitmentAccessToken(accessToken);
      setUser({
        id: signedInUser.id,
        idNumber: formData.idNumber,
        role: signedInUser.role,
        campus: 'UC-Main',
      });

      window.localStorage.removeItem('redirectPath');
      toast.success('Signed in successfully');

      const targetPath =
        redirectPath && redirectPath !== '/login'
          ? redirectPath
          : getLandingPath(signedInUser.role);

      navigate(targetPath, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Login failed. Please check your credentials and try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to positions
            </Link>

            <div className="surface overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-6">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  Recruitment Portal
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Sign in to continue
                </h1>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Use your PSITS credentials to manage applications, review
                  positions, and continue where you left off.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-6">
                <div className="space-y-2">
                  <label
                    htmlFor="idNumber"
                    className="text-sm font-semibold tracking-wide text-gray-900"
                  >
                    ID Number
                  </label>
                  <input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    required
                    autoComplete="username"
                    className="flex w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                    placeholder="Enter your ID number"
                    value={formData.idNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold tracking-wide text-gray-900"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="flex w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(28,157,222,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(28,157,222,0.12),transparent_30%)]" />
          <div className="relative flex w-full items-end p-10">
            <div className="surface max-w-lg border-white/60 bg-white/80 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                A cleaner recruitment flow
              </h2>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                The application form now follows the same polished visual system
                as the main PSITS frontend: soft surfaces, stronger hierarchy,
                and a calm interface that is easier to scan on desktop and
                mobile.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-gray-700">
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  Responsive layouts with consistent spacing
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  Shared cards, badges, and form controls
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  Token-backed authentication and guarded routes
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Login;
