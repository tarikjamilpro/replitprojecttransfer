import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Shield, LogOut, Sparkles, Wrench, ArrowRight } from "lucide-react";

interface SessionUser {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    document.title = "Dashboard • DigiBest Tools";
    const raw = localStorage.getItem("user");
    if (!raw) {
      setLocation("/login");
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem("user");
      setLocation("/login");
    }
  }, [setLocation]);

  const logout = () => {
    localStorage.removeItem("user");
    setLocation("/login");
  };

  if (!user) return null;

  const displayName = user.firstName?.trim() || user.username;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">DigiBest Tools</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Hi, <strong data-testid="text-user-name">{displayName}</strong>
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {displayName}!
          </h1>
          <p className="text-gray-600 mt-1">You're signed in. Jump back into your tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/"
            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            data-testid="card-link-tools"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <Wrench className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Browse all tools</h3>
            <p className="text-sm text-gray-500 mb-3">49+ free SEO &amp; utility tools.</p>
            <span className="text-sm font-medium text-purple-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Open <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            href="/prompts"
            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            data-testid="card-link-prompts"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Prompt Gallery</h3>
            <p className="text-sm text-gray-500 mb-3">Explore curated AI prompts.</p>
            <span className="text-sm font-medium text-violet-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Open <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Account</div>
            <div className="font-semibold text-gray-900 truncate">{user.email}</div>
            <div className="text-xs text-gray-400 mt-1">@{user.username}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
