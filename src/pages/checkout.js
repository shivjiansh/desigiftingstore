import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Script from "next/script";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { notify } from "../lib/notifications";
import {
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

function CustomizationsView({
  customImages = [],
  customText = "",
  specialMessage = "",
}) {
  const [open, setOpen] = useState(false);
  if (!customImages.length && !customText && !specialMessage) return null;

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-gray-800 font-medium"
      >
        <span>View Customizations</span>
        {open ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          {customText && (
            <div>
              <p className="text-sm text-gray-600 font-medium">Custom Text:</p>
              <p className="text-sm text-gray-800">{customText}</p>
            </div>
          )}
          {specialMessage && (
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Special Message:
              </p>
              <p className="text-sm text-gray-800">{specialMessage}</p>
            </div>
          )}
          {customImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Uploaded Images:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {customImages.map((img) => (
                  <div
                    key={img.id}
                    className="w-20 h-20 border rounded-lg overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Checkout() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isCod,setCodData] = useState(true);
  // Email status tracking
  const [emailStatus, setEmailStatus] = useState({
    buyer: "pending", // 'pending', 'sending', 'sent', 'failed'
    seller: "pending",
  });

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        notify.error("Please login to checkout");
        router.push("buyer/auth/login");
      } else {
        setUser(currentUser);
      }
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.Razorpay) {
        setRazorpayLoaded(true);
      } else if (!razorpayLoaded) {
        console.log("Razorpay script load timeout, checking manually...");
        if (typeof window !== "undefined" && window.Razorpay) {
          setRazorpayLoaded(true);
        }
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [razorpayLoaded]);

  useEffect(() => {
    if (user) {
      loadCheckoutData();
      loadUserAddresses();
      
    }
  }, [user]);

  function loadCheckoutData() {
    try {
      const checkoutData = sessionStorage.getItem("checkoutData");
      if (!checkoutData) {
        notify.error("No items to checkout");
        router.push("/products");
        return;
      }
      const data = JSON.parse(checkoutData);
      setOrderItems(data || []);
      setLoading(false);
      console.log("******",data);
      setCodData(data.items[0].cod);
     
     
    } catch {
      notify.error("Failed to load checkout data");
      router.push("/products");
    }
  }

  async function loadUserAddresses() {
    try {
      
      const token = await user.getIdToken();
      const res = await fetch("/api/user/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setAddresses(result.data);
        const def = result.data.find((a) => a.isDefault) || result.data[0];
        if (def) setSelectedAddressId(def.id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function calculateTotals() {
    const subtotal =
      orderItems.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;
    const shipping = 0;     //shippint always zero
    const platformFee = 0;  //platform fee till dec
    return {
      subtotal,
      shipping,
      platformFee,
      total: subtotal + shipping + platformFee,
    };
  }

  async function handleAddAddress() {
    for (const f of [
      "name",
      "phone",
      "addressLine1",
      "city",
      "state",
      "pincode",
    ]) {
      if (!newAddress[f]) {
        notify.error(`Please enter ${f}`);
        return;
      }
    }
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
      });
      const r = await res.json();
      if (r.success) {
        setAddresses((p) => [...p, r.data]);
        setSelectedAddressId(r.data.id);
        setShowAddAddress(false);
        setNewAddress({
          name: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
        });
        notify.success("Address added");
      } else {
        notify.error(r.error || "Failed to add address");
      }
    } catch {
      notify.error("Failed to add address");
    }
  }

  // 📧 EMAIL SENDING FUNCTIONS
  //customer email send
  async function sendOrderConfirmationEmail(orderData) {
    try {
      setEmailStatus((prev) => ({ ...prev, buyer: "sending" }));

      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

      const emailPayload = {
        customerEmail: user.email,
        customerName: user.displayName || user.email.split("@")[0],
        orderId: orderData.id,
        productName: orderData.items?.[0]?.name || "Custom Gift",
        sellerName: orderData.items?.[0]?.businessName || "DesiGifting Partner",
        amount: orderData.totalAmount,

        expectedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-IN"),
        orderUrl: `${window.location.origin}/orders`,
        deliveryAddress: selectedAddress
          ? `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
          : "",
      };

      const response = await fetch("/api/email/order-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      const result = await response.json();

      if (result.success) {
        setEmailStatus((prev) => ({ ...prev, buyer: "sent" }));
        console.log("✅ Buyer confirmation email sent");
        return true;
      } else {
        setEmailStatus((prev) => ({ ...prev, buyer: "failed" }));
        console.error("❌ Buyer email failed:", result.error);
        return false;
      }
    } catch (error) {
      setEmailStatus((prev) => ({ ...prev, buyer: "failed" }));
      console.error("❌ Buyer email service error:", error);
      return false;
    }
  }

  //seller email order recieved
  async function sendSellerOrderAlert(orderData) {
    try {
      setEmailStatus((prev) => ({ ...prev, seller: "sending" }));
      console.log("oder dat#########",orderData);
      const sellerEmailPayload = {
        sellerEmail: orderData.items?.[0]?.sellerEmail || "sellerEmail@example.com",
        sellerName: orderData.items?.[0]?.businessName || "Seller",
        orderId: orderData.id,
        customerName: user.displayName || user.email.split("@")[0],
        productName: orderData.items?.[0]?.name || "Custom Gift",
        amount: orderData.totalAmount,
        
        expectedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-IN"),
        dashboardUrl: `${window.location.origin}/seller/orders`,
      };

      const response = await fetch("/api/email/seller-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sellerEmailPayload),
      });

      const result = await response.json();

      if (result.success) {
        setEmailStatus((prev) => ({ ...prev, seller: "sent" }));
        console.log("✅ Seller alert email sent");
        return true;
      } else {
        setEmailStatus((prev) => ({ ...prev, seller: "failed" }));
        console.error("❌ Seller email failed:", result.error);
        return false;
      }
    } catch (error) {
      setEmailStatus((prev) => ({ ...prev, seller: "failed" }));
      console.error("❌ Seller email service error:", error);
      return false;
    }
  }

  async function sendPaymentConfirmation(orderData, paymentId) {
    try {
      const emailPayload = {
        customerEmail: user.email,
        customerName: user.displayName || user.email.split("@")[0],
        orderId: orderData.id,
        amount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        transactionId: paymentId,
      };

      const response = await fetch("/api/email/payment-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      const result = await response.json();
      if (result.success) {
        console.log("✅ Payment confirmation email sent");
      }
    } catch (error) {
      console.error("❌ Payment confirmation email failed:", error);
    }
  }

  // Create Razorpay order
  async function createRazorpayOrder(orderData) {
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: orderData.totalAmount,
          currency: "INR",
          receipt: `order_${Date.now()}`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to create Razorpay order");
      }
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      throw error;
    }
  }

  // Handle Razorpay payment with email integration
  async function handleRazorpayPayment(orderData) {
    if (!razorpayLoaded) {
      notify.error("Payment system is loading. Please try again.");
      return;
    }

    try {
      const razorpayOrder = await createRazorpayOrder(orderData);
      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "DesiGifting",
        description: "Payment for your personalized gift",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            setProcessing(true);

            // Verify payment
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${await user.getIdToken()}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              // Create order after successful payment
              const finalOrderData = {
                ...orderData,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                paymentStatus: "completed",
              };

              const orderResponse = await fetch("/api/orders", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${await user.getIdToken()}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(finalOrderData),
              });

              const orderResult = await orderResponse.json();

              if (orderResult.success) {
                // 📧 Send emails after successful order creation
                console.log("🎉 Order created successfully, sending emails...");

                // Send emails in parallel (non-blocking)
                Promise.allSettled([
                  sendOrderConfirmationEmail(orderResult.data),
                  sendSellerOrderAlert(orderResult.data),
                  sendPaymentConfirmation(
                    orderResult.data,
                    response.razorpay_payment_id
                  ),
                ]).then((results) => {
                  const failedEmails = results.filter(
                    (r) => r.status === "rejected"
                  ).length;
                  if (failedEmails > 0) {
                    console.warn(`⚠️ ${failedEmails} email(s) failed to send`);
                  }
                });

                // Clear checkout data and redirect
                sessionStorage.removeItem("checkoutData");
                notify.success("Order placed successfully!");
                router.push(`/order-success?orderId=${orderResult.data.id}`);
              } else {
                notify.error("Order creation failed after payment");
              }
            } else {
              notify.error("Payment verification failed");
            }
          } catch (error) {
            console.error("Post-payment processing error:", error);
            notify.error("Payment completed but order processing failed");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: selectedAddress?.name || user.displayName,
          email: user.email,
          contact: selectedAddress?.phone || "",
        },
        notes: {
          address: selectedAddress
            ? `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state}`
            : "",
        },
        theme: {
          color: "#059669",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            notify.error("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);
      notify.error(error.message || "Payment initialization failed");
      setProcessing(false);
    }
  }

  // Handle Cash on Delivery with email integration
  async function handleCODPayment(orderData) {
    try {
      const token = await user.getIdToken();
      const finalOrderData = {
        ...orderData,
        paymentStatus: "pending",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalOrderData),
      });

      const result = await response.json();

      if (result.success) {
        // 📧 Send emails for COD order
        console.log("🎉 COD Order created successfully, sending emails...");

        // Send emails in parallel
        Promise.allSettled([
          sendOrderConfirmationEmail(result.data),
          sendSellerOrderAlert(result.data),
        ]).then((results) => {
          const failedEmails = results.filter(
            (r) => r.status === "rejected"
          ).length;
          if (failedEmails > 0) {
            console.warn(`⚠️ ${failedEmails} email(s) failed to send`);
          }
        });

        // Clear checkout data and redirect
        sessionStorage.removeItem("checkoutData");
        notify.success("Order placed successfully!");
        router.push(`/order-success?orderId=${result.data.id}`);
      } else {
        notify.error(result.error || "Order failed");
      }
    } catch (error) {
      console.error("COD order error:", error);
      notify.error("Order failed");
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      notify.error("Select delivery address");
      return;
    }

    setProcessing(true);

    // Reset email status
    setEmailStatus({ buyer: "pending", seller: "pending" });

    try {
      const { subtotal, shipping, platformFee, total } = calculateTotals();
      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

      const orderPayload = {
        items: orderItems.items,
        deliveryAddress: selectedAddress,
        orderDate: new Date().toISOString(),
        buyerName: user.displayName || user.email,
        userId: user.uid,
        businessName: orderItems.items?.[0]?.businessName || "",
        sellerId: orderItems.items?.[0]?.sellerId,
        subtotal: subtotal,
        platformFee: platformFee,
        totalAmount: total + (paymentMethod === "cod" ? 60 : 0),
        paymentMethod,
        isCod:orderItems.items[0].cod,
        customizations: orderItems.customizations || {
          customText: "custom text",
          customImages: [],
          specialMessage: "custom message",
        },
       
      };

      console.log("Placing order with payload:", orderPayload);

      // Route to appropriate payment handler
      if (paymentMethod === "razorpay") {
        await handleRazorpayPayment(orderPayload);
      } else if (paymentMethod === "cod") {
        await handleCODPayment(orderPayload);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      notify.error("Order failed");
      setProcessing(false);
    }
  }

  // Email Status Component
  const EmailStatusIndicator = () => {
    if (emailStatus.buyer === "pending" && emailStatus.seller === "pending") {
      return null;
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-700">Email Notifications</span>
        </div>

        <div className="space-y-2 text-sm">
          {/* Buyer email status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Order confirmation:</span>
            <div className="flex items-center">
              {emailStatus.buyer === "sending" && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent mr-1"></div>
                  Sending...
                </div>
              )}
              {emailStatus.buyer === "sent" && (
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Sent
                </div>
              )}
              {emailStatus.buyer === "failed" && (
                <div className="flex items-center text-red-600">
                  <XMarkIcon className="w-3 h-3 mr-1" />
                  Failed
                </div>
              )}
            </div>
          </div>

          {/* Seller email status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Seller notification:</span>
            <div className="flex items-center">
              {emailStatus.seller === "sending" && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent mr-1"></div>
                  Sending...
                </div>
              )}
              {emailStatus.seller === "sent" && (
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Sent
                </div>
              )}
              {emailStatus.seller === "failed" && (
                <div className="flex items-center text-red-600">
                  <XMarkIcon className="w-3 h-3 mr-1" />
                  Failed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-40 bg-gray-300 rounded"></div>
              <div className="h-60 bg-gray-300 rounded"></div>
            </div>
            <div className="h-80 bg-gray-300 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { subtotal, shipping, platformFee, total } = calculateTotals();

  return (
    <>
      <Head>
        <title>Checkout - DesiGifting</title>
        <meta
          name="description"
          content="Complete your personalized gift order"
        />
      </Head>

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          console.error("Failed to load Razorpay");
          notify.error("Payment system failed to load");
        }}
      />

      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">Checkout</h1>

          {/* Email Status Indicator */}
          <EmailStatusIndicator />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items Section */}
              {/* <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {orderItems.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center border-b last:border-b-0 py-4"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        {item.images?.[0]?.url ? (
                          <Image
                            src={item.images[0].url}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 px-4">
                        <h3 className="truncate font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          by {item.businessName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right ">
                        <p className="font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        
                      </div>
                    </div>
                  ))}
                </div>
                <CustomizationsView
                  customImages={orderItems.customizations?.customImages}
                  customText={orderItems.customizations?.customText}
                  specialMessage={orderItems.customizations?.specialMessage}
                />
              </div> */}

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Items
                </h2>
                <div className="space-y-6">
                  {orderItems.items && orderItems.items.length > 0 ? (
                    orderItems.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="border-b last:border-b-0 pb-6 last:pb-0"
                      >
                        <div className="flex gap-4">
                          {item.images &&
                            item.images.length > 0 &&
                            item.images[0]?.url && (
                              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={item.images[0].url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.businessName}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Qty: {item.quantity} × ₹
                              {parseFloat(item.price).toFixed(2)}
                            </p>
                            <p className="font-semibold text-emerald-600 mt-2">
                              ₹
                              {(item.quantity * parseFloat(item.price)).toFixed(
                                2
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Variant/Set Details */}
                        {(item.selectedVariant || item.selectedSet) && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded p-3 mt-3">
                            {item.selectedVariant && (
                              <div className="text-sm">
                                <p className="text-gray-700">
                                  <span className="font-medium">Variant:</span>{" "}
                                  {item.selectedVariant.name}
                                </p>
                                {item.selectedVariant.description && (
                                  <p className="text-gray-600 text-xs">
                                    {item.selectedVariant.description}
                                  </p>
                                )}
                              </div>
                            )}
                            {item.selectedSet && (
                              <div className="text-sm">
                                <p className="text-gray-700">
                                  <span className="font-medium">Set:</span>{" "}
                                  {item.selectedSet.name}
                                </p>
                                <p className="text-gray-600 text-xs">
                                  {item.selectedSet.quantity} items included
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Customizations */}
                        <CustomizationsView
                          customImages={orderItems.customizations?.customImages}
                          customText={orderItems.customizations?.customText}
                          specialMessage={
                            orderItems.customizations?.specialMessage
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No items in order</p>
                  )}
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    Delivery Address
                  </h2>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center text-emerald-600 hover:text-emerald-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" /> Add New
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPinIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">No addresses found</p>
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className={`block border p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedAddressId === a.id
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={a.id}
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="sr-only"
                        />
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{a.name}</p>
                            <p className="text-sm text-gray-600">{a.phone}</p>
                            <p className="text-sm text-gray-600">
                              {a.addressLine1}
                              {a.addressLine2 && `, ${a.addressLine2}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {a.city}, {a.state} - {a.pincode}
                            </p>
                          </div>
                          {selectedAddressId === a.id && (
                            <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Add Address Modal */}
                {showAddAddress && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Add New Address</h3>
                        <button onClick={() => setShowAddAddress(false)}>
                          <XMarkIcon className="w-6 h-6" />
                        </button>
                      </div>
                      {[
                        "name",
                        "phone",
                        "addressLine1",
                        "addressLine2",
                        "city",
                        "state",
                        "pincode",
                      ].map((f) => (
                        <div key={f}>
                          <label className="block text-sm font-medium mb-1">
                            {f.charAt(0).toUpperCase() +
                              f.slice(1).replace(/([A-Z])/g, " $1")}
                            {f !== "addressLine2" && " *"}
                          </label>
                          <input
                            type="text"
                            value={newAddress[f]}
                            onChange={(e) =>
                              setNewAddress((p) => ({
                                ...p,
                                [f]: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required={f !== "addressLine2"}
                          />
                        </div>
                      ))}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={(e) =>
                            setNewAddress((p) => ({
                              ...p,
                              isDefault: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        Set as default address
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowAddAddress(false)}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddAddress}
                          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                        >
                          Add Address
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary & Payment */}
            <div className="space-y-6">
              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="font-semibold mb-4 flex items-center">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Payment Method
                </h2>

                {[
                  {
                    id: "razorpay",
                    icon: CreditCardIcon,
                    title: "Online Payment",
                    desc: "UPI, Cards, NetBanking via Razorpay",
                    badge: "Recommended",
                    badgeColor: "bg-green-100 text-green-800",
                    available: true,
                  },
                  {
                    id: "cod",
                    icon: TruckIcon,
                    title: "Cash on Delivery",
                    desc: "Pay when you receive your gift",
                    badge: "₹60 extra charges",
                    badgeColor: "bg-orange-100 text-orange-800",
                    available: isCod,
                  },
                ].map((opt) => {
                  const disabled = !opt.available;
                  const selected = paymentMethod === opt.id;

                  return (
                    <label
                      key={opt.id}
                      className={[
                        "block border p-4 rounded-lg mb-3 transition-all",
                        disabled
                          ? "border-gray-200 opacity-60 cursor-not-allowed"
                          : "cursor-pointer",
                        selected && !disabled
                          ? "border-emerald-600 bg-emerald-50 shadow-sm"
                          : !disabled
                          ? "border-gray-200 hover:border-gray-300"
                          : "",
                      ].join(" ")}
                      aria-disabled={disabled}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.id}
                        checked={selected}
                        onChange={(e) =>
                          !disabled && setPaymentMethod(e.target.value)
                        }
                        className="sr-only"
                        disabled={disabled}
                        aria-label={opt.title}
                      />

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <opt.icon
                            className={`w-6 h-6 mr-3 ${
                              disabled ? "text-gray-400" : "text-emerald-600"
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                className={`font-medium ${
                                  disabled ? "text-gray-500" : ""
                                }`}
                              >
                                {opt.title}
                              </p>
                              {opt.badge && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${opt.badgeColor}`}
                                >
                                  {opt.badge}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600">{opt.desc}</p>

                            {disabled && (
                              <p className="mt-1 text-xs text-red-600">
                                {opt.id === "cod"
                                  ? "COD is not available for this product"
                                  : "This payment option is not available"}
                              </p>
                            )}
                          </div>
                        </div>

                        {selected && !disabled && (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </label>
                  );
                })}

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600">
                    <ShieldCheckIcon className="w-4 h-4 mr-2 text-emerald-600" />
                    <span>
                      SSL encrypted • Secure payments • PCI DSS compliant
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white p-6 rounded-lg shadow sticky top-4">
                <h2 className="font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal (Inclusive of GST)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        `₹${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="flex justify-between">
                      <span>COD Charges</span>
                      <span>₹60.00</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>
                      {platformFee === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        `₹${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <hr className="my-3" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>
                      ₹{(total + (paymentMethod === "cod" ? 60 : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {!razorpayLoaded && paymentMethod === "razorpay" && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center text-sm text-yellow-800">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                      Loading payment system...
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    processing ||
                    !selectedAddressId ||
                    (paymentMethod === "razorpay" && !razorpayLoaded)
                  }
                  className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center text-lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {paymentMethod === "razorpay"
                        ? "Processing Payment..."
                        : "Creating Order..."}
                    </>
                  ) : (
                    `Place Order - ₹${(
                      total + (paymentMethod === "cod" ? 60 : 0)
                    ).toFixed(2)}`
                  )}
                </button>

                {paymentMethod === "razorpay" && (
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs text-gray-600 bg-gray-100">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      Secured by Razorpay
                    </div>
                  </div>
                )}

                {/* Email notification info */}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}



// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import Head from "next/head";
// import Script from "next/script";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../lib/firebase";
// import Header from "../components/Header";
// import Footer from "../components/Footer";
// import { notify } from "../lib/notifications";

// // ✅ FIXED: Only import icons that actually exist
// import {
//   MapPinIcon,
//   CreditCardIcon,
//   PlusIcon,
//   CheckCircleIcon,
//   XMarkIcon,
//   ChevronDownIcon,
//   ChevronUpIcon,
// } from "@heroicons/react/24/outline";

// // ✅ Use ExclamationTriangleIcon instead of ExclamationIcon
// import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// export default function Checkout() {
//   const router = useRouter();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [checkoutData, setCheckoutData] = useState(null);
//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddressId, setSelectedAddressId] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("razorpay");
//   const [showAddAddress, setShowAddAddress] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const [razorpayLoaded, setRazorpayLoaded] = useState(false);
//   const [codAvailable, setCodAvailable] = useState(true);
//   const [checkingCod, setCheckingCod] = useState(true);

//   const [newAddress, setNewAddress] = useState({
//     name: "",
//     phone: "",
//     addressLine1: "",
//     addressLine2: "",
//     city: "",
//     state: "",
//     pincode: "",
//     isDefault: false,
//   });

//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (currentUser) => {
//       if (!currentUser) {
//         notify.error("Please login to checkout");
//         router.push("/buyer/auth/login");
//       } else {
//         setUser(currentUser);
//       }
//     });
//     return () => unsub();
//   }, [router]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (typeof window !== "undefined" && window.Razorpay) {
//         setRazorpayLoaded(true);
//       }
//     }, 5000);
//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     if (user) {
//       loadCheckoutData();
//     }
//   }, [user]);

//   const checkCodAvailability = async (items) => {
//     try {
//       setCheckingCod(true);
//       const codChecks = await Promise.all(
//         items.map(async (item) => {
//           try {
//             const response = await fetch(`/api/products?id=${item.productId}`);
//             const result = await response.json();
//             if (result.success) {
//               return result.data.codAvailable !== false;
//             }
//             return true;
//           } catch (error) {
//             return true;
//           }
//         })
//       );
//       const allCodAvailable = codChecks.every((a) => a);
//       setCodAvailable(allCodAvailable);

//       if (!allCodAvailable && paymentMethod === "cod") {
//         setPaymentMethod("razorpay");
//         notify.info("COD not available for this order.");
//       }
//     } catch (error) {
//       console.error("Error checking COD:", error);
//     } finally {
//       setCheckingCod(false);
//     }
//   };

//   const loadCheckoutData = async () => {
//     try {
//       setLoading(true);
//       const data = sessionStorage.getItem("checkoutData");
//       if (data) {
//         const parsed = JSON.parse(data);
//         setCheckoutData(parsed);
//         await checkCodAvailability(parsed.items || []);
//       } else {
//         router.push("/products");
//       }

//       if (user) {
//         try {
//           const idToken = await user.getIdToken();
//           const res = await fetch("/api/user/addresses", {
//             headers: { Authorization: `Bearer ${idToken}` },
//           });
//           if (res.ok) {
//             const addressData = await res.json();
//             setAddresses(addressData.data || []);
//             const defaultAddr = addressData.data?.find((a) => a.isDefault);
//             if (defaultAddr) {
//               setSelectedAddressId(defaultAddr.id);
//             }
//           }
//         } catch (err) {
//           console.error("Error loading addresses:", err);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading checkout data:", error);
//       notify.error("Failed to load checkout data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddAddress = async () => {
//     if (
//       !newAddress.name ||
//       !newAddress.phone ||
//       !newAddress.addressLine1 ||
//       !newAddress.city ||
//       !newAddress.state ||
//       !newAddress.pincode
//     ) {
//       notify.error("Please fill all required fields");
//       return;
//     }

//     try {
//       const idToken = await user.getIdToken();
//       const response = await fetch("/api/user/addresses", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${idToken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newAddress),
//       });

//       if (!response.ok) throw new Error("Failed to add address");

//       const result = await response.json();
//       setAddresses([...addresses, result.data]);
//       setSelectedAddressId(result.data.id);
//       setShowAddAddress(false);
//       setNewAddress({
//         name: "",
//         phone: "",
//         addressLine1: "",
//         addressLine2: "",
//         city: "",
//         state: "",
//         pincode: "",
//         isDefault: false,
//       });
//       notify.success("Address added successfully");
//     } catch (error) {
//       console.error("Error adding address:", error);
//       notify.error("Failed to add address");
//     }
//   };

  // const handlePlaceOrder = async () => {
  //   if (paymentMethod === "cod" && !codAvailable) {
  //     notify.error("Cash on Delivery not available");
  //     return;
  //   }

  //   if (!selectedAddressId) {
  //     notify.error("Please select a delivery address");
  //     return;
  //   }

  //   if (!checkoutData?.items?.length) {
  //     notify.error("No items in order");
  //     return;
  //   }

  //   try {
  //     setProcessing(true);
  //     const idToken = await user.getIdToken();

  //     const orderData = {
  //       ...checkoutData,
  //       addressId: selectedAddressId,
  //       paymentMethod,
  //     };

  //     const response = await fetch("/api/orders", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${idToken}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(orderData),
  //     });

  //     if (!response.ok) throw new Error("Failed to create order");

  //     const result = await response.json();

  //     if (paymentMethod === "cod") {
  //       sessionStorage.removeItem("checkoutData");
  //       router.push(`/order-confirmation/${result.orderId}`);
  //     } else if (paymentMethod === "razorpay") {
  //       if (razorpayLoaded && window.Razorpay) {
  //         console.log("Initiating Razorpay payment");
  //       } else {
  //         notify.error("Payment gateway not loaded");
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error placing order:", error);
  //     notify.error(error.message || "Failed to place order");
  //   } finally {
  //     setProcessing(false);
  //   }
  // };

//   if (loading || checkingCod) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <div className="max-w-6xl mx-auto px-4 py-8">
//           <div className="animate-pulse space-y-4">
//             <div className="h-8 bg-gray-300 rounded w-1/3"></div>
//             <div className="h-64 bg-gray-300 rounded"></div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (!checkoutData) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <div className="max-w-6xl mx-auto px-4 py-8 text-center">
//           <p className="text-gray-600">No items to checkout</p>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   const totalAmount = checkoutData.totalAmount || 0;

//   return (
//     <>
//       <Head>
//         <title>Checkout - Desi Gifting</title>
//       </Head>

//       <div className="min-h-screen bg-gray-50">
//         <Header />

//         <div className="max-w-6xl mx-auto px-4 py-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             <div className="lg:col-span-2 space-y-6">
              // {/* Order Items */}
              // <div className="bg-white rounded-lg shadow-sm border p-6">
              //   <h2 className="text-lg font-semibold text-gray-900 mb-4">
              //     Order Items
              //   </h2>
              //   <div className="space-y-6">
              //     {checkoutData.items && checkoutData.items.length > 0 ? (
              //       checkoutData.items.map((item, idx) => (
              //         <div
              //           key={idx}
              //           className="border-b last:border-b-0 pb-6 last:pb-0"
              //         >
              //           <div className="flex gap-4">
              //             {item.images &&
              //               item.images.length > 0 &&
              //               item.images[0]?.url && (
              //                 <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              //                   <img
              //                     src={item.images[0].url}
              //                     alt={item.name}
              //                     className="w-full h-full object-cover"
              //                   />
              //                 </div>
              //               )}
              //             <div className="flex-1">
              //               <h3 className="font-semibold text-gray-900">
              //                 {item.name}
              //               </h3>
              //               <p className="text-sm text-gray-600">
              //                 {item.businessName}
              //               </p>
              //               <p className="text-sm text-gray-600 mt-1">
              //                 Qty: {item.quantity} × ₹
              //                 {parseFloat(item.price).toFixed(2)}
              //               </p>
              //               <p className="font-semibold text-emerald-600 mt-2">
              //                 ₹
              //                 {(item.quantity * parseFloat(item.price)).toFixed(
              //                   2
              //                 )}
              //               </p>
              //             </div>
              //           </div>

              //           {/* Variant/Set Details */}
              //           {(item.selectedVariant || item.selectedSet) && (
              //             <div className="bg-emerald-50 border border-emerald-200 rounded p-3 mt-3">
              //               {item.selectedVariant && (
              //                 <div className="text-sm">
              //                   <p className="text-gray-700">
              //                     <span className="font-medium">Variant:</span>{" "}
              //                     {item.selectedVariant.name}
              //                   </p>
              //                   {item.selectedVariant.description && (
              //                     <p className="text-gray-600 text-xs">
              //                       {item.selectedVariant.description}
              //                     </p>
              //                   )}
              //                 </div>
              //               )}
              //               {item.selectedSet && (
              //                 <div className="text-sm">
              //                   <p className="text-gray-700">
              //                     <span className="font-medium">Bundle:</span>{" "}
              //                     {item.selectedSet.name}
              //                   </p>
              //                   <p className="text-gray-600 text-xs">
              //                     {item.selectedSet.quantity} items included
              //                   </p>
              //                 </div>
              //               )}
              //             </div>
              //           )}

              //           {/* Customizations */}
              //           {checkoutData.customizations &&
              //             (checkoutData.customizations.customText ||
              //               checkoutData.customizations.specialMessage ||
              //               (checkoutData.customizations.customImages &&
              //                 checkoutData.customizations.customImages.length >
              //                   0)) && (
              //               <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
              //                 <p className="text-sm font-medium text-gray-900 mb-2">
              //                   📝 Customizations
              //                 </p>
              //                 {checkoutData.customizations.customText && (
              //                   <div className="text-sm mb-2">
              //                     <span className="font-medium">Text:</span> "
              //                     {checkoutData.customizations.customText}"
              //                   </div>
              //                 )}
              //                 {checkoutData.customizations.specialMessage && (
              //                   <div className="text-sm mb-2">
              //                     <span className="font-medium">Message:</span>{" "}
              //                     "{checkoutData.customizations.specialMessage}"
              //                   </div>
              //                 )}
              //                 {checkoutData.customizations.customImages &&
              //                   checkoutData.customizations.customImages
              //                     .length > 0 && (
              //                     <div className="text-sm">
              //                       <span className="font-medium">Images:</span>{" "}
              //                       {
              //                         checkoutData.customizations.customImages
              //                           .length
              //                       }{" "}
              //                       uploaded
              //                     </div>
              //                   )}
              //               </div>
              //             )}
              //         </div>
              //       ))
              //     ) : (
              //       <p className="text-gray-500">No items in order</p>
              //     )}
              //   </div>
              // </div>

//               {/* Delivery Address */}
//               <div className="bg-white rounded-lg shadow-sm border p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold text-gray-900 flex items-center">
//                     <MapPinIcon className="w-5 h-5 mr-2" />
//                     Delivery Address
//                   </h2>
//                   <button
//                     onClick={() => setShowAddAddress(true)}
//                     className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
//                   >
//                     <PlusIcon className="w-4 h-4 mr-1" /> Add New
//                   </button>
//                 </div>

//                 {addresses && addresses.length === 0 ? (
//                   <div className="text-center py-6">
//                     <p className="text-gray-600 mb-3">No saved addresses</p>
//                     <button
//                       onClick={() => setShowAddAddress(true)}
//                       className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
//                     >
//                       Add Address
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     {addresses &&
//                       addresses.map((addr) => (
//                         <label
//                           key={addr.id}
//                           className={`block p-3 rounded-lg border-2 cursor-pointer transition ${
//                             selectedAddressId === addr.id
//                               ? "border-emerald-500 bg-emerald-50"
//                               : "border-gray-200 hover:border-emerald-300"
//                           }`}
//                         >
//                           <input
//                             type="radio"
//                             name="address"
//                             value={addr.id}
//                             checked={selectedAddressId === addr.id}
//                             onChange={() => setSelectedAddressId(addr.id)}
//                             className="sr-only"
//                           />
//                           <div className="flex justify-between">
//                             <div className="text-sm">
//                               <p className="font-medium text-gray-900">
//                                 {addr.name}
//                               </p>
//                               <p className="text-gray-600">{addr.phone}</p>
//                               <p className="text-gray-600">
//                                 {addr.addressLine1}
//                                 {addr.addressLine2 && `, ${addr.addressLine2}`}
//                               </p>
//                               <p className="text-gray-600">
//                                 {addr.city}, {addr.state} - {addr.pincode}
//                               </p>
//                             </div>
//                             {selectedAddressId === addr.id && (
//                               <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
//                             )}
//                           </div>
//                         </label>
//                       ))}
//                   </div>
//                 )}

//                 {/* Add Address Modal */}
//                 {showAddAddress && (
//                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                     <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto space-y-4">
//                       <div className="flex justify-between items-center mb-4">
//                         <h3 className="font-semibold">Add New Address</h3>
//                         <button onClick={() => setShowAddAddress(false)}>
//                           <XMarkIcon className="w-6 h-6" />
//                         </button>
//                       </div>
//                       {[
//                         "name",
//                         "phone",
//                         "addressLine1",
//                         "addressLine2",
//                         "city",
//                         "state",
//                         "pincode",
//                       ].map((field) => (
//                         <div key={field}>
//                           <label className="block text-sm font-medium mb-1">
//                             {field
//                               .replace(/([A-Z])/g, " $1")
//                               .replace(/^./, (str) => str.toUpperCase())}
//                             {field !== "addressLine2" && " *"}
//                           </label>
//                           <input
//                             type="text"
//                             value={newAddress[field]}
//                             onChange={(e) =>
//                               setNewAddress((p) => ({
//                                 ...p,
//                                 [field]: e.target.value,
//                               }))
//                             }
//                             className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500"
//                           />
//                         </div>
//                       ))}
//                       <label className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={newAddress.isDefault}
//                           onChange={(e) =>
//                             setNewAddress((p) => ({
//                               ...p,
//                               isDefault: e.target.checked,
//                             }))
//                           }
//                           className="mr-2"
//                         />
//                         Set as default
//                       </label>
//                       <div className="flex gap-3">
//                         <button
//                           onClick={() => setShowAddAddress(false)}
//                           className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           onClick={handleAddAddress}
//                           className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
//                         >
//                           Add
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Payment Method */}
//               <div className="bg-white rounded-lg shadow-sm border p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <CreditCardIcon className="w-5 h-5 mr-2" />
//                   Payment Method
//                 </h2>

//                 <div className="space-y-2">
//                   <button
//                     onClick={() => setPaymentMethod("razorpay")}
//                     className={`w-full p-3 rounded-lg border-2 transition text-left ${
//                       paymentMethod === "razorpay"
//                         ? "border-emerald-500 bg-emerald-50"
//                         : "border-gray-200 hover:border-emerald-300"
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium text-gray-900">
//                           Online Payment
//                         </p>
//                         <p className="text-xs text-gray-600">
//                           Card, UPI, Net Banking
//                         </p>
//                       </div>
//                       {paymentMethod === "razorpay" && (
//                         <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
//                       )}
//                     </div>
//                   </button>

//                   <button
//                     onClick={() => {
//                       if (!codAvailable) {
//                         notify.error("COD not available for this order");
//                         return;
//                       }
//                       setPaymentMethod("cod");
//                     }}
//                     disabled={!codAvailable}
//                     className={`w-full p-3 rounded-lg border-2 transition text-left ${
//                       !codAvailable
//                         ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
//                         : paymentMethod === "cod"
//                         ? "border-emerald-500 bg-emerald-50"
//                         : "border-gray-200 hover:border-emerald-300"
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium text-gray-900">
//                           Cash on Delivery
//                         </p>
//                         <p className="text-xs text-gray-600">
//                           {codAvailable ? "Pay on delivery" : "Not available"}
//                         </p>
//                       </div>
//                       {codAvailable ? (
//                         paymentMethod === "cod" ? (
//                           <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
//                         ) : (
//                           <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
//                         )
//                       ) : (
//                         <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
//                       )}
//                     </div>
//                   </button>
//                 </div>

//                 {!codAvailable && (
//                   <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
//                     ⚠️ Cash on Delivery not available for this order
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Sidebar */}
//             <div className="lg:col-span-1">
//               <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                   Order Summary
//                 </h2>

//                 <div className="space-y-3 text-sm mb-4">
//                   {checkoutData.items && checkoutData.items.length > 0 ? (
//                     checkoutData.items.map((item, idx) => (
//                       <div key={idx} className="flex justify-between">
//                         <span className="text-gray-600 truncate">
//                           {item.name} × {item.quantity}
//                         </span>
//                         <span className="font-medium text-gray-900 flex-shrink-0">
//                           ₹{(item.quantity * parseFloat(item.price)).toFixed(2)}
//                         </span>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-500">No items</p>
//                   )}
//                 </div>

//                 <div className="border-t pt-4 mb-4">
//                   <div className="flex justify-between mb-2">
//                     <span className="text-gray-600">Subtotal</span>
//                     <span className="font-medium">
//                       ₹{totalAmount.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Shipping</span>
//                     <span className="font-medium">Free</span>
//                   </div>
//                 </div>

//                 <div className="border-t pt-4 mb-6">
//                   <div className="flex justify-between items-center">
//                     <span className="font-semibold text-gray-900">Total</span>
//                     <span className="text-2xl font-bold text-emerald-600">
//                       ₹{totalAmount.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>

//                 <button
//                   onClick={handlePlaceOrder}
//                   disabled={processing || !selectedAddressId}
//                   className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:bg-gray-400 transition"
//                 >
//                   {processing ? "Processing..." : "Place Order"}
//                 </button>

//                 <p className="text-xs text-gray-500 text-center mt-4">
//                   By placing order, you agree to our terms
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <Footer />
//       </div>

//       <Script src="https://checkout.razorpay.com/v1/checkout.js" />
//     </>
//   );
// }