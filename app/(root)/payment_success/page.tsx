"use client"

import useCart from "@/lib/hooks/useCart";
import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle, ShoppingBag } from "lucide-react";

const SuccessfulPayment = () => {
  const cart = useCart();

  useEffect(() => {
    cart.clearCart();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-8 px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle size={64} className="text-green-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-heading2-bold text-green-600">Payment Successful!</h1>
          <p className="text-body-medium text-grey-2">Thank you for your purchase</p>
        </div>

        <div className="bg-grey-1 p-6 rounded-lg max-w-md">
          <h2 className="text-body-bold mb-3">What's Next?</h2>
          <ul className="text-small-medium text-grey-2 space-y-2 text-left">
            <li>• Your order has been confirmed</li>
            <li>• You'll receive an email confirmation shortly</li>
            <li>• Track your order in the Orders section</li>
            <li>• Estimated delivery: 3-5 business days</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/orders"
            className="flex items-center gap-2 px-6 py-3 border border-black text-black font-bold rounded-lg hover:bg-black hover:text-white transition-colors"
          >
            <ShoppingBag size={20} />
            View Orders
          </Link>
          
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-grey-2 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="text-center pt-4">
          <p className="text-small-medium text-grey-2">
            Need help? Contact us at{" "}
            <a href="tel:+917013418146" className="text-black font-bold hover:underline">
              +917013418146
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessfulPayment;