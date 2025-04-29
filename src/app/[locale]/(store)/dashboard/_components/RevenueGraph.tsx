"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import { useQuery } from "@tanstack/react-query";
import { getGraphData } from "@/features/store/db/storeOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type Props = {
  storeId: string;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-300">
        <p className="text-sm text-violet-500">{`${label} : ${formatPrice(
          payload[0].value,
          { currency: "USD" }
        )}`}</p>
      </div>
    );
  }

  return null;
};

const RevenueGraph = ({ storeId }: Props) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["get-revenue-data", storeId],
    queryFn: async () => {
      const data = await getGraphData(storeId);

      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (!data || isError || !Array.isArray(data)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-full p-4 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="font-bold">Overview</CardTitle>
        </CardHeader>

        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                axisLine
                fontSize={12}
                tickLine={false}
              />

              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine
                tickFormatter={(value) => `$${value}`}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend align="right" verticalAlign="top" />

              <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueGraph;
