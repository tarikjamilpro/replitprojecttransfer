import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Calculator } from "lucide-react";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
}

function calculateAge(birthDate: Date, toDate: Date): AgeResult | null {
  if (birthDate > toDate) return null;

  let years = toDate.getFullYear() - birthDate.getFullYear();
  let months = toDate.getMonth() - birthDate.getMonth();
  let days = toDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const diffTime = Math.abs(toDate.getTime() - birthDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;

  return { years, months, days, totalDays, totalWeeks, totalMonths };
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function AgeCalculator() {
  const toolSEO = getToolSEO("/age-calculator");
  const [birthDate, setBirthDate] = useState("");
  const [toDate, setToDate] = useState(formatDate(new Date()));
  const [result, setResult] = useState<AgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    if (!birthDate) {
      setError("Please enter your date of birth");
      return;
    }

    const birth = new Date(birthDate);
    const to = new Date(toDate);

    if (isNaN(birth.getTime())) {
      setError("Invalid date of birth");
      return;
    }

    if (birth > to) {
      setError("Date of birth cannot be in the future");
      return;
    }

    const ageResult = calculateAge(birth, to);
    setResult(ageResult);
  };

  return (
    <ToolPageLayout
      title="Age Calculator"
      description="Calculate your exact age in years, months, and days. Find out how old you are down to the day."
      toolPath="/age-calculator"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter your date of birth using the date picker.</li>
          <li>Optionally change the "Calculate to" date (defaults to today).</li>
          <li>Click "Calculate Age" to see your exact age.</li>
          <li>View your age in years, months, days, and other formats.</li>
        </ol>
      }
    >
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birth-date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </Label>
                <Input
                  id="birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={toDate}
                  className="w-full"
                  data-testid="input-birth-date"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="to-date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Calculate to Date
                </Label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full"
                  data-testid="input-to-date"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-destructive text-sm font-medium" data-testid="error-message">
                {error}
              </p>
            )}

            <Button
              onClick={handleCalculate}
              className="mt-6 w-full md:w-auto"
              data-testid="button-calculate"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Age
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-primary" data-testid="result-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-center mb-6">Your Age</h3>
              
              <div className="grid grid-cols-3 gap-4 text-center mb-8">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-3xl md:text-4xl font-bold text-primary" data-testid="result-years">
                    {result.years}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Years</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-3xl md:text-4xl font-bold text-primary" data-testid="result-months">
                    {result.months}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Months</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-3xl md:text-4xl font-bold text-primary" data-testid="result-days">
                    {result.days}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Days</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total months:</span>
                  <span className="font-medium">{result.totalMonths.toLocaleString()} months</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total weeks:</span>
                  <span className="font-medium">{result.totalWeeks.toLocaleString()} weeks</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Total days:</span>
                  <span className="font-medium">{result.totalDays.toLocaleString()} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
