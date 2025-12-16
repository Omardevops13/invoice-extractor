'use client';

import { useState } from 'react';
import { Save, Edit2, Check, X, DollarSign, Calendar, User, Package } from 'lucide-react';

interface LineItem {
  productId: number | string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface ExtractedData {
  orderDate: string;
  dueDate: string;
  invoiceNumber: string;
  customerInfo: {
    name: string;
    address: string;
    customerId: number;
  };
  lineItems: LineItem[];
  totals: {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    freight: number;
    total: number;
  };
  confidence: number;
  processingTime: number;
}

interface ExtractedDataViewProps {
  data: ExtractedData;
  onSave: (data: ExtractedData) => void;
  isSaved: boolean;
  savedOrderId: number | null;
}

export default function ExtractedDataView({ data, onSave, isSaved, savedOrderId }: ExtractedDataViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ExtractedData>(data);

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(data);
    setIsEditing(false);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newLineItems = [...editedData.lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    
    // Recalculate line total
    if (field === 'quantity' || field === 'unitPrice') {
      newLineItems[index].lineTotal = newLineItems[index].quantity * newLineItems[index].unitPrice;
    }
    
    // Recalculate totals
    const subtotal = newLineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const taxAmount = subtotal * editedData.totals.taxRate;
    const total = subtotal + taxAmount + editedData.totals.freight;
    
    setEditedData({
      ...editedData,
      lineItems: newLineItems,
      totals: {
        ...editedData.totals,
        subtotal,
        taxAmount,
        total
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Confidence Score */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            data.confidence >= 0.9 ? 'bg-green-500' : 
            data.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-700 font-medium">
            Confidence: {(data.confidence * 100).toFixed(1)}%
          </span>
        </div>
        <span className="text-sm text-gray-700 font-medium">
          Processed in {data.processingTime.toFixed(1)}s
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Data
            </button>
            <button
              onClick={() => onSave(editedData)}
              disabled={isSaved}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isSaved
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaved ? `Saved (Order #${savedOrderId})` : 'Save to Database'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Invoice Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">Order Date</label>
          </div>
          {isEditing ? (
            <input
              type="date"
              value={editedData.orderDate}
              onChange={(e) => setEditedData({ ...editedData, orderDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{editedData.orderDate}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">Due Date</label>
          </div>
          {isEditing ? (
            <input
              type="date"
              value={editedData.dueDate}
              onChange={(e) => setEditedData({ ...editedData, dueDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{editedData.dueDate}</p>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="space-y-3">
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <label className="text-sm font-medium text-gray-700">Customer Information</label>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="font-medium">{editedData.customerInfo.name}</p>
          <p className="text-sm text-gray-600">{editedData.customerInfo.address}</p>
          <p className="text-sm text-gray-600">Customer ID: {editedData.customerInfo.customerId}</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center">
          <Package className="h-4 w-4 text-gray-400 mr-2" />
          <label className="text-sm font-medium text-gray-700">Line Items</label>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {editedData.lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-black">{item.description}</p>
                      <p className="text-xs text-gray-600">ID: {item.productId}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-16 p-1 border border-gray-300 rounded text-sm"
                        min="1"
                      />
                    ) : (
                      <span className="text-sm font-medium text-black">{item.quantity}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-20 p-1 border border-gray-300 rounded text-sm"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <span className="text-sm font-medium text-black">${item.unitPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm font-semibold text-black">
                      ${item.lineTotal.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-3">
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
          <label className="text-sm font-medium text-gray-700">Totals</label>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-700">Subtotal:</span>
            <span className="text-sm font-semibold text-black">${editedData.totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-700">
              Tax ({(editedData.totals.taxRate * 100).toFixed(3)}%):
            </span>
            <span className="text-sm font-semibold text-black">${editedData.totals.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-700">Freight:</span>
            <span className="text-sm font-semibold text-black">${editedData.totals.freight.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-black">Total:</span>
            <span className="font-bold text-lg text-black">${editedData.totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
