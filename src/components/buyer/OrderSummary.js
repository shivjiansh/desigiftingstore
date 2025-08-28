import { formatPrice } from '../../utils/formatters';
import { 
  ShoppingBagIcon,
  TruckIcon,
  MapPinIcon 
} from '@heroicons/react/24/outline';

const OrderSummary = ({ 
  products = [], 
  customizations = {}, 
  shippingAddress = null, 
  showActions = true,
  className = ''
}) => {

  const calculateSubtotal = () => {
    return products.reduce((total, product) => {
      const basePrice = product.price * (product.quantity || 1);
      const productCustomizations = customizations[product.id] || {};

      const customizationPrice = Object.values(productCustomizations).reduce((custTotal, customization) => {
        return custTotal + (customization.price || 0);
      }, 0) * (product.quantity || 1);

      return total + basePrice + customizationPrice;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.085; // 8.5% tax
  const shipping = subtotal >= 50 ? 0 : 5; // Free shipping over $50
  const total = subtotal + tax + shipping;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order Items */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <ShoppingBagIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Order Items ({products.length})</h3>
        </div>

        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.id || index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={product.images?.[0] || '/images/default-product.jpg'}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 line-clamp-1">{product.name}</h4>
                <p className="text-sm text-gray-600">by {product.sellerName}</p>
                <p className="text-sm text-gray-600">Quantity: {product.quantity || 1}</p>

                {/* Customizations */}
                {customizations[product.id] && Object.keys(customizations[product.id]).length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs font-medium text-gray-700">Customizations:</div>
                    {Object.entries(customizations[product.id]).map(([key, value]) => (
                      <div key={key} className="text-xs text-gray-600 flex justify-between">
                        <span className="font-medium">{key}:</span> 
                        <span className="flex items-center space-x-2">
                          <span>{value.value || value}</span>
                          {value.price > 0 && (
                            <span className="text-primary-600 font-medium">
                              +{formatPrice(value.price)}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {formatPrice(product.price * (product.quantity || 1))}
                </div>
                {customizations[product.id] && (
                  <div className="text-xs text-gray-600">
                    +{formatPrice(
                      Object.values(customizations[product.id] || {}).reduce(
                        (sum, c) => sum + (c.price || 0), 0
                      ) * (product.quantity || 1)
                    )} custom
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      {shippingAddress && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <MapPinIcon className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Shipping Address</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-900">
              <div className="font-medium">{shippingAddress.name}</div>
              <div>{shippingAddress.street}</div>
              <div>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</div>
              <div>{shippingAddress.country}</div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Information */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <TruckIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Delivery</h3>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {shipping === 0 ? (
              <>
                <div className="text-success-600 font-medium mb-1">🚚 FREE Shipping</div>
                <div>Estimated delivery: 3-5 business days</div>
              </>
            ) : (
              <>
                <div className="font-medium mb-1">Standard Shipping - {formatPrice(shipping)}</div>
                <div>Estimated delivery: 3-5 business days</div>
                <div className="text-xs text-gray-500 mt-1">
                  Free shipping on orders over $50
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span className={shipping === 0 ? 'text-success-600' : ''}>
              {shipping === 0 ? 'FREE' : formatPrice(shipping)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>

          {shipping === 0 && subtotal >= 50 && (
            <div className="text-xs text-success-600 flex items-center justify-center py-2 bg-success-50 rounded">
              🎉 You saved {formatPrice(5)} on shipping!
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary-600">{formatPrice(total)}</span>
          </div>
        </div>

        {subtotal < 50 && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            💡 Add {formatPrice(50 - subtotal)} more to qualify for free shipping!
          </div>
        )}
      </div>

      {/* Payment Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span>💳 Payment</span>
          <span>Secure Checkout</span>
        </div>
        <div>Your payment information is encrypted and secure. We support all major credit cards and PayPal.</div>
      </div>
    </div>
  );
};

export default OrderSummary;
