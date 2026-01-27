import { useState, useMemo } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Shield, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PasswordAnalysis {
  score: number;
  strength: "Weak" | "Medium" | "Strong" | "Very Strong";
  color: string;
  checks: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumbers: boolean;
    hasSymbols: boolean;
    goodLength: boolean;
  };
}

function analyzePassword(password: string): PasswordAnalysis {
  const checks = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSymbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    goodLength: password.length >= 12,
  };

  let score = 0;
  if (checks.minLength) score += 20;
  if (checks.hasLowercase) score += 15;
  if (checks.hasUppercase) score += 15;
  if (checks.hasNumbers) score += 20;
  if (checks.hasSymbols) score += 20;
  if (checks.goodLength) score += 10;

  let strength: PasswordAnalysis["strength"];
  let color: string;

  if (score < 35) {
    strength = "Weak";
    color = "bg-red-500";
  } else if (score < 60) {
    strength = "Medium";
    color = "bg-yellow-500";
  } else if (score < 85) {
    strength = "Strong";
    color = "bg-green-500";
  } else {
    strength = "Very Strong";
    color = "bg-emerald-500";
  }

  return { score, strength, color, checks };
}

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const analysis = useMemo(() => analyzePassword(password), [password]);

  const requirements = [
    { key: "minLength", label: "At least 8 characters", met: analysis.checks.minLength },
    { key: "hasLowercase", label: "Lowercase letter (a-z)", met: analysis.checks.hasLowercase },
    { key: "hasUppercase", label: "Uppercase letter (A-Z)", met: analysis.checks.hasUppercase },
    { key: "hasNumbers", label: "Number (0-9)", met: analysis.checks.hasNumbers },
    { key: "hasSymbols", label: "Special character (!@#$...)", met: analysis.checks.hasSymbols },
    { key: "goodLength", label: "12+ characters (bonus)", met: analysis.checks.goodLength },
  ];

  return (
    <ToolPageLayout
      title="Password Strength Checker"
      description="Check how strong your password is. Analyze password complexity including length, numbers, and special characters."
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter your password in the input field.</li>
          <li>The strength meter updates in real-time as you type.</li>
          <li>Check which requirements your password meets.</li>
          <li>Aim for "Strong" or "Very Strong" for better security.</li>
        </ol>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="password-input" className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Enter Password
            </Label>
            <div className="relative mt-2">
              <Input
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="Type your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12"
                data-testid="input-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {password && (
          <Card className="border-primary" data-testid="strength-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Password Strength</span>
                  <span 
                    className={`font-bold text-lg ${
                      analysis.strength === "Weak" ? "text-red-500" :
                      analysis.strength === "Medium" ? "text-yellow-500" :
                      analysis.strength === "Strong" ? "text-green-500" :
                      "text-emerald-500"
                    }`}
                    data-testid="strength-label"
                  >
                    {analysis.strength}
                  </span>
                </div>
                
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${analysis.color}`}
                    style={{ width: `${analysis.score}%` }}
                    data-testid="strength-bar"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {requirements.map((req) => (
                    <div 
                      key={req.key}
                      className={`flex items-center gap-2 text-sm ${
                        req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                      }`}
                    >
                      {req.met ? (
                        <Check className="w-4 h-4 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 shrink-0" />
                      )}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Password Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Use a mix of uppercase, lowercase, numbers, and symbols</li>
              <li>Avoid common words, names, or patterns (123456, password)</li>
              <li>Use at least 12 characters for better security</li>
              <li>Consider using a password manager for unique passwords</li>
              <li>Never reuse passwords across different accounts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
