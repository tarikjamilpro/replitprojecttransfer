import { useState, useCallback } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, RefreshCw, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export default function PasswordGenerator() {
  const toolSEO = getToolSEO("/password-generator");
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const { toast } = useToast();

  const generatePassword = useCallback(() => {
    let charset = "";
    if (options.uppercase) charset += CHAR_SETS.uppercase;
    if (options.lowercase) charset += CHAR_SETS.lowercase;
    if (options.numbers) charset += CHAR_SETS.numbers;
    if (options.symbols) charset += CHAR_SETS.symbols;

    if (!charset) {
      toast({
        title: "No character types selected",
        description: "Please select at least one character type.",
        variant: "destructive",
      });
      return;
    }

    let newPassword = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    setPassword(newPassword);
  }, [length, options, toast]);

  const handleCopy = async () => {
    if (!password) {
      toast({
        title: "No password to copy",
        description: "Generate a password first.",
        variant: "destructive",
      });
      return;
    }
    await navigator.clipboard.writeText(password);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard.",
    });
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getPasswordStrength = () => {
    if (!password) return { label: "None", color: "text-muted-foreground", icon: Shield };
    
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: "Weak", color: "text-destructive", icon: ShieldAlert };
    if (score <= 4) return { label: "Medium", color: "text-yellow-500", icon: Shield };
    return { label: "Strong", color: "text-green-500", icon: ShieldCheck };
  };

  const strength = getPasswordStrength();
  const StrengthIcon = strength.icon;

  return (
    <ToolPageLayout
      title="Password Generator"
      description="Generate secure, random passwords with customizable length and character types."
      toolPath="/password-generator"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Adjust the password length using the slider (8-64 characters).</li>
          <li>Select which character types to include (uppercase, lowercase, numbers, symbols).</li>
          <li>Click "Generate Password" to create a new secure password.</li>
          <li>Click the Copy button to copy the password to your clipboard.</li>
        </ol>
      }
    >
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Input
                value={password}
                readOnly
                placeholder="Click 'Generate Password' to create one"
                className="font-mono text-lg flex-1"
                data-testid="output-password"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                disabled={!password}
                data-testid="button-copy"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                onClick={generatePassword}
                data-testid="button-regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            {password && (
              <div className={`flex items-center gap-2 mt-3 ${strength.color}`}>
                <StrengthIcon className="w-4 h-4" />
                <span className="text-sm font-medium" data-testid="text-strength">
                  Password Strength: {strength.label}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label>Password Length</Label>
              <span className="text-sm font-medium text-foreground" data-testid="text-length">
                {length} characters
              </span>
            </div>
            <Slider
              value={[length]}
              onValueChange={([val]) => setLength(val)}
              min={8}
              max={64}
              step={1}
              className="w-full"
              data-testid="slider-length"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>8</span>
              <span>64</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={options.uppercase}
                onCheckedChange={() => toggleOption("uppercase")}
                data-testid="checkbox-uppercase"
              />
              <Label htmlFor="uppercase" className="cursor-pointer">
                Uppercase (A-Z)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={options.lowercase}
                onCheckedChange={() => toggleOption("lowercase")}
                data-testid="checkbox-lowercase"
              />
              <Label htmlFor="lowercase" className="cursor-pointer">
                Lowercase (a-z)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={options.numbers}
                onCheckedChange={() => toggleOption("numbers")}
                data-testid="checkbox-numbers"
              />
              <Label htmlFor="numbers" className="cursor-pointer">
                Numbers (0-9)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={options.symbols}
                onCheckedChange={() => toggleOption("symbols")}
                data-testid="checkbox-symbols"
              />
              <Label htmlFor="symbols" className="cursor-pointer">
                Symbols (!@#$...)
              </Label>
            </div>
          </div>
        </div>

        <Button
          onClick={generatePassword}
          className="w-full"
          size="lg"
          data-testid="button-generate"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate Password
        </Button>
      </div>
    </ToolPageLayout>
  );
}
