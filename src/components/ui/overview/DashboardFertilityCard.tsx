import { DonutChart } from "@/components/DonutChart";
import { Card, ProgressBar } from "@tremor/react";

import { Badge } from "@/components/Badge";

export type KpiEntry = {
  title: string;
  percentage: number;
  current: number;
  allowed: number;
};

export type FertilityCardProps = {
  title: string;
  change: string;
  value: string;
  valueDescription: string;
  ctaDescription: string;
  ctaText: string;
  ctaLink: string;
  data: KpiEntry[];
};

export default function FertilityProgressCard({
  title,
  change,
  value,
  valueDescription,
  ctaDescription,
  ctaText,
  ctaLink,
  data,
}: FertilityCardProps) {
  // If no data, display a message
  if (!data || data.length === 0) {
    return (
      <Card className="p-4 sm:mx-auto sm:max-w-lg">
        <h3 className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {title}
        </h3>
        <p className="text-center text-gray-500 mt-6">No data available.</p>
      </Card>
    );
  }

  // Assign colors dynamically
  const colors = ["cyan", "blue", "indigo", "violet"];

  // Transform data to match Tremor DonutChart format
  const formattedData = data.map((item, idx) => ({
    name: item.title, // **Label**
    value: item.percentage, // **Percentage Value**
    color: colors[idx % colors.length], // Assign colors cyclically
  }));

  // Percentage Formatter for the Chart
  const percentageFormatter = (number: number) => `${number.toFixed(1)}%`;

  return (
    <div className="flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2">
          <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
            {title}
          </dt>
          <Badge variant="neutral">{change}</Badge>
        </div>
        <dd className="mt-2 flex items-baseline gap-2">
          <span className="text-xl text-gray-900 dark:text-gray-50">
            {value}
          </span>
          <span className="text-sm text-gray-500">{valueDescription}</span>
        </dd>

        {/* Donut Chart */}
        <div className="flex justify-center items-center my-6">
          <DonutChart
            className="w-full max-w-xs" // Responsive width
            data={formattedData}
            category="value"
            index="name"
            valueFormatter={percentageFormatter}
            showTooltip={true}
            colors={colors}
          />
        </div>

        {/* List of Pig Fertility Stats */}
        <ul role="list" className="mt-4 space-y-5">
          {data.map((item) => (
            <li key={item.title}>
              <p className="flex justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {item.title}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {item.current}
                  <span className="font-normal text-gray-500">
                    /{item.allowed}
                  </span>
                </span>
              </p>
              <ProgressBar
                value={item.current}
                className="mt-2 [&>*]:h-1.5"
                colors={colors}
              />
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500">
            {ctaDescription}{" "}
            <a href={ctaLink} className="text-indigo-600 dark:text-indigo-400">
              {ctaText}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
