
"use client";

import { cn } from "@/lib/utils";


interface conatinerprops {
  className: string;
  children?: React.ReactNode;
}

export default function container({ children, className }: conatinerprops) {
  return <div className={cn("container")}>header</div>;
}
