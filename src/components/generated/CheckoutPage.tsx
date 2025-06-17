"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CheckoutProgressIndicator from "./CheckoutProgressIndicator";
import ShippingAddressForm, { ShippingAddressData } from "./ShippingAddressForm";
import PaymentMethodSection from "./PaymentMethodSection";
import OrderSummaryCard from "./OrderSummaryCard";

export default function CheckoutPage() {
  const [shippingAddress, setShippingAddress] =
    React.useState<ShippingAddressData | null>(null);
  const [shippingMethod, setShippingMethod] = React.useState("standard");
  const [storedCard, setStoredCard] = React.useState<
    { last4: string; brand: string } | undefined
  >(undefined);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);

  const handleShippingSubmit = (data: ShippingAddressData) => {
    setShippingAddress(data);
    setTermsAccepted(data.terms);
  };

  const handleCardUpdate = (card: { last4: string; brand: string }) => {
    setStoredCard(card);
  };

  const handlePlaceOrder = () => {
    if (!canPlaceOrder) return;
    setIsPlacingOrder(true);
    console.log("Placing order with:", {
      shippingAddress,
      shippingMethod,
      storedCard,
    });
    setTimeout(() => {
      setIsPlacingOrder(false);
      // Navigate to confirmation page
    }, 2000);
  };

  const shippingOptions = {
    standard: {
      price: 5.0,
      label: "Standard Shipping",
      date: "Est. 5-7 business days",
    },
    express: {
      price: 15.0,
      label: "Express Shipping",
      date: "Est. 1-2 business days",
    },
  };

  const canPlaceOrder = !!storedCard && termsAccepted && !!shippingAddress;

  const orderItems = [
    {
      id: "1",
      name: "Classic Leather Watch",
      options: "Color: Brown, Size: 42mm",
      price: 150.0,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=400",
    },
    {
      id: "2",
      name: "Minimalist Wallet",
      options: "Color: Black",
      price: 45.0,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1601524909162-ae97a2503061?q=80&w=400",
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="py-8 border-b">
        <div className="container mx-auto px-4">
          <CheckoutProgressIndicator currentStep={1} />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-8"
          >
            <ShippingAddressForm onSubmit={handleShippingSubmit} />
            <section>
              <h2 className="text-2xl font-semibold mb-4">Shipping Method</h2>
              <RadioGroup
                defaultValue="standard"
                value={shippingMethod}
                onValueChange={setShippingMethod}
                className="space-y-4"
              >
                {Object.entries(shippingOptions).map(([key, option]) => (
                  <Label
                    key={key}
                    htmlFor={key}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all",
                      shippingMethod === key && "border-primary ring-2 ring-primary"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value={key} id={key} />
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.date}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">${option.price.toFixed(2)}</p>
                  </Label>
                ))}
              </RadioGroup>
            </section>
            <PaymentMethodSection
              storedCard={storedCard}
              onCardUpdate={handleCardUpdate}
            />
          </motion.div>
          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <OrderSummaryCard
              items={orderItems}
              shipping={
                shippingOptions[shippingMethod as keyof typeof shippingOptions]
                  .price
              }
              taxes={21.5}
              discount={{ code: "SUMMER10", amount: 19.5 }}
              canPlaceOrder={canPlaceOrder}
              isPlacingOrder={isPlacingOrder}
              onPlaceOrder={handlePlaceOrder}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}