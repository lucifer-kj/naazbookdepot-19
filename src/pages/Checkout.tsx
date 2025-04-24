import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import RazorpayCheckoutButton from '@/components/checkout/RazorpayCheckoutButton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/lib/context/CartContext';
import { FormError } from '@/components/ui/form-error';

const addressSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  address1: z.string().min(5, { message: "Address must be at least 5 characters" }),
  address2: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  postcode: z.string().min(5, { message: "Valid postal code is required" }),
  country: z.string().min(2, { message: "Country is required" }).default("India"),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  email: z.string().email({ message: "Valid email is required" }),
});

const checkoutSchema = z.object({
  shipping: addressSchema,
  billing: addressSchema,
  sameAsShipping: z.boolean().default(true),
  paymentMethod: z.enum(["card", "cod", "razorpay"]),
  notes: z.string().optional(),
});

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cart } = useCartContext();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping: {
        firstName: "",
        lastName: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postcode: "",
        country: "India",
        phone: "",
        email: "",
      },
      billing: {
        firstName: "",
        lastName: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postcode: "",
        country: "India",
        phone: "",
        email: "",
      },
      sameAsShipping: true,
      paymentMethod: "card",
      notes: "",
    },
  });

  const subtotal = cart.subtotal || 0;
  const shipping = cart.items.length > 0 ? 100 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    try {
      setError("");
      
      if (data.sameAsShipping) {
        data.billing = data.shipping;
      }
      
      if (step < 3) {
        setStep(step + 1);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during checkout");
      console.error("Checkout error:", err);
    }
  };

  React.useEffect(() => {
    const sameAsShipping = form.watch("sameAsShipping");
    
    if (sameAsShipping) {
      const shipping = form.watch("shipping");
      Object.keys(shipping).forEach(key => {
        form.setValue(`billing.${key}` as any, shipping[key as keyof typeof shipping]);
      });
    }
  }, [form.watch("sameAsShipping"), form.watch("shipping")]);

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">Shipping Information</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="shipping.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">First Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shipping.lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="shipping.address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Address</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="shipping.address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Apartment, suite, etc. (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="shipping.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">City</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shipping.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">State</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shipping.postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">PIN Code</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="shipping.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Phone</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shipping.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {error && <FormError error={error} />}
                
                <div className="pt-6 flex justify-between">
                  <Link to="/cart" className="text-naaz-green hover:text-naaz-gold transition-colors">
                    Return to cart
                  </Link>
                  <Button 
                    type="submit" 
                    className="gold-button flex items-center"
                  >
                    Continue to Payment
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">Payment Method</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center">
                              <input 
                                type="radio"
                                id="card"
                                value="card"
                                checked={field.value === "card"}
                                onChange={() => field.onChange("card")}
                                className="h-4 w-4 text-naaz-gold focus:ring-naaz-green"
                              />
                              <label htmlFor="card" className="ml-2 block text-gray-700">Credit/Debit Card</label>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center">
                              <input 
                                type="radio"
                                id="cod"
                                value="cod"
                                checked={field.value === "cod"}
                                onChange={() => field.onChange("cod")}
                                className="h-4 w-4 text-naaz-gold focus:ring-naaz-green"
                              />
                              <label htmlFor="cod" className="ml-2 block text-gray-700">Cash on Delivery</label>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center">
                              <input 
                                type="radio"
                                id="razorpay"
                                value="razorpay"
                                checked={field.value === "razorpay"}
                                onChange={() => field.onChange("razorpay")}
                                className="h-4 w-4 text-naaz-gold focus:ring-naaz-green"
                              />
                              <label htmlFor="razorpay" className="ml-2 block text-gray-700">Razorpay (Recommended)</label>
                            </div>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sameAsShipping"
                    render={({ field }) => (
                      <FormItem>
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <div className="flex items-center mb-4">
                            <input 
                              type="checkbox"
                              id="sameAsShipping"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 text-naaz-gold focus:ring-naaz-green"
                            />
                            <label htmlFor="sameAsShipping" className="ml-2 block text-gray-700">Billing address same as shipping address</label>
                          </div>
                          
                          {!field.value && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                              <h3 className="text-lg font-medium text-naaz-green mb-3">Billing Address</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="billing.firstName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700">First Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="billing.lastName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700">Last Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={form.control}
                                name="billing.address1"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">Address</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name="billing.city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700">City</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="billing.state"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700">State</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="billing.postcode"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700">PIN Code</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <textarea 
                            {...field}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green h-24 resize-none"
                            placeholder="Special instructions for delivery or order"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {error && <FormError error={error} />}
                
                <div className="pt-6 flex justify-between">
                  <Button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="text-naaz-green hover:text-naaz-gold transition-colors"
                    variant="ghost"
                  >
                    Return to shipping
                  </Button>
                  <Button 
                    type="submit" 
                    className="gold-button flex items-center"
                  >
                    Review Order
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
      case 3:
        const formValues = form.getValues();
        const shippingAddress = formValues.shipping;
        const billingAddress = formValues.sameAsShipping ? formValues.shipping : formValues.billing;
        
        return (
          <div>
            <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">Review Order</h2>
            
            <div className="mb-8 space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-naaz-green mb-3">Shipping Address</h3>
                <p className="text-gray-600">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                <p className="text-gray-600">{shippingAddress.address1}</p>
                {shippingAddress.address2 && <p className="text-gray-600">{shippingAddress.address2}</p>}
                <p className="text-gray-600">{shippingAddress.city}, {shippingAddress.state}, {shippingAddress.postcode}</p>
                <p className="text-gray-600">{shippingAddress.country}</p>
                <p className="text-gray-600">{shippingAddress.phone}</p>
                <Button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-naaz-gold hover:underline mt-2 text-sm"
                  variant="link"
                >
                  Edit
                </Button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-naaz-green mb-3">Payment Method</h3>
                <p className="text-gray-600">
                  {formValues.paymentMethod === "card" && "Credit/Debit Card"}
                  {formValues.paymentMethod === "cod" && "Cash on Delivery"}
                  {formValues.paymentMethod === "razorpay" && "Razorpay"}
                </p>
                <Button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="text-naaz-gold hover:underline mt-2 text-sm"
                  variant="link"
                >
                  Edit
                </Button>
              </div>
              
              {formValues.notes && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-naaz-green mb-3">Order Notes</h3>
                  <p className="text-gray-600">{formValues.notes}</p>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium text-naaz-green mb-4">Order Summary</h3>
            <div className="border-t border-gray-200 pt-4 mb-6">
              {cart.items.map((item) => (
                <div key={`${item.productId}-${item.variationId || ''}`} className="flex py-4 border-b border-gray-200">
                  <div className="w-16 h-16 bg-naaz-cream flex-shrink-0 rounded overflow-hidden">
                    <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-naaz-green">{item.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-naaz-green">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">₹{shipping.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax (5%)</span>
                <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
                <span className="text-lg font-medium text-naaz-green">Total</span>
                <span className="text-lg font-bold text-naaz-green">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            {error && <FormError error={error} className="mb-4" />}
            
            <div className="pt-6 flex justify-between">
              <Button 
                type="button" 
                onClick={() => setStep(2)} 
                className="text-naaz-green hover:text-naaz-gold transition-colors"
                variant="ghost"
              >
                Return to payment
              </Button>
              
              {formValues.paymentMethod === "razorpay" ? (
                <RazorpayCheckoutButton
                  shippingAddress={shippingAddress}
                  billingAddress={billingAddress}
                  shippingCost={shipping}
                  taxAmount={tax}
                  email={shippingAddress.email}
                />
              ) : (
                <CheckoutButton
                  shippingAddress={shippingAddress}
                  billingAddress={billingAddress}
                  shippingCost={shipping}
                  taxAmount={tax}
                  paymentMethod={formValues.paymentMethod}
                  notes={formValues.notes}
                />
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-playfair font-bold text-naaz-green">Checkout</h1>
          </div>
          
          <div className="mb-10">
            <div className="flex items-center">
              <div className={`flex-1 ${step >= 1 ? 'text-naaz-green' : 'text-gray-400'}`}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 1 ? 'bg-naaz-green text-white' : 
                    step > 1 ? 'bg-naaz-gold text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Shipping</span>
                </div>
              </div>
              
              <div className={`w-full max-w-[100px] h-1 ${step > 1 ? 'bg-naaz-gold' : 'bg-gray-200'}`}></div>
              
              <div className={`flex-1 ${step >= 2 ? 'text-naaz-green' : 'text-gray-400'}`}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 2 ? 'bg-naaz-green text-white' : 
                    step > 2 ? 'bg-naaz-gold text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Payment</span>
                </div>
              </div>
              
              <div className={`w-full max-w-[100px] h-1 ${step > 2 ? 'bg-naaz-gold' : 'bg-gray-200'}`}></div>
              
              <div className={`flex-1 ${step >= 3 ? 'text-naaz-green' : 'text-gray-400'}`}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 3 ? 'bg-naaz-green text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Review</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                {renderStep()}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-6 pb-4 border-b border-gray-200">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={`${item.productId}-${item.variationId || ''}`} className="flex items-center">
                      <div className="w-12 h-12 bg-naaz-cream rounded overflow-hidden">
                        <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-4 flex-grow">
                        <p className="text-sm font-medium text-naaz-green">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-naaz-green">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₹{shipping.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <span className="text-gray-800 font-semibold">Total</span>
                    <span className="font-bold text-naaz-green">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
