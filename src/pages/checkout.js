import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
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
        router.push("/auth/login");
      } else {
        setUser(currentUser);
      }
    });
    return unsub;
  }, [router]);

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
    const subtotal = orderItems.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const shipping = subtotal > 500 ? 0 : 50;
    const tax = subtotal * 0.18;
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
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

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      notify.error("Select delivery address");
      return;
    }
    setProcessing(true);
    try {
      const token = await user.getIdToken();
      const { subtotal, shipping, tax, total } = calculateTotals();
      console.log("Order items:", orderItems);
      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
      const orderPayload = {
        items: orderItems.items,
        deliveryAddress: selectedAddress,
        orderDate: new Date().toISOString(),
        buyerName: user.displayName || user.email,
        userId: user.uid,
        businessName: user.businessName || "",
        subtotal: subtotal,
        shipping: shipping,
        taxAmount: tax,
        totalAmount: total,
        paymentMethod,
        customizations: orderItems.customizations || {
          customText: "custom text",
          customImages: [],
          specialMessage: "custom message",
        },
      };
      console.log("Placing order with payload:", orderPayload);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });
      const r = await res.json();
      if (r.success) {
        router.push(`/order-success?orderId=${r.data.id}`);
      } else {
        notify.error(r.error || "Order failed");
      }
    } catch {
      notify.error("Order failed");
    } finally {
      setProcessing(false);
    }
  }

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

  const { subtotal, shipping, tax, total } = calculateTotals();

  return (
    <>
      <Head>
        <title>Checkout - Desi Gifting</title>
        <meta name="description" content="Complete your order" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {orderItems.items.map((item, i) => (
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
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>₹{item.price}</p>
                        <p className="text-xs">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <CustomizationsView
                  customImages={orderItems.customizations?.customImages}
                  customText={orderItems.customizations.customText}
                  specialMessage={orderItems.customizations.specialMessage}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    Delivery Address
                  </h2>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center text-blue-600"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" /> Add New
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPinIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No addresses found</p>
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className={`block border p-4 rounded cursor-pointer ${
                          selectedAddressId === a.id
                            ? "border-blue-500 bg-blue-50"
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
                            <p className="text-sm">{a.phone}</p>
                            <p className="text-sm">
                              {a.addressLine1}
                              {a.addressLine2 && `, ${a.addressLine2}`}
                            </p>
                            <p className="text-sm">
                              {a.city}, {a.state} - {a.pincode}
                            </p>
                          </div>
                          {selectedAddressId === a.id && (
                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {showAddAddress && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Add Address</h3>
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
                          <label className="block text-sm font-medium">
                            {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
                            {f !== "addressLine2" && "*"}
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
                            className="w-full border px-3 py-2 rounded"
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
                        Set as default
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowAddAddress(false)}
                          className="flex-1 bg-gray-200 py-2 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddAddress}
                          className="flex-1 bg-blue-600 text-white py-2 rounded"
                        >
                          Add Address
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded shadow">
                <h2 className="font-semibold mb-4 flex items-center">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Payment Method
                </h2>
                {[
                  {
                    id: "razorpay",
                    icon: CreditCardIcon,
                    title: "Online Payment",
                    desc: "UPI, Cards, NetBanking",
                  },
                  {
                    id: "cod",
                    icon: TruckIcon,
                    title: "Cash on Delivery",
                    desc: "Pay at delivery",
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`block border p-4 rounded mb-3 cursor-pointer ${
                      paymentMethod === opt.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <opt.icon className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">{opt.title}</p>
                          <p className="text-sm text-gray-600">{opt.desc}</p>
                        </div>
                      </div>
                      {paymentMethod === opt.id && (
                        <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </label>
                ))}
                <div className="mt-4 text-sm flex items-center">
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Secure & encrypted
                </div>
              </div>

              <div className="bg-white p-6 rounded shadow sticky top-4">
                <h2 className="font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({orderItems.length} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={processing || !selectedAddressId}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded disabled:bg-gray-400"
                >
                  {processing
                    ? "Processing..."
                    : `Place Order - ₹${total.toFixed(2)}`}
                </button>
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
// import Image from "next/image";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../lib/firebase";
// import Header from "../components/Header";
// import Footer from "../components/Footer";
// import { notify } from "../lib/notifications";
// import {
//   MapPinIcon,
//   CreditCardIcon,
//   TruckIcon,
//   ShieldCheckIcon,
//   PlusIcon,
//   CheckCircleIcon,
//   XMarkIcon,
//   ChevronDownIcon,
//   ChevronUpIcon,
// } from "@heroicons/react/24/outline";

// function CustomizationsView({
//   customImages = [],
//   customText = "",
//   specialMessage = "",
// }) {
//   const [open, setOpen] = useState(false);
//   if (!customImages.length && !customText && !specialMessage) return null;
//   return (
//     <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
//       <button
//         onClick={() => setOpen(!open)}
//         className="w-full flex justify-between items-center text-gray-800 font-medium"
//       >
//         <span>View Customizations</span>
//         {open ? (
//           <ChevronUpIcon className="w-5 h-5" />
//         ) : (
//           <ChevronDownIcon className="w-5 h-5" />
//         )}
//       </button>
//       {open && (
//         <div className="mt-4 space-y-4">
//           {customText && (
//             <div>
//               <p className="text-sm text-gray-600 font-medium">Custom Text:</p>
//               <p className="text-sm text-gray-800">{customText}</p>
//             </div>
//           )}
//           {specialMessage && (
//             <div>
//               <p className="text-sm text-gray-600 font-medium">
//                 Special Message:
//               </p>
//               <p className="text-sm text-gray-800">{specialMessage}</p>
//             </div>
//           )}
//           {customImages.length > 0 && (
//             <div>
//               <p className="text-sm text-gray-600 font-medium">
//                 Uploaded Images:
//               </p>
//               <div className="mt-2 flex flex-wrap gap-2">
//                 {customImages.map((img) => (
//                   <div
//                     key={img.id}
//                     className="w-20 h-20 border rounded-lg overflow-hidden"
//                   >
//                     <img
//                       src={img.url}
//                       alt={img.name}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default function Checkout() {
//   const router = useRouter();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [orderItems, setOrderItems] = useState([]);
//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddressId, setSelectedAddressId] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("razorpay");
//   const [showAddAddress, setShowAddAddress] = useState(false);
//   const [processing, setProcessing] = useState(false);

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
//         router.push("/auth/login");
//       } else {
//         setUser(currentUser);
//       }
//     });
//     return unsub;
//   }, [router]);

//   useEffect(() => {
//     if (user) {
//       loadCheckoutData();
//       loadUserAddresses();
//     }
//   }, [user]);

//   function loadCheckoutData() {
//     try {
//       const checkoutData = sessionStorage.getItem("checkoutData");
//       if (!checkoutData) {
//         notify.error("No items to checkout");
//         router.push("/products");
//         return;
//       }
//       const data = JSON.parse(checkoutData);
//       setOrderItems(data.items || []);
//       setLoading(false);
//     } catch {
//       notify.error("Failed to load checkout data");
//       router.push("/products");
//     }
//   }

//   async function loadUserAddresses() {
//     try {
//       const token = await user.getIdToken();
//       const res = await fetch("/api/user/addresses", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const result = await res.json();
//       if (result.success) {
//         setAddresses(result.data);
//         const def = result.data.find((a) => a.isDefault) || result.data[0];
//         if (def) setSelectedAddressId(def.id);
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   function calculateTotals() {
//     const subtotal = orderItems.reduce(
//       (sum, i) => sum + i.price * i.quantity,
//       0
//     );
//     const shipping = subtotal > 500 ? 0 : 50;
//     const tax = subtotal * 0.18;
//     return { subtotal, shipping, tax, total: subtotal + shipping + tax };
//   }

//   async function handleAddAddress() {
//     for (const f of [
//       "name",
//       "phone",
//       "addressLine1",
//       "city",
//       "state",
//       "pincode",
//     ]) {
//       if (!newAddress[f]) {
//         notify.error(`Please enter ${f}`);
//         return;
//       }
//     }
//     try {
//       const token = await user.getIdToken();
//       const res = await fetch("/api/user/addresses", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newAddress),
//       });
//       const r = await res.json();
//       if (r.success) {
//         setAddresses((p) => [...p, r.data]);
//         setSelectedAddressId(r.data.id);
//         setShowAddAddress(false);
//         setNewAddress({
//           name: "",
//           phone: "",
//           addressLine1: "",
//           addressLine2: "",
//           city: "",
//           state: "",
//           pincode: "",
//           isDefault: false,
//         });
//         notify.success("Address added");
//       } else {
//         notify.error(r.error || "Failed to add address");
//       }
//     } catch {
//       notify.error("Failed to add address");
//     }
//   }

//   async function handlePlaceOrder() {
//     if (!selectedAddressId) {
//       notify.error("Select delivery address");
//       return;
//     }
//     setProcessing(true);
//     try {
//       const token = await user.getIdToken();
//       const { total } = calculateTotals();
//       const res = await fetch("/api/orders", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           items: orderItems,
//           addressId: selectedAddressId,
//           paymentMethod,
//           totalAmount: total,
//         }),
//       });
//       const r = await res.json();
//       console.log("Order response issss: ", r);
//       console.log(r);
//       if (r.success) {
//         router.push(`/order-success?orderId=${r.data.id}`);
//       } else {
//         notify.error(r.error || "Order failed");
//       }
//     } catch {
//       notify.error("Order failed");
//     } finally {
//       setProcessing(false);
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
//           <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             <div className="lg:col-span-2 space-y-6">
//               <div className="h-40 bg-gray-300 rounded"></div>
//               <div className="h-60 bg-gray-300 rounded"></div>
//             </div>
//             <div className="h-80 bg-gray-300 rounded"></div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   const { subtotal, shipping, tax, total } = calculateTotals();

//   return (
//     <>
//       <Head>
//         <title>Checkout - Desi Gifting</title>
//         <meta name="description" content="Complete your order" />
//       </Head>
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <div className="max-w-7xl mx-auto px-4 py-8">
//           <h1 className="text-2xl font-bold mb-8">Checkout</h1>
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             <div className="lg:col-span-2 space-y-6">
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h2 className="font-semibold mb-4">Order Items</h2>
//                 <div className="space-y-4">
//                   {orderItems.map((item, i) => (
//                     <div
//                       key={i}
//                       className="flex items-center border-b last:border-b-0 py-4"
//                     >
//                       <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
//                         {item.images?.[0]?.url ? (
//                           <Image
//                             src={item.images[0].url}
//                             alt={item.name}
//                             width={64}
//                             height={64}
//                             className="object-cover"
//                           />
//                         ) : (
//                           <div className="flex items-center justify-center h-full text-gray-400">
//                             No Image
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex-1 px-4">
//                         <h3 className="truncate font-medium">{item.name}</h3>
//                         <p className="text-sm text-gray-600">
//                           Qty: {item.quantity}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p>₹{item.price}</p>
//                         <p className="text-xs">
//                           ₹{(item.price * item.quantity).toFixed(2)}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <CustomizationsView
//                   customImages={orderItems[0]?.customImages}
//                   customText={orderItems[0]?.customText}
//                   specialMessage={orderItems[0]?.specialMessage}
//                 />
//               </div>

//               <div className="bg-white p-6 rounded-lg shadow">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="font-semibold flex items-center">
//                     <MapPinIcon className="w-5 h-5 mr-2" />
//                     Delivery Address
//                   </h2>
//                   <button
//                     onClick={() => setShowAddAddress(true)}
//                     className="flex items-center text-blue-600"
//                   >
//                     <PlusIcon className="w-4 h-4 mr-1" /> Add New
//                   </button>
//                 </div>
//                 {addresses.length === 0 ? (
//                   <div className="text-center py-8">
//                     <MapPinIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
//                     <p>No addresses found</p>
//                     <button
//                       onClick={() => setShowAddAddress(true)}
//                       className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
//                     >
//                       Add Address
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {addresses.map((a) => (
//                       <label
//                         key={a.id}
//                         className={`block border p-4 rounded cursor-pointer ${
//                           selectedAddressId === a.id
//                             ? "border-blue-500 bg-blue-50"
//                             : "border-gray-200 hover:border-gray-300"
//                         }`}
//                       >
//                         <input
//                           type="radio"
//                           name="address"
//                           value={a.id}
//                           checked={selectedAddressId === a.id}
//                           onChange={() => setSelectedAddressId(a.id)}
//                           className="sr-only"
//                         />
//                         <div className="flex justify-between">
//                           <div>
//                             <p className="font-medium">{a.name}</p>
//                             <p className="text-sm">{a.phone}</p>
//                             <p className="text-sm">
//                               {a.addressLine1}
//                               {a.addressLine2 && `, ${a.addressLine2}`}
//                             </p>
//                             <p className="text-sm">
//                               {a.city}, {a.state} - {a.pincode}
//                             </p>
//                           </div>
//                           {selectedAddressId === a.id && (
//                             <CheckCircleIcon className="w-5 h-5 text-blue-600" />
//                           )}
//                         </div>
//                       </label>
//                     ))}
//                   </div>
//                 )}

//                 {showAddAddress && (
//                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//                     <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto space-y-4">
//                       <div className="flex justify-between items-center mb-4">
//                         <h3 className="font-semibold">Add Address</h3>
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
//                       ].map((f) => (
//                         <div key={f}>
//                           <label className="block text-sm font-medium">
//                             {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
//                             {f !== "addressLine2" && "*"}
//                           </label>
//                           <input
//                             type="text"
//                             value={newAddress[f]}
//                             onChange={(e) =>
//                               setNewAddress((p) => ({
//                                 ...p,
//                                 [f]: e.target.value,
//                               }))
//                             }
//                             className="w-full border px-3 py-2 rounded"
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
//                           className="flex-1 bg-gray-200 py-2 rounded"
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           onClick={handleAddAddress}
//                           className="flex-1 bg-blue-600 text-white py-2 rounded"
//                         >
//                           Add Address
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="space-y-6">
//               <div className="bg-white p-6 rounded shadow">
//                 <h2 className="font-semibold mb-4 flex items-center">
//                   <CreditCardIcon className="w-5 h-5 mr-2" />
//                   Payment Method
//                 </h2>
//                 {[
//                   {
//                     id: "razorpay",
//                     icon: CreditCardIcon,
//                     title: "Online Payment",
//                     desc: "UPI, Cards, NetBanking",
//                   },
//                   {
//                     id: "cod",
//                     icon: TruckIcon,
//                     title: "Cash on Delivery",
//                     desc: "Pay at delivery",
//                   },
//                 ].map((opt) => (
//                   <label
//                     key={opt.id}
//                     className={`block border p-4 rounded mb-3 cursor-pointer ${
//                       paymentMethod === opt.id
//                         ? "border-blue-500 bg-blue-50"
//                         : "border-gray-200"
//                     }`}
//                   >
//                     <input
//                       type="radio"
//                       name="payment"
//                       value={opt.id}
//                       checked={paymentMethod === opt.id}
//                       onChange={(e) => setPaymentMethod(e.target.value)}
//                       className="sr-only"
//                     />
//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center">
//                         <opt.icon className="w-6 h-6 text-blue-600 mr-3" />
//                         <div>
//                           <p className="font-medium">{opt.title}</p>
//                           <p className="text-sm text-gray-600">{opt.desc}</p>
//                         </div>
//                       </div>
//                       {paymentMethod === opt.id && (
//                         <CheckCircleIcon className="w-5 h-5 text-blue-600" />
//                       )}
//                     </div>
//                   </label>
//                 ))}
//                 <div className="mt-4 text-sm flex items-center">
//                   <ShieldCheckIcon className="w-4 h-4 mr-2" />
//                   Secure & encrypted
//                 </div>
//               </div>

//               <div className="bg-white p-6 rounded shadow sticky top-4">
//                 <h2 className="font-semibold mb-4">Order Summary</h2>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span>Subtotal ({orderItems.length} items)</span>
//                     <span>₹{subtotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Shipping</span>
//                     <span>
//                       {shipping === 0 ? (
//                         <span className="text-green-600">FREE</span>
//                       ) : (
//                         `₹${shipping.toFixed(2)}`
//                       )}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>GST (18%)</span>
//                     <span>₹{tax.toFixed(2)}</span>
//                   </div>
//                   <hr />
//                   <div className="flex justify-between font-semibold">
//                     <span>Total</span>
//                     <span>₹{total.toFixed(2)}</span>
//                   </div>
//                 </div>
//                 <button
//                   onClick={handlePlaceOrder}
//                   disabled={processing || !selectedAddressId}
//                   className="w-full mt-6 bg-blue-600 text-white py-3 rounded disabled:bg-gray-400"
//                 >
//                   {processing
//                     ? "Processing..."
//                     : `Place Order - ₹${total.toFixed(2)}`}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     </>
//   );
// }
