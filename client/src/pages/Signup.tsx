import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Shield, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Sign Up • DigiBest Tools";
    if (localStorage.getItem("user")) setLocation("/dashboard");
  }, [setLocation]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Account created! Redirecting to sign in…");
        setTimeout(() => setLocation("/login"), 1200);
      } else {
        setError(data.message || "Could not create account");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1e7ff 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow flex items-center justify-center border border-purple-100">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1">Join DigiBest Tools today</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={form.firstName}
                onChange={update("firstName")}
                required
                className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400"
                data-testid="input-firstname"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={form.lastName}
                onChange={update("lastName")}
                required
                className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400"
                data-testid="input-lastname"
              />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={update("username")}
              required
              minLength={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400"
              data-testid="input-signup-username"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={update("email")}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400"
              data-testid="input-signup-email"
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={update("password")}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400"
              data-testid="input-signup-password"
            />

            {error && (
              <div
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700"
                data-testid="text-signup-error"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div
                className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-700"
                data-testid="text-signup-success"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
              data-testid="button-signup-submit"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating account…" : "Create Account"}
            </button>
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-600 font-medium hover:underline" data-testid="link-login">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
