"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, User, Phone, MapPin, Building, Globe } from "lucide-react";

export interface ShippingAddressFormProps {
  initialValues?: Partial<ShippingAddressData>;
  onSubmit: (data: ShippingAddressData) => void;
}

export interface ShippingAddressData {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  newsletter: boolean;
  terms: boolean;
}

export default function ShippingAddressForm({
  initialValues,
  onSubmit,
}: ShippingAddressFormProps) {
  const [formData, setFormData] = React.useState<ShippingAddressData>({
    fullName: initialValues?.fullName || "",
    email: initialValues?.email || "",
    phone: initialValues?.phone || "",
    address1: initialValues?.address1 || "",
    address2: initialValues?.address2 || "",
    city: initialValues?.city || "",
    state: initialValues?.state || "",
    zip: initialValues?.zip || "",
    country: initialValues?.country || "USA",
    newsletter: initialValues?.newsletter || false,
    terms: initialValues?.terms || false,
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof ShippingAddressData, string>>
  >({});

  const validate = (name: keyof ShippingAddressData, value: any) => {
    let error = "";
    switch (name) {
      case "fullName":
        if (!value) error = "Full name is required.";
        break;
      case "email":
        if (!value) error = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Email is invalid.";
        break;
      case "phone":
        if (!value) error = "Phone number is required.";
        break;
      case "address1":
        if (!value) error = "Address is required.";
        break;
      case "city":
        if (!value) error = "City is required.";
        break;
      case "state":
        if (!value) error = "State/Province is required.";
        break;
      case "zip":
        if (!value) error = "ZIP/Postal code is required.";
        break;
      case "terms":
        if (!value) error = "You must agree to the terms.";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    validate(name as keyof ShippingAddressData, val);
  };

  const handleSelectChange = (name: keyof ShippingAddressData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields on submit
    Object.keys(formData).forEach((key) => {
      validate(
        key as keyof ShippingAddressData,
        formData[key as keyof ShippingAddressData]
      );
    });

    if (Object.values(errors).every((x) => !x) && formData.terms) {
      onSubmit(formData);
    }
  };

  const ErrorMessage = ({ message }: { message?: string }) => (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-sm text-destructive mt-1"
          aria-live="polite"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset>
        <legend className="text-2xl font-semibold mb-4">
          Shipping Address
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="pl-10"
              />
            </div>
            <ErrorMessage message={errors.fullName} />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
            <ErrorMessage message={errors.email} />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(123) 456-7890"
                className="pl-10"
              />
            </div>
            <ErrorMessage message={errors.phone} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address1">Address Line 1</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="address1"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                placeholder="123 Main St"
                className="pl-10"
              />
            </div>
            <ErrorMessage message={errors.address1} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address2">Address Line 2 (Optional)</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                placeholder="Apt, suite, etc."
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Anytown"
            />
            <ErrorMessage message={errors.city} />
          </div>
          <div>
            <Label htmlFor="state">State / Province</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="CA"
            />
            <ErrorMessage message={errors.state} />
          </div>
          <div>
            <Label htmlFor="zip">ZIP / Postal Code</Label>
            <Input
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              placeholder="12345"
            />
            <ErrorMessage message={errors.zip} />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Select
              name="country"
              value={formData.country}
              onValueChange={(value) => handleSelectChange("country", value)}
            >
              <SelectTrigger>
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="Select a country" className="pl-10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">United States</SelectItem>
                <SelectItem value="CAN">Canada</SelectItem>
                <SelectItem value="MEX">Mexico</SelectItem>
                <SelectItem value="GBR">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="newsletter"
            name="newsletter"
            checked={formData.newsletter}
            onCheckedChange={(checked) =>
              handleSelectChange("newsletter", checked ? "true" : "")
            }
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="newsletter"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Sign up for our newsletter for exclusive offers.
            </label>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            name="terms"
            checked={formData.terms}
            onCheckedChange={(checked) =>
              handleSelectChange("terms", checked ? "true" : "")
            }
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Terms and Conditions
              </a>
              .
            </label>
            <ErrorMessage message={errors.terms} />
          </div>
        </div>
      </div>
    </form>
  );
}