'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Package, User, Eye, RefreshCw, Trash2 } from 'lucide-react';

interface SalesOrder {
  SalesOrderID: number;
  OrderDate: string;
  SalesOrderNumber: string;
  CustomerName: string;
  SubTotal: number;
  TaxAmt: number;
  Freight: number;
  TotalDue: number;
  ItemCount: number;
  CreatedAt: string;
}

interface OrderDetail {
  SalesOrderDetailID: number;
  ProductName: string;
  ProductNumber: string;
  OrderQty: number;
  UnitPrice: number;
  LineTotal: number;
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/invoices/history');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      setOrders(result.data.orders);
    } catch (error) {
      setError('Failed to load order history');
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      setDetailsLoading(true);
      const response = await fetch(`http://localhost:5001/api/invoices/${orderId}/details`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const result = await response.json();
      setOrderDetails(result.data.details);
    } catch (error) {
      console.error('Fetch order details error:', error);
      setOrderDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = (order: SalesOrder) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.SalesOrderID);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDeleteOrder = async (orderId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the view details
    
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(orderId);
      const response = await fetch(`http://localhost:5001/api/invoices/${orderId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      // Remove the order from the list
      setOrders(orders.filter(order => order.SalesOrderID !== orderId));
      
      // Clear selected order if it was the deleted one
      if (selectedOrder?.SalesOrderID === orderId) {
        setSelectedOrder(null);
        setOrderDetails([]);
      }

      setError('');
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete order. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice History</h1>
        <p className="text-gray-600">
          View all processed invoices and their extracted data
        </p>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(orders.reduce((sum, order) => sum + order.TotalDue, 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(order => {
                  const orderDate = new Date(order.CreatedAt || order.OrderDate);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return orderDate >= weekAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.length > 0 
                  ? formatCurrency(orders.reduce((sum, order) => sum + order.TotalDue, 0) / orders.length)
                  : '$0.00'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {orders.length === 0 ? (
              <div className="p-6 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Process some invoices to see them here
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.SalesOrderID}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedOrder?.SalesOrderID === order.SalesOrderID ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleViewDetails(order)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-black">
                        {order.SalesOrderNumber || `Order #${order.SalesOrderID}`}
                      </p>
                      <p className="text-sm text-gray-700">
                        {order.CustomerName || 'Unknown Customer'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(order.OrderDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        {formatCurrency(order.TotalDue)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.ItemCount} items
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <button
                          onClick={(e) => handleDeleteOrder(order.SalesOrderID, e)}
                          disabled={deleteLoading === order.SalesOrderID}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete order"
                        >
                          {deleteLoading === order.SalesOrderID ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          </div>
          
          <div className="p-6">
            {!selectedOrder ? (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select an order to view details</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Order Header */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {selectedOrder.SalesOrderNumber || `Order #${selectedOrder.SalesOrderID}`}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-2 text-gray-900">{formatDate(selectedOrder.OrderDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Customer:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.CustomerName || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                  {detailsLoading ? (
                    <div className="text-center py-4">
                      <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
                    </div>
                  ) : orderDetails.length === 0 ? (
                    <p className="text-gray-500 text-sm">No items found</p>
                  ) : (
                    <div className="space-y-2">
                      {orderDetails.map((detail) => (
                        <div key={detail.SalesOrderDetailID} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-semibold text-black">{detail.ProductName}</p>
                            <p className="text-xs text-gray-600">{detail.ProductNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-black">
                              {detail.OrderQty} × {formatCurrency(detail.UnitPrice)}
                            </p>
                            <p className="text-sm font-semibold text-black">
                              {formatCurrency(detail.LineTotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal:</span>
                      <span className="text-gray-900">{formatCurrency(selectedOrder.SubTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax:</span>
                      <span className="text-gray-900">{formatCurrency(selectedOrder.TaxAmt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Freight:</span>
                      <span className="text-gray-900">{formatCurrency(selectedOrder.Freight)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base border-t pt-2 text-gray-900">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.TotalDue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
