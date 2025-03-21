import { useEffect, useState, useCallback } from "react";
import { subDays } from "date-fns";
import api from "@/lib/axios";
import { subscribeToStats } from "@/lib/socket";
import {
  KpiEntry,
  KpiEntryExtended,
  TimeSeriesData,
  defaultDeviceData,
  defaultHealthData,
  defaultFertilityStatus,
  maxDate,
  PeriodValue,
  categories,
} from "./constants";

export const useOverviewData = () => {
  const [selectedDates, setSelectedDates] = useState({
    from: subDays(maxDate, 7),
    to: maxDate,
  });
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodValue>("previous-period");
  const [selectedCategories, setSelectedCategories] = useState(
    categories.map((category: { title: string }) => category.title)
  );
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({});
  const [deviceData, setDeviceData] = useState<KpiEntry[]>(defaultDeviceData);
  const [healthData, setHealthData] = useState<KpiEntry[]>(defaultHealthData);
  const [FertilityStatus, setFertilityData] = useState<KpiEntry[]>(defaultFertilityStatus);
  const [heatStats, setHeatStats] = useState<KpiEntry[]>([]);
  const [barnStats, setBarnStats] = useState<KpiEntry[]>([]);
  const [stallStats, setStallStats] = useState<KpiEntryExtended[]>([]);
  const [selectedBarn, setSelectedBarn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateStats = useCallback((data: any) => {
    // Update device data
    setDeviceData([
      {
        title: "Online Devices",
        percentage: data.deviceStats.deviceUsage,
        current: data.deviceStats.onlineDevices,
        allowed: data.deviceStats.totalDevices,
      },
      {
        title: "Data Collection Rate",
        percentage: 92,
        current: 92,
        allowed: 100,
        unit: "%",
      },
      {
        title: "Storage Usage",
        percentage: 45,
        current: 4.5,
        allowed: 10,
        unit: "GB",
      },
    ]);

    // Update health data
    setHealthData([
      {
        title: "At Risk",
        percentage: (data.pigHealthStats.totalAtRisk / data.pigStats.totalPigs) * 100,
        current: data.pigHealthStats.totalAtRisk,
        allowed: data.pigStats.totalPigs,
      },
      {
        title: "Healthy",
        percentage: (data.pigHealthStats.totalHealthy / data.pigStats.totalPigs) * 100,
        current: data.pigHealthStats.totalHealthy,
        allowed: data.pigStats.totalPigs,
      },
      {
        title: "Critical",
        percentage: (data.pigHealthStats.totalCritical / data.pigStats.totalPigs) * 100,
        current: data.pigHealthStats.totalCritical,
        allowed: data.pigStats.totalPigs,
      },
      {
        title: "No Movement",
        percentage: (data.pigHealthStats.totalNoMovement / data.pigStats.totalPigs) * 100,
        current: data.pigHealthStats.totalNoMovement,
        allowed: data.pigStats.totalPigs,
      },
    ]);

    // Update fertility data
    setFertilityData([
      {
        title: "In-Heat",
        percentage: ((data.pigFertilityStats["InHeat"] ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigFertilityStats["InHeat"] ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
      {
        title: "Pre-Heat",
        percentage: ((data.pigFertilityStats["PreHeat"] ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigFertilityStats["PreHeat"] ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
      {
        title: "Open",
        percentage: ((data.pigFertilityStats["Open"] ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigFertilityStats["Open"] ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
      {
        title: "Ready-To-Breed",
        percentage: ((data.pigFertilityStats["ReadyToBreed"] ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigFertilityStats["ReadyToBreed"] ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
    ]);

    // Update heat stats
    setHeatStats([
      {
        title: "Open",
        percentage: ((data.pigHeatStats["totalOpen"] ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigHeatStats.totalOpen ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
      {
        title: "Bred",
        percentage: ((data.pigHeatStats.totalBred ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigHeatStats.totalBred ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
      {
        title: "Pregnant",
        percentage: ((data.pigHeatStats.totalPregnant ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigHeatStats.totalPregnant ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
      {
        title: "Farrowing",
        percentage: ((data.pigHeatStats.totalFarrowing ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigHeatStats.totalFarrowing ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
      {
        title: "Weaning",
        percentage: ((data.pigHeatStats.totalWeaning ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigHeatStats.totalWeaning ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
    ]);

    // Update barn stats
    const barnStatsData = Object.entries(data.barnStats).map(([barnName, totalPigs]) => ({
      title: barnName,
      percentage: ((totalPigs as number) / data.pigStats.totalPigs) * 100,
      current: totalPigs as number,
      allowed: data.pigStats.totalPigs,
    }));
    setBarnStats(barnStatsData);

    // Update stall stats
    const stallStatsData: KpiEntryExtended[] = [];
    Object.entries(data.stallStats).forEach(([barnName, stalls]) => {
      Object.entries(stalls as Record<string, number>).forEach(([stallName, totalPigs]) => {
        stallStatsData.push({
          title: stallName,
          percentage: ((totalPigs as number) / data.pigStats.totalPigs) * 100,
          current: totalPigs as number,
          allowed: data.pigStats.totalPigs,
          parent: barnName,
        });
      });
    });
    setStallStats(stallStatsData);

    // Set the first barn as selected by default
    if (barnStatsData.length > 0) {
      setSelectedBarn(barnStatsData[0].title);
    }

    setIsLoading(false);
  }, []);

  // Fetch time-series data
  useEffect(() => {
    const fetchTimeSeriesData = async () => {
      try {
        const response = await api.get<TimeSeriesData>('/pigs/analytics/time-series');
        setTimeSeriesData(response.data);
      } catch (error) {
        console.error('Error fetching time-series data:', error);
      }
    };

    fetchTimeSeriesData();
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await api.get('/stats');
        console.log(response.data);
        updateStats(response.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to fetch initial data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [updateStats]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToStats(updateStats);
    return () => {
      unsubscribe();
    };
  }, [updateStats]);

  return {
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
  };
};