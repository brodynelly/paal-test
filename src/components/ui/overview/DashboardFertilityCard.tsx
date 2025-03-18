import { cx } from "@/lib/utils";

import { Badge } from "@/components/Badge";

import { Card } from "@/components/Card";
import { ProgressCircle } from "@/components/ProgressCircle_S";

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
  const bgColors = [
    "bg-cyan-500",  // Cyan
    "bg-blue-500",   // Blue
    "bg-indigo-500", // Indigo
    "bg-violet-500",  // Violet
  ];


  var count: number = 0;

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


        <div className="flex justify-center items-center my-6 gap-4">
          <ProgressCircle value={data[0].percentage} radius={80} strokeWidth={7}>
            <ProgressCircle value={data[1].percentage} radius={70} strokeWidth={7}>
              <ProgressCircle
                value={data[2].percentage}
                radius={60}
                strokeWidth={7}
                variant="success"
              >
                <ProgressCircle
                  value={data[3].percentage}
                  radius={50}
                  strokeWidth={7}
                  variant="warning"
                >
                  <p>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      7.8
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      /10
                    </span>
                  </p>
                </ProgressCircle>
              </ProgressCircle>
            </ProgressCircle>
          </ProgressCircle>




          {/* <li key={item.title} className="flex items-center gap-2 text-xs">
                        <span
                          className={cx(item.color, "size-2.5 rounded-sm")}
                          aria-hidden="true"
                        />
                        <span className="text-gray-900 dark:text-gray-50">
                          {item.title}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          ({item.value} / {item.percentage}%)
                        </span>
                      </li> */}
          <div className="mt-2 flex items-center gap-0.5">
            {data.map((item, idx) => (
              <div
                key={item.title}
                className={cx(bgColors[idx % colors.length], `h-1.5 rounded-full`)}
                style={{ width: `${item.percentage}%` }}
              />
            ))}
          </div>

          {/* List of Pig Fertility Stats */}
          <ul role="list" className="mt-4 space-y-5">
            {data.map((item, idx) => (
              <li key={item.title} className="flex items-center gap-2 text-xs">
                <span
                  className={cx(bgColors[idx % colors.length], "size-2.5 rounded-sm")}
                  aria-hidden="true"
                />
                <span className="text-gray-900 dark:text-gray-50">
                  {item.title}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ({item.current} / {item.allowed})
                </span>
              </li>
            ))}
          </ul>

        </div>

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
