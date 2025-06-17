"use client";
import * as React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  CreditCard,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckoutProgressIndicatorProps {
  currentStep: number;
}

const steps = [
  { name: "Cart", icon: ShoppingCart },
  { name: "Checkout", icon: CreditCard },
  { name: "Confirmation", icon: CheckCircle },
];

export default function CheckoutProgressIndicator({
  currentStep,
}: CheckoutProgressIndicatorProps) {
  return (
    <nav aria-label="Checkout progress">
      <ol
        role="list"
        className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-8"
      >
        {steps.map((step, index) => (
          <li key={step.name} className="flex items-center">
            <motion.div
              initial={false}
              animate={index === currentStep ? "active" : "inactive"}
              variants={{
                active: {
                  scale: 1.1,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                },
                inactive: { scale: 1 },
              }}
              className="flex flex-col items-center"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300",
                  index <= currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <p
                className={cn(
                  "mt-2 text-sm font-medium transition-colors duration-300",
                  index <= currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.name}
              </p>
            </motion.div>
            {index < steps.length - 1 && (
              <div aria-hidden="true" className="hidden sm:block ml-4 md:ml-8">
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}