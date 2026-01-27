import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, IndianRupee, Percent, Calendar, RotateCcw, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type TenureUnit = "years" | "months";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-IN").format(Math.round(num));
};

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(5);
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>("years");

  const tenureInMonths = tenureUnit === "years" ? tenure * 12 : tenure;

  const calculations = useMemo(() => {
    if (loanAmount <= 0 || interestRate <= 0 || tenureInMonths <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0 };
    }

    const monthlyRate = interestRate / 12 / 100;
    const n = tenureInMonths;

    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / 
                (Math.pow(1 + monthlyRate, n) - 1);
    
    const totalPayment = emi * n;
    const totalInterest = totalPayment - loanAmount;

    return {
      emi: isFinite(emi) ? emi : 0,
      totalPayment: isFinite(totalPayment) ? totalPayment : 0,
      totalInterest: isFinite(totalInterest) ? totalInterest : 0,
    };
  }, [loanAmount, interestRate, tenureInMonths]);

  const chartData = [
    { name: "Principal", value: loanAmount, color: "#3b82f6" },
    { name: "Interest", value: calculations.totalInterest, color: "#f97316" },
  ];

  const principalPercentage = calculations.totalPayment > 0 
    ? ((loanAmount / calculations.totalPayment) * 100).toFixed(1)
    : "0";
  const interestPercentage = calculations.totalPayment > 0 
    ? ((calculations.totalInterest / calculations.totalPayment) * 100).toFixed(1)
    : "0";

  const handleReset = () => {
    setLoanAmount(500000);
    setInterestRate(8.5);
    setTenure(5);
    setTenureUnit("years");
  };

  const handleLoanAmountChange = (value: string) => {
    const num = parseInt(value.replace(/,/g, "")) || 0;
    setLoanAmount(Math.min(Math.max(num, 0), 10000000));
  };

  const handleInterestChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setInterestRate(Math.min(Math.max(num, 0), 30));
  };

  const handleTenureChange = (value: string) => {
    const num = parseInt(value) || 0;
    const max = tenureUnit === "years" ? 30 : 360;
    setTenure(Math.min(Math.max(num, 0), max));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Loan EMI Calculator</h1>
          </div>
          <p className="text-muted-foreground">Calculate your monthly EMI and see the interest breakdown</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loan-amount" className="flex items-center gap-2 text-base">
                      <IndianRupee className="w-4 h-4" />
                      Loan Amount
                    </Label>
                    <span className="text-sm text-muted-foreground">Max: ₹1 Crore</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        id="loan-amount"
                        type="text"
                        value={formatNumber(loanAmount)}
                        onChange={(e) => handleLoanAmountChange(e.target.value)}
                        className="pl-8"
                        data-testid="input-loan-amount"
                      />
                    </div>
                  </div>
                  <Slider
                    value={[loanAmount]}
                    onValueChange={(val) => setLoanAmount(val[0])}
                    min={10000}
                    max={10000000}
                    step={10000}
                    data-testid="slider-loan-amount"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₹10K</span>
                    <span>₹1 Cr</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interest-rate" className="flex items-center gap-2 text-base">
                      <Percent className="w-4 h-4" />
                      Annual Interest Rate
                    </Label>
                    <span className="text-sm text-muted-foreground">1% - 30%</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input
                        id="interest-rate"
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => handleInterestChange(e.target.value)}
                        className="pr-8"
                        data-testid="input-interest-rate"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                  </div>
                  <Slider
                    value={[interestRate]}
                    onValueChange={(val) => setInterestRate(val[0])}
                    min={1}
                    max={30}
                    step={0.1}
                    data-testid="slider-interest-rate"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1%</span>
                    <span>30%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base">
                      <Calendar className="w-4 h-4" />
                      Loan Tenure
                    </Label>
                    <Tabs value={tenureUnit} onValueChange={(v) => {
                      setTenureUnit(v as TenureUnit);
                      if (v === "months" && tenure > 30) {
                        setTenure(tenure * 12);
                      } else if (v === "years" && tenure > 30) {
                        setTenure(Math.ceil(tenure / 12));
                      }
                    }}>
                      <TabsList className="h-8">
                        <TabsTrigger value="years" className="text-xs px-3" data-testid="tab-years">Years</TabsTrigger>
                        <TabsTrigger value="months" className="text-xs px-3" data-testid="tab-months">Months</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input
                        id="tenure"
                        type="number"
                        value={tenure}
                        onChange={(e) => handleTenureChange(e.target.value)}
                        className="pr-16"
                        data-testid="input-tenure"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {tenureUnit}
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[tenure]}
                    onValueChange={(val) => setTenure(val[0])}
                    min={1}
                    max={tenureUnit === "years" ? 30 : 360}
                    step={1}
                    data-testid="slider-tenure"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 {tenureUnit === "years" ? "year" : "month"}</span>
                    <span>{tenureUnit === "years" ? "30 years" : "360 months"}</span>
                  </div>
                </div>

                <Button onClick={handleReset} variant="outline" className="w-full" data-testid="button-reset">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Monthly EMI</p>
                <div className="flex items-center justify-center gap-2">
                  <IndianRupee className="w-8 h-8 text-primary" />
                  <span className="text-5xl font-bold text-primary" data-testid="text-emi">
                    {formatNumber(calculations.emi)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  for {tenureInMonths} months at {interestRate}% p.a.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Wallet className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">Principal</span>
                  </div>
                  <p className="text-xl font-semibold" data-testid="text-principal">{formatCurrency(loanAmount)}</p>
                  <p className="text-xs text-blue-600">{principalPercentage}% of total</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">Total Interest</span>
                  </div>
                  <p className="text-xl font-semibold" data-testid="text-interest">{formatCurrency(calculations.totalInterest)}</p>
                  <p className="text-xs text-orange-600">{interestPercentage}% of total</p>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <PiggyBank className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">Total Amount Payable</span>
                  </div>
                  <p className="text-2xl font-semibold" data-testid="text-total">{formatCurrency(calculations.totalPayment)}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-center">Principal vs Interest Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-3">Understanding EMI</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              EMI (Equated Monthly Installment) is the fixed payment amount made by a borrower to a lender at a specified date each month. 
              It consists of both the principal and interest components, calculated using the reducing balance method.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="font-medium text-blue-700 dark:text-blue-400">Lower Interest Rate</p>
                <p className="text-muted-foreground">Results in lower EMI and less total interest paid</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                <p className="font-medium text-orange-700 dark:text-orange-400">Shorter Tenure</p>
                <p className="text-muted-foreground">Higher EMI but significantly less total interest</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <p className="font-medium text-green-700 dark:text-green-400">Prepayment</p>
                <p className="text-muted-foreground">Making extra payments reduces principal and interest</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
