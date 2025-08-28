import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../common/Modal';
import { 
  PlusIcon, 
  CheckCircleIcon,
  PencilIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { notify } from '../../lib/notifications';

const AddressSelector = ({ selectedAddress, onAddressSelect, className = '' }) => {
  const { user, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false
  });

  const resetForm = () => {
    setNewAddress({
      label: '',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      isDefault: false
    });
    setEditingAddress(null);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    let result;
    if (editingAddress) {
      result = await updateAddress(editingAddress.id, newAddress);
    } else {
      result = await addAddress(newAddress);
    }

    if (result.success) {
      setShowAddModal(false);
      resetForm();
      if (result.address) {
        onAddressSelect(result.address);
      }
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setNewAddress(address);
    setShowAddModal(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const result = await deleteAddress(addressId);
      if (result.success && selectedAddress?.id === addressId) {
        onAddressSelect(null);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    const result = await setDefaultAddress(addressId);
    if (result.success) {
      const updatedAddress = user.addresses.find(addr => addr.id === addressId);
      if (updatedAddress) {
        onAddressSelect(updatedAddress);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-outline btn-sm"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add New
        </button>
      </div>

      {/* Existing Addresses */}
      <div className="space-y-3">
        {user?.addresses?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📍</div>
            <p>No addresses saved yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary btn-sm mt-3"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          user?.addresses?.map((address) => (
            <div
              key={address.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedAddress?.id === address.id
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1"
                  onClick={() => onAddressSelect(address)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{address.label}</h4>
                    {address.isDefault && (
                      <span className="badge badge-primary text-xs">Default</span>
                    )}
                    {selectedAddress?.id === address.id && (
                      <CheckCircleIcon className="h-5 w-5 text-primary-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="font-medium">{address.name}</div>
                    <div>{address.street}</div>
                    <div>{address.city}, {address.state} {address.zipCode}</div>
                    <div>{address.country}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    title="Edit address"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                    title="Delete address"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Set as Default Button */}
              {!address.isDefault && selectedAddress?.id === address.id && (
                <div className="mt-3 pt-3 border-t border-primary-200">
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Set as default address
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Address Button */}
      {user?.addresses && user.addresses.length > 0 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add New Address</span>
        </button>
      )}

      {/* Add/Edit Address Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
        size="md"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Address Label *</label>
              <input
                type="text"
                className="form-input"
                value={newAddress.label}
                onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Home, Office"
                required
              />
            </div>
            <div>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={newAddress.name}
                onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Street Address *</label>
            <input
              type="text"
              className="form-input"
              value={newAddress.street}
              onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
              placeholder="123 Main Street, Apt 4B"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                value={newAddress.city}
                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                placeholder="New York"
                required
              />
            </div>
            <div>
              <label className="form-label">State *</label>
              <input
                type="text"
                className="form-input"
                value={newAddress.state}
                onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                placeholder="NY"
                required
              />
            </div>
            <div>
              <label className="form-label">ZIP Code *</label>
              <input
                type="text"
                className="form-input"
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="10001"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Country *</label>
            <select
              className="form-input"
              value={newAddress.country}
              onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
              required
            >
              <option value="USA">United States</option>
              <option value="Canada">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="Australia">Australia</option>
            </select>
          </div>

          {!editingAddress && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                className="custom-radio mr-2"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              {editingAddress ? 'Update Address' : 'Add Address'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddressSelector;
