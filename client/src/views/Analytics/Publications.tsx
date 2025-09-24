import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Loader2,
  TrendingUp,
  BookOpen,
  Users,
  Award,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
  Settings,
} from "lucide-react";

import { AnalyticsFilters } from "@/components/analytics/publications/AnalyticsFilter";
import { analyticsSchemas } from "lib";
import api from "@/lib/axios-instance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Colors
const COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f97316", // orange
  "#a855f7", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#facc15", // yellow
];

const fetchAnalytics = async (
  params: analyticsSchemas.AnalyticsQuery
): Promise<analyticsSchemas.AnalyticsResponse> => {
  const response = await api.get("/analytics/publications", { params });
  return response.data as analyticsSchemas.AnalyticsResponse;
};

// --- Stat Card
function StatCard({
  value,
  label,
  icon: Icon,
  color = "primary",
}: {
  value: number | string;
  label: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:from-gray-900 dark:to-gray-800/50">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground/80">
              {label}
            </p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <div
            className={`rounded-2xl bg-${color}/10 p-4 ring-1 ring-${color}/20 transition-all duration-300 group-hover:scale-110`}
          >
            <Icon className={`h-7 w-7 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Chart Type Definitions
type ChartType = "line" | "bar" | "pie";
type DataSource =
  | "publications"
  | "citations"
  | "publicationTypes"
  | "authorContributions";

interface ChartConfig {
  chartType: ChartType;
  dataSource: DataSource;
  xAxis: string;
  yAxis: string;
}

// --- Data Source Options
const dataSourceOptions = [
  {
    value: "publications",
    label: "Publications Time Series",
    hasTimeSeries: true,
  },
  { value: "citations", label: "Citations Time Series", hasTimeSeries: true },
  {
    value: "publicationTypes",
    label: "Publication Types",
    hasTimeSeries: false,
  },
  {
    value: "authorContributions",
    label: "Author Contributions",
    hasTimeSeries: false,
  },
];

const chartTypeOptions = [
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "line", label: "Line Chart", icon: LineChartIcon },
  { value: "pie", label: "Pie Chart", icon: PieChartIcon },
];

// --- Dynamic Chart Component
function DynamicChart({ data, config }: { data: any; config: ChartConfig }) {
  const getChartData = () => {
    switch (config.dataSource) {
      case "publications":
        return data.publicationTimeSeries || [];
      case "citations":
        return data.citationTimeSeries || [];
      case "publicationTypes":
        return data.publicationTypeBreakdown || [];
      case "authorContributions":
        return data.authorContributions || [];
      default:
        return [];
    }
  };

  const chartData = getChartData();
  const chartColor = COLORS[0];

  const renderChart = () => {
    switch (config.chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey={config.yAxis}
                stroke={chartColor}
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={config.yAxis} fill={chartColor} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={config.yAxis}
                nameKey={config.xAxis}
                cx="50%"
                cy="50%"
                outerRadius={150}
                stroke="white"
                strokeWidth={2}
                label
              >
                {chartData.map((_: any, idx: number) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            Select a chart type
          </div>
        );
    }
  };

  const chartConfig = {
    [config.yAxis]: { label: config.yAxis, color: chartColor },
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardContent className="p-6">
        <ChartContainer config={chartConfig}>{renderChart()}</ChartContainer>
      </CardContent>
    </Card>
  );
}

// --- Chart Controls Component
const allowedYaxisOptions = ["count", "total", "cumulative"];
const allowedXaxisOptions = ["year", "month", "name", "type"];
function ChartControls({
  config,
  onConfigChange,
  data,
}: {
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
  data: any;
}) {
  const getAxisOptions = (axis: string) => {
    console.log(data);
    const sampleData = (() => {
      switch (config.dataSource) {
        case "publications":
          return data?.publicationTimeSeries?.[0] || {};
        case "citations":
          return data?.citationTimeSeries?.[0] || {};
        case "publicationTypes":
          return data?.publicationTypeBreakdown?.[0] || {};
        case "authorContributions":
          return data?.authorContributions?.[0] || {};
        default:
          return {};
      }
    })();
    if (axis === "y") {
      return Object.keys(sampleData).filter((key) =>
        allowedYaxisOptions.includes(key)
      );
    }
    return Object.keys(sampleData).filter((key) =>
      allowedXaxisOptions.includes(key)
    );
  };

  const XAxisOptions = getAxisOptions("x");
  const YAxisOptions = getAxisOptions("y");

  const handleDataSourceChange = (value: DataSource) => {
    // Reset axis values when data source changes
    const newConfig = { ...config, dataSource: value, xAxis: "", yAxis: "" };
    onConfigChange(newConfig);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Chart Configuration</CardTitle>
        </div>
        <CardDescription>
          Customize your chart by selecting data source, chart type, and axes
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 items-center justify-evenly gap-2 lg:flex lg:flex-row">
        {/* Data Source Selection */}
        <div className="w-full space-y-2">
          <label className="text-sm font-medium">Data Source</label>
          <Select
            value={config.dataSource}
            onValueChange={handleDataSourceChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select data source" />
            </SelectTrigger>
            <SelectContent>
              {dataSourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart Type Selection */}
        <div className="w-full space-y-2">
          <label className="text-sm font-medium">Chart Type</label>
          <Select
            value={config.chartType}
            onValueChange={(value: ChartType) =>
              onConfigChange({ ...config, chartType: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              {chartTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2">
                    <option.icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* X-Axis Selection */}
        {config.chartType !== "pie" && (
          <div className="w-full space-y-2">
            <label className="text-sm font-medium">X-Axis</label>
            <Select
              value={config.xAxis}
              onValueChange={(value) =>
                onConfigChange({ ...config, xAxis: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select X-axis field" />
              </SelectTrigger>
              <SelectContent>
                {XAxisOptions.map((field) => (
                  <SelectItem key={field} value={field} className="capitalize">
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Y-Axis Selection */}
        <div className="w-full space-y-2">
          <label className="text-sm font-medium">
            {config.chartType === "pie" ? "Value Field" : "Y-Axis"}
          </label>
          <Select
            value={config.yAxis}
            onValueChange={(value) =>
              onConfigChange({ ...config, yAxis: value })
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={`Select ${config.chartType === "pie" ? "value" : "Y-axis"} field`}
              />
            </SelectTrigger>
            <SelectContent>
              {YAxisOptions.map((field) => (
                <SelectItem key={field} value={field} className="capitalize">
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Label Field for Pie Chart */}
        {config.chartType === "pie" && (
          <div className="w-full space-y-2">
            <label className="text-sm font-medium">Label Field</label>
            <Select
              value={config.xAxis}
              onValueChange={(value) =>
                onConfigChange({ ...config, xAxis: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select label field" />
              </SelectTrigger>
              <SelectContent>
                {XAxisOptions.map((field) => (
                  <SelectItem key={field} value={field} className="capitalize">
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main Dashboard
export default function AnalyticsDashboard() {
  const [queryParams, setQueryParams] =
    useState<analyticsSchemas.AnalyticsQuery | null>(null);

  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    chartType: "bar",
    dataSource: "publications",
    xAxis: "period",
    yAxis: "total",
  });

  const { data, isLoading, error, isError } = useQuery<
    analyticsSchemas.AnalyticsResponse & {
      authorContributions: { authorId: string; name: string; count: number }[];
    },
    Error
  >({
    queryKey: ["analytics", queryParams],
    queryFn: () => fetchAnalytics(queryParams!),
    enabled: !!queryParams,
  });

  if (isError) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <p className="mb-2 text-xl font-semibold text-destructive">
              Error loading data
            </p>
            <p className="text-sm text-muted-foreground">
              {error.message || "Something went wrong. Please try again later."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Visualize your publication and citation data with interactive
              charts
            </p>
          </div>

          {/* Filters + content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Filters */}
            <div className="lg:col-span-1">
              <AnalyticsFilters
                onSubmit={(filters) =>
                  setQueryParams({
                    ...filters,
                    authorIds: filters.authorIds as [string, ...string[]],
                  })
                }
              />
            </div>

            {/* Main content */}
            <div className="space-y-8 lg:col-span-3">
              {isLoading && (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="mr-2 h-20 w-20 animate-spin" />
                </div>
              )}

              {data && (
                <>
                  {/* Stat cards */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      label="Total Publications"
                      value={data.singleMetrics.totalPublicationsAllTime}
                      icon={BookOpen}
                      color="blue"
                    />
                    <StatCard
                      label="Last Year"
                      value={data.singleMetrics.totalPublicationsLastYear}
                      icon={Award}
                      color="emerald"
                    />
                    <StatCard
                      label="Last Month"
                      value={data.singleMetrics.totalPublicationsLastMonth}
                      icon={Users}
                      color="amber"
                    />
                    <StatCard
                      label="Avg Citations/Paper"
                      value={data.singleMetrics.averageCitationsPerPaper.toFixed(
                        1
                      )}
                      icon={TrendingUp}
                      color="purple"
                    />
                  </div>

                  {/* Chart Controls and Visualization */}
                  <div className="grid grid-cols-1 gap-2">
                    {/* Chart Controls */}
                    <div className="lg:col-span-1">
                      <ChartControls
                        config={chartConfig}
                        onConfigChange={setChartConfig}
                        data={data}
                      />
                    </div>
                    <DynamicChart data={data} config={chartConfig} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
