"use client";

import React from "react";
import Link from "next/link";
import Spinner from "@/components/Spinner";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Props = {
  title: string;
  href: string;
  hrefText: string;
  queryKey: string[];
  getData: () => {};
};

const COLORS = ["#fde047", "#06b6d4", "#ef4444", "#22c55e", "#71717a"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-300">
        <p className="text-sm text-violet-500">{`${payload[0].name} : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const DataChart = ({ title, href, hrefText, queryKey, getData }: Props) => {
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await getData();

      return data;
    },
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>

        <Link href={href}>
          <Button variant={"violet"}>{hrefText}</Button>
        </Link>
      </div>

      <div className="w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={(entry) => entry.name}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DataChart;
