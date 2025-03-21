// Overview.tsx
"use client";
import { ChartCard } from "@/components/ui/overview/DashboardChartCard";
import FertilityProgressCard from "@/components/ui/overview/DashboardFertilityCard";
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar";
import { ProgressBarCard } from "@/components/ui/overview/DashboardProgressBarCard";
import { BarnStallCard } from "@/components/ui/overview/DashboardStallBarCard";
import { subDays } from "date-fns";
import React from "react";
import { useOverviewData } from "./components/useOverviewData";
import { categories, maxDate } from "./components/constants";

export default function Overview() {
  const {
    selectedDates,
    setSelectedDates,
    selectedPeriod,
    setSelectedPeriod,
    selectedCategories,
    setSelectedCategories,
    timeSeriesData,
    deviceData,
    healthData,
    FertilityStatus,
    heatStats,
    barnStats,
    stallStats,
    selectedBarn,
    setSelectedBarn,
    error,
    isLoading,
  } = useOverviewData();

  // Transform time-series data for the ChartCard component
  const chartData = React.useMemo(() => {
    return Object.entries(timeSeriesData).map(([date, metrics]) => ({
      date,
      totalPigs: metrics.totalPigs,
      totalPigsInHeat: metrics.totalPigsInHeat,
      totalPigsReadyToBreed: metrics.totalPigsReadyToBreed,
    }));
  }, [timeSeriesData]);

  const heatChartData = React.useMemo(() => {
    return Object.entries(timeSeriesData).map(([date, metrics]) => ({
      date,
      totalPigs: metrics.totalPigs,
      totalPigsInHeat: metrics.totalPigsInHeat,
      totalPigsReadyToBreed: metrics.totalPigsReadyToBreed,
      open: metrics.heatStatus.open,
      bred: metrics.heatStatus.bred,
      pregnant: metrics.heatStatus.pregnant,
      farrowing: metrics.heatStatus.farrowing,
      weaning: metrics.heatStatus.weaning,
    }));
  }, [timeSeriesData]);

  const fertilityChartData = React.useMemo(() => {
    return Object.entries(timeSeriesData).map(([date, metrics]) => ({
      date,
      totalPigs: metrics.totalPigs,
      totalPigsInHeat: metrics.totalPigsInHeat,
      totalPigsReadyToBreed: metrics.totalPigsReadyToBreed,
      inHeat: metrics.fertilityStatus.inHeat,
      preHeat: metrics.fertilityStatus.preHeat,
      open: metrics.fertilityStatus.open,
      readyToBreed: metrics.fertilityStatus.readyToBreed,
    }));
  }, [timeSeriesData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <>
      <section aria-labelledby="current-status">
        <h1
          id="current-status"
          className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Current Status
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          <ProgressBarCard
            title="Device Status"
            change="+1.2%"
            value="75%"
            valueDescription="of devices online"
            ctaDescription="Device maintenance due in 5 days."
            ctaText="View devices"
            ctaLink="/support"
            data={deviceData}
          />
          <ProgressBarCard
            title="Health Metrics"
            change="Healthy"
            value="85%"
            valueDescription="normal health indicators"
            ctaDescription="2 pigs require attention."
            ctaText="View details"
            ctaLink="/details"
            data={healthData}
          />

          <BarnStallCard
            title="Barn/Stall Metrics"
            change="Farm 1"
            value="121"
            valueDescription="Total Pigs"
            ctaDescription="View stall details."
            ctaText="View details"
            ctaLink="/barn-stall-details"
            data={
              selectedBarn
                ? stallStats.filter((stall) => stall.parent === selectedBarn)
                : []
            }
            barns={barnStats.map((barn) => ({ title: barn.title, href: "#" }))}
            selectedBarn={selectedBarn}
            onBarnSelect={(barn) => setSelectedBarn(barn)}
          />

          <FertilityProgressCard
            title="Fertility Metrics"
            change=""
            value="78%"
            valueDescription="optimal breeding conditions"
            ctaDescription="3 pigs ready for breeding."
            ctaText="View details"
            ctaLink="/fertility-details"
            data={FertilityStatus}
          />

          <FertilityProgressCard
            title="Heat Metrics"
            change=""
            value="89%"
            valueDescription="optimal breeding conditions"
            ctaDescription="3 pigs ready for breeding."
            ctaText="View details"
            ctaLink="/heat-status"
            data={heatStats}
          />
        </div>
      </section>
      <section aria-labelledby="monitoring-overview">
        <h1
          id="monitoring-overview"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Monitoring Overview
        </h1>
        <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">
          <Filterbar
            maxDate={maxDate}
            minDate={subDays(maxDate, 30)}
            selectedDates={selectedDates}
            onDatesChange={(dates) => setSelectedDates(dates)}
            selectedPeriod={selectedPeriod}
            onPeriodChange={(period) => setSelectedPeriod(period)}
            categories={categories}
            setSelectedCategories={setSelectedCategories}
            selectedCategories={selectedCategories}
          />
        </div>
        <dl className="mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <ChartCard
            title="Total Pigs"
            type="unit"
            selectedDates={selectedDates}
            selectedPeriod={selectedPeriod}
            data={chartData}
            categories={["totalPigs"]}
            colors={["blue"]}
          />
          <ChartCard
            title="Heat Status"
            type="unit"
            selectedDates={selectedDates}
            selectedPeriod={selectedPeriod}
            data={heatChartData}
            categories={["open", "bred", "pregnant", "farrowing", "weaning"]}
            colors={["red", "orange", "yellow", "green", "blue"]}
          />
          <ChartCard
            title="Fertility Status"
            type="unit"
            selectedDates={selectedDates}
            selectedPeriod={selectedPeriod}
            data={fertilityChartData}
            categories={["inHeat", "preHeat", "readyToBreed"]}
            colors={["purple", "pink", "teal"]}
          />
        </dl>
      </section>
    </>
  );
}