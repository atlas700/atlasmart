"use client";

import React from "react";
import { RouteType } from "../../../../../../types";
import Routes from "@/components/nav/Routes";

type Props = {
  routes: RouteType[];
  className?: string;
};

const AdminRoutes = ({ routes, className }: Props) => {
  return <Routes routes={routes} className={className} />;
};

export default AdminRoutes;
