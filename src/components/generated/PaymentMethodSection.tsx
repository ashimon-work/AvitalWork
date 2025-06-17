"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, PlusCircle } from "lucide-react";
import ShippingAddressForm from "./ShippingAddressForm"; // Assuming this is in the same directory

export interface PaymentMethodSectionProps {
  storedCard?: {
    last4: string;
    brand: string;
  };
  onCardUpdate: (card: { last4: string; brand: string }) => void;
}

export default function PaymentMethodSection({
  storedCard,
  onCardUpdate,
}: PaymentMethodSectionProps) {
  const [showBillingForm, setShowBillingForm] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Dummy handler for the billing form
  const handleBillingSubmit = (data: any) => {
    console.log("Billing address submitted:", data);
  };

  // Dummy handler for simulated Tranzila popup
  const handleCardSave = () => {
    // In a real scenario, you'd get this data from the Tranzila iframe/callback
    onCardUpdate({ last4: "4242", brand: "Visa" });
    setIsModalOpen(false);
  };

  const CardBrandIcon = ({ brand }: { brand: string }) => {
    // In a real app, you might have specific icons for each brand
    return <CreditCard className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Payment Method</h2>
      <div className="p-6 border rounded-lg bg-card">
        {storedCard ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardBrandIcon brand={storedCard.brand} />
              <div>
                <p className="font-medium">
                  {storedCard.brand} ending in {storedCard.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your card is securely stored.
                </p>
              </div>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Update Card</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Payment Method</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* This would be the Tranzila iframe container */}
                  <div className="p-4 border-2 border-dashed rounded-lg text-center">
                    <p className="text-muted-foreground mb-2">
                      Tranzila Secure PCI-Compliant Form
                    </p>
                    <div className="space-y-2">
                      <Input placeholder="Card Number" />
                      <div className="flex gap-2">
                        <Input placeholder="MM/YY" />
                        <Input placeholder="CVC" />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={handleCardSave}>
                    Save Card
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="p-4 border-2 border-dashed rounded-lg text-center">
                  <p className="text-muted-foreground mb-2">
                    Tranzila Secure PCI-Compliant Form
                  </p>
                  <div className="space-y-2">
                    <Input placeholder="Card Number" />
                    <div className="flex gap-2">
                      <Input placeholder="MM/YY" />
                      <Input placeholder="CVC" />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleCardSave}>
                  Save Card
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <h2 className="text-2xl font-semibold">Billing Address</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sameAsShipping"
            checked={!showBillingForm}
            onCheckedChange={(checked) => setShowBillingForm(!checked)}
          />
          <Label htmlFor="sameAsShipping">
            Billing address is the same as shipping
          </Label>
        </div>
        <motion.div
          initial={false}
          animate={{
            height: showBillingForm ? "auto" : 0,
            opacity: showBillingForm ? 1 : 0,
          }}
          className="overflow-hidden"
        >
          {showBillingForm && (
            <div className="pt-4">
              {/* Here we reuse the form, but would ideally pass props to change legend and remove fields */}
              <ShippingAddressForm onSubmit={handleBillingSubmit} />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}