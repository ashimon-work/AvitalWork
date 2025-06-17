"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Lock, ShoppingBag, Loader2 } from "lucide-react";

export interface OrderSummaryCardProps {
  items: {
    id: string;
    name: string;
    options: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  shipping: number;
  taxes: number;
  discount?: {
    code: string;
    amount: number;
  };
  canPlaceOrder: boolean;
  isPlacingOrder: boolean;
  onPlaceOrder: () => void;
}

export default function OrderSummaryCard({
  items,
  shipping,
  taxes,
  discount,
  canPlaceOrder,
  isPlacingOrder,
  onPlaceOrder,
}: OrderSummaryCardProps) {
  const subtotal = React.useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );
  const total = React.useMemo(
    () => subtotal + shipping + taxes - (discount?.amount || 0),
    [subtotal, shipping, taxes, discount]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Summary</span>
          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>{items.length} items in cart</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.options}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-muted-foreground">Subtotal</p>
            <p>{formatCurrency(subtotal)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground">Shipping</p>
            <p>{formatCurrency(shipping)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground">Taxes</p>
            <p>{formatCurrency(taxes)}</p>
          </div>
          {discount && (
            <div className="flex justify-between text-green-600">
              <p>Discount ({discount.code})</p>
              <p>-{formatCurrency(discount.amount)}</p>
            </div>
          )}
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold">Total</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={!canPlaceOrder || isPlacingOrder}
          onClick={onPlaceOrder}
        >
          {isPlacingOrder ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: "linear",
              }}
            >
              <Loader2 className="h-5 w-5" />
            </motion.div>
          ) : (
            "Place Order"
          )}
        </Button>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Secure Checkout</span>
        </div>
      </CardFooter>
    </Card>
  );
}