// constants.ts
export type PeriodValue = "previous-period" | "last-year" | "no-comparison";

export const categories = [
  {
    title: "Total Pigs",
    type: "unit",
  },
  {
    title: "Heat Status",
    type: "unit",
  },
  {
    title: "Fertility Status",
    type: "unit",
  },
];

export type KpiEntry = {
  title: string;
  percentage: number;
  current: number;
  allowed: number;
  unit?: string;
};

export type KpiEntryExtended = {
  title: string;
  percentage: number;
  current: number;
  allowed: number;
  parent?: string;
};

export const maxDate = new Date();

export const defaultDeviceData: KpiEntry[] = [
  {
    title: "Online Devices",
    percentage: 0,
    current: 0,
    allowed: 0,
  },
  {
    title: "Data Collection Rate",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Storage Usage",
    percentage: 0,
    current: 0,
    allowed: 10,
    unit: "GB",
  },
];

export const defaultHealthData: KpiEntry[] = [
  {
    title: "At Risk",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Healthy",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Critical",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "No Movement",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
];

export const defaultFertilityStatus: KpiEntry[] = [
  {
    title: "In-Heat",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Pre-Heat",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Open",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Ready-to-Breed",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
];

export type TimeSeriesMetrics = {
  totalPigs: number;
  totalPigsInHeat: number;
  totalPigsReadyToBreed: number;
  fertilityStatus: {
    inHeat: number;
    preHeat: number;
    open: number;
    readyToBreed: number;
  };
  heatStatus: {
    open: number;
    bred: number;
    pregnant: number;
    farrowing: number;
    weaning: number;
  };
};

export type TimeSeriesData = Record<string, TimeSeriesMetrics>;