"use client";

import useCart from "@/lib/hooks/useCart";

import { useUser } from "@clerk/nextjs";
import { MinusCircle, PlusCircle, Trash, X, CheckCircle, Smartphone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Cart = () => {
  const router = useRouter();
  const { user } = useUser();
  const cart = useCart();
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const total = cart.cartItems.reduce(
    (acc, cartItem) => acc + cartItem.item.price * cartItem.quantity,
    0
  );
  const totalRounded = parseFloat(total.toFixed(2));

  const customer = {
    clerkId: user?.id,
    email: user?.emailAddresses[0].emailAddress,
    name: user?.fullName,
  };

  const handleUPIPayment = async () => {
    try {
      if (!user) {
        router.push("sign-in");
        return;
      }
      setShowUPIModal(true);
    } catch (err) {
      console.log("[upi_payment_error]", err);
    }
  };

  const handlePaymentComplete = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Create order in database
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          cartItems: cart.cartItems, 
          customer,
          paymentMethod: "UPI",
          totalAmount: totalRounded
        }),
      });

      if (res.ok) {
        setShowUPIModal(false);
        router.push("/payment_success");
      } else {
        throw new Error("Failed to create order");
      }
    } catch (err) {
      console.log("[order_creation_error]", err);
      alert("Failed to process order. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const generateUPILink = () => {
    const upiId = "pdk7893@oksbi";
    const amount = totalRounded;
    const note = `Borcelle Store Order - ${cart.cartItems.length} items`;
    
    return `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  return (
    <div className="flex gap-20 py-16 px-10 max-lg:flex-col max-sm:px-3">
      <div className="w-2/3 max-lg:w-full">
        <p className="text-heading3-bold">Shopping Cart</p>
        <hr className="my-6" />

        {cart.cartItems.length === 0 ? (
          <p className="text-body-bold">No item in cart</p>
        ) : (
          <div>
            {cart.cartItems.map((cartItem) => (
              <div key={cartItem.item._id} className="w-full flex max-sm:flex-col max-sm:gap-3 hover:bg-grey-1 px-4 py-3 items-center max-sm:items-start justify-between">
                <div className="flex items-center">
                  <Image
                    src={cartItem.item.media[0]}
                    width={100}
                    height={100}
                    className="rounded-lg w-32 h-32 object-cover"
                    alt="product"
                  />
                  <div className="flex flex-col gap-3 ml-4">
                    <p className="text-body-bold">{cartItem.item.title}</p>
                    {cartItem.color && (
                      <p className="text-small-medium">{cartItem.color}</p>
                    )}
                    {cartItem.size && (
                      <p className="text-small-medium">{cartItem.size}</p>
                    )}
                    <p className="text-small-medium">₹{cartItem.item.price}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <MinusCircle
                    className="hover:text-red-1 cursor-pointer"
                    onClick={() => cart.decreaseQuantity(cartItem.item._id)}
                  />
                  <p className="text-body-bold">{cartItem.quantity}</p>
                  <PlusCircle
                    className="hover:text-red-1 cursor-pointer"
                    onClick={() => cart.increaseQuantity(cartItem.item._id)}
                  />
                </div>

                <Trash
                  className="hover:text-red-1 cursor-pointer"
                  onClick={() => cart.removeItem(cartItem.item._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-1/3 max-lg:w-full flex flex-col gap-8 bg-grey-1 rounded-lg px-4 py-5">
        <p className="text-heading4-bold pb-4">
          Summary{" "}
          <span>{`(${cart.cartItems.length} ${
            cart.cartItems.length > 1 ? "items" : "item"
          })`}</span>
        </p>
        <div className="flex justify-between text-body-semibold">
          <span>Total Amount</span>
          <span>₹ {totalRounded}</span>
        </div>
        <button
          className="border rounded-lg text-body-bold bg-white py-3 w-full hover:bg-black hover:text-white transition-colors"
          onClick={handleUPIPayment}
          disabled={cart.cartItems.length === 0}
        >
          Pay with UPI
        </button>
      </div>

      {/* UPI Payment Modal */}
      {showUPIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-heading3-bold">UPI Payment</h2>
              <button
                onClick={() => setShowUPIModal(false)}
                className="text-grey-2 hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-grey-1 p-4 rounded-lg">
                <p className="text-body-bold mb-2">Order Summary</p>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-bold">₹{totalRounded}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{cart.cartItems.length}</span>
                </div>
              </div>

              <div className="border-2 border-dashed border-grey-2 p-4 rounded-lg">
                <p className="text-body-bold mb-2 flex items-center gap-2">
                  <Smartphone size={20} />
                  UPI Payment Details
                </p>
                <div className="space-y-2">
                  <div>
                    <span className="text-small-medium text-grey-2">UPI ID:</span>
                    <p className="font-bold text-lg">pdk7893@oksbi</p>
                  </div>
                  <div>
                    <span className="text-small-medium text-grey-2">Amount:</span>
                    <p className="font-bold text-lg">₹{totalRounded}</p>
                  </div>
                  <div>
                    <span className="text-small-medium text-grey-2">Support:</span>
                    <p className="font-bold">+917013418146</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-body-bold">Payment Instructions:</p>
                <ol className="list-decimal list-inside space-y-2 text-small-medium">
                  <li>Open your UPI app (PhonePe, Paytm, GPay, etc.)</li>
                  <li>Send ₹{totalRounded} to UPI ID: <strong>pdk7893@oksbi</strong></li>
                  <li>Or use the "Open UPI App" button below</li>
                  <li>Complete the payment in your UPI app</li>
                  <li>Return here and click "Payment Done"</li>
                </ol>
              </div>

              <div className="space-y-3">
                <a
                  href={generateUPILink()}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-center block hover:bg-green-700 transition-colors"
                >
                  Open UPI App
                </a>

                <button
                  onClick={handlePaymentComplete}
                  disabled={isProcessingPayment}
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-bold hover:bg-grey-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Payment Done
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-small-medium text-grey-2">
                  Need help? Contact us at{" "}
                  <a href="tel:+917013418146" className="text-black font-bold">
                    +917013418146
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;