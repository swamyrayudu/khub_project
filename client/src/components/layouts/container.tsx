
"use client";

import React from 'react';
import { cn } from "@/lib/utils";


interface ContainerProps {
  className?: string;
  children?: React.ReactNode;
}

export default function Container({ children, className }: ContainerProps) {
  return <div className={cn('container', className)}>{children}</div>;
}
