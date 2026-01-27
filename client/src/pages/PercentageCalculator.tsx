import { useState, useEffect } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Percent } from "lucide-react";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

export default function PercentageCalculator() {
  const toolSEO = getToolSEO("/percentage-calculator");
  const [percentOf, setPercentOf] = useState({ percent: "", number: "" });
  const [whatPercent, setWhatPercent] = useState({ value: "", total: "" });
  const [percentOfResult, setPercentOfResult] = useState<string | null>(null);
  const [whatPercentResult, setWhatPercentResult] = useState<string | null>(null);

  useEffect(() => {
    const p = parseFloat(percentOf.percent);
    const n = parseFloat(percentOf.number);
    if (!isNaN(p) && !isNaN(n)) {
      const result = (p / 100) * n;
      setPercentOfResult(result.toLocaleString(undefined, { maximumFractionDigits: 4 }));
    } else {
      setPercentOfResult(null);
    }
  }, [percentOf]);

  useEffect(() => {
    const v = parseFloat(whatPercent.value);
    const t = parseFloat(whatPercent.total);
    if (!isNaN(v) && !isNaN(t) && t !== 0) {
      const result = (v / t) * 100;
      setWhatPercentResult(result.toLocaleString(undefined, { maximumFractionDigits: 4 }) + "%");
    } else {
      setWhatPercentResult(null);
    }
  }, [whatPercent]);

  return (
    <ToolPageLayout
      title="Percentage Calculator"
      description="Calculate percentages instantly. Find what percent a number is of another, or calculate a percentage of any number."
      toolPath="/percentage-calculator"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Use "Percentage of a Number" to find X% of any number.</li>
          <li>Use "What Percent?" to find what percentage one number is of another.</li>
          <li>Results calculate instantly as you type.</li>
          <li>Supports decimal numbers for precise calculations.</li>
        </ol>
      }
    >
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Percent className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Percentage of a Number</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground">What is</span>
                <Input
                  type="number"
                  placeholder="X"
                  value={percentOf.percent}
                  onChange={(e) => setPercentOf({ ...percentOf, percent: e.target.value })}
                  className="w-24"
                  data-testid="input-percent-of-percent"
                />
                <span className="text-muted-foreground">% of</span>
                <Input
                  type="number"
                  placeholder="Y"
                  value={percentOf.number}
                  onChange={(e) => setPercentOf({ ...percentOf, number: e.target.value })}
                  className="w-24"
                  data-testid="input-percent-of-number"
                />
                <span className="text-muted-foreground">?</span>
              </div>

              {percentOfResult !== null && (
                <div className="p-4 bg-primary/10 rounded-lg text-center" data-testid="percent-of-result">
                  <Label className="text-sm text-muted-foreground">Result</Label>
                  <p className="text-2xl font-bold text-primary mt-1">{percentOfResult}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Percent className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">What Percent?</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  type="number"
                  placeholder="A"
                  value={whatPercent.value}
                  onChange={(e) => setWhatPercent({ ...whatPercent, value: e.target.value })}
                  className="w-24"
                  data-testid="input-what-percent-value"
                />
                <span className="text-muted-foreground">is what percent of</span>
                <Input
                  type="number"
                  placeholder="B"
                  value={whatPercent.total}
                  onChange={(e) => setWhatPercent({ ...whatPercent, total: e.target.value })}
                  className="w-24"
                  data-testid="input-what-percent-total"
                />
                <span className="text-muted-foreground">?</span>
              </div>

              {whatPercentResult !== null && (
                <div className="p-4 bg-primary/10 rounded-lg text-center" data-testid="what-percent-result">
                  <Label className="text-sm text-muted-foreground">Result</Label>
                  <p className="text-2xl font-bold text-primary mt-1">{whatPercentResult}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
