import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Scale, Ruler, ArrowDown } from "lucide-react";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

type UnitSystem = "metric" | "imperial";

interface BMIResult {
  value: number;
  category: "underweight" | "normal" | "overweight" | "obese";
  message: string;
}

const getBMICategory = (bmi: number): BMIResult => {
  if (bmi < 18.5) {
    return {
      value: bmi,
      category: "underweight",
      message: "You are underweight. Consider consulting a healthcare provider about nutrition to reach a healthier weight.",
    };
  } else if (bmi < 25) {
    return {
      value: bmi,
      category: "normal",
      message: "Great job! Your weight is in the healthy range. Keep maintaining your balanced lifestyle!",
    };
  } else if (bmi < 30) {
    return {
      value: bmi,
      category: "overweight",
      message: "You are slightly above the ideal weight range. Consider a balanced diet and regular exercise.",
    };
  } else {
    return {
      value: bmi,
      category: "obese",
      message: "Your BMI indicates obesity. We recommend consulting a healthcare professional for personalized guidance.",
    };
  }
};

const categoryColors = {
  underweight: "text-blue-600",
  normal: "text-green-600",
  overweight: "text-orange-500",
  obese: "text-red-600",
};

const categoryLabels = {
  underweight: "Underweight",
  normal: "Normal",
  overweight: "Overweight",
  obese: "Obese",
};

export default function BMICalculator() {
  const toolSEO = getToolSEO("/bmi-calculator");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);

  const calculateBMI = () => {
    let weight: number;
    let heightM: number;

    if (unitSystem === "metric") {
      weight = parseFloat(weightKg);
      heightM = parseFloat(heightCm) / 100;
    } else {
      weight = parseFloat(weightLbs) * 0.453592;
      const totalInches = parseFloat(heightFeet) * 12 + parseFloat(heightInches || "0");
      heightM = totalInches * 2.54 / 100;
    }

    if (isNaN(weight) || isNaN(heightM) || weight <= 0 || heightM <= 0) {
      return;
    }

    const bmi = weight / (heightM * heightM);
    setResult(getBMICategory(bmi));
  };

  const isFormValid = () => {
    if (unitSystem === "metric") {
      return weightKg && heightCm && parseFloat(weightKg) > 0 && parseFloat(heightCm) > 0;
    } else {
      return weightLbs && heightFeet && parseFloat(weightLbs) > 0 && parseFloat(heightFeet) > 0;
    }
  };

  const getIndicatorPosition = (bmi: number): number => {
    const clampedBMI = Math.max(15, Math.min(40, bmi));
    return ((clampedBMI - 15) / 25) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">BMI Calculator</h1>
          </div>
          <p className="text-muted-foreground">Calculate your Body Mass Index to check if you're at a healthy weight</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50">
                <button
                  onClick={() => setUnitSystem("metric")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    unitSystem === "metric"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  data-testid="button-metric"
                >
                  Metric (kg & cm)
                </button>
                <button
                  onClick={() => setUnitSystem("imperial")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    unitSystem === "imperial"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  data-testid="button-imperial"
                >
                  Imperial (lbs & ft)
                </button>
              </div>
            </div>

            {unitSystem === "metric" ? (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="weight-kg" className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight-kg"
                    type="number"
                    placeholder="70"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    data-testid="input-weight-kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height-cm" className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height-cm"
                    type="number"
                    placeholder="175"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    data-testid="input-height-cm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="weight-lbs" className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Weight (lbs)
                  </Label>
                  <Input
                    id="weight-lbs"
                    type="number"
                    placeholder="154"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(e.target.value)}
                    data-testid="input-weight-lbs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height-feet" className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Height (feet)
                  </Label>
                  <Input
                    id="height-feet"
                    type="number"
                    placeholder="5"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    data-testid="input-height-feet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height-inches">Inches</Label>
                  <Input
                    id="height-inches"
                    type="number"
                    placeholder="9"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    data-testid="input-height-inches"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={calculateBMI}
              disabled={!isFormValid()}
              className="w-full"
              size="lg"
              data-testid="button-calculate"
            >
              <Activity className="w-4 h-4 mr-2" />
              Calculate BMI
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
                <p className={`text-5xl font-bold ${categoryColors[result.category]}`} data-testid="text-bmi-value">
                  {result.value.toFixed(1)}
                </p>
                <p className={`text-lg font-medium ${categoryColors[result.category]} mt-1`} data-testid="text-bmi-category">
                  {categoryLabels[result.category]}
                </p>
              </div>

              <div className="mb-6">
                <div className="relative h-8 rounded-full overflow-hidden flex">
                  <div className="flex-1 bg-blue-500" title="Underweight" />
                  <div className="flex-1 bg-green-500" title="Normal" />
                  <div className="flex-1 bg-orange-500" title="Overweight" />
                  <div className="flex-1 bg-red-500" title="Obese" />
                </div>
                <div className="relative h-6">
                  <div
                    className="absolute -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${getIndicatorPosition(result.value)}%` }}
                  >
                    <ArrowDown className="w-5 h-5 text-foreground -mb-1" />
                    <span className="text-xs font-medium">{result.value.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>15</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
                <div className="flex text-xs mt-2 gap-4 justify-center">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500"></span> Underweight</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> Normal</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500"></span> Overweight</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> Obese</span>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                result.category === "underweight" ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800" :
                result.category === "normal" ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800" :
                result.category === "overweight" ? "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800" :
                "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
              }`}>
                <p className="text-sm" data-testid="text-health-advice">{result.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-3">What is BMI?</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Body Mass Index (BMI) is a simple measure that uses your height and weight to estimate whether you're at a healthy weight. 
              It's calculated by dividing your weight in kilograms by your height in meters squared (kg/m²).
            </p>
            <h3 className="font-medium mb-2">BMI Categories:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li><span className="text-blue-600 font-medium">Underweight:</span> BMI less than 18.5</li>
              <li><span className="text-green-600 font-medium">Normal weight:</span> BMI 18.5 to 24.9</li>
              <li><span className="text-orange-500 font-medium">Overweight:</span> BMI 25 to 29.9</li>
              <li><span className="text-red-600 font-medium">Obese:</span> BMI 30 or greater</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Note: BMI is a screening tool, not a diagnostic measure. It doesn't account for factors like muscle mass, bone density, or body composition. 
              Consult a healthcare provider for a comprehensive health assessment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
