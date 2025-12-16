'use client';

import { useState, useEffect } from 'react';
import { Database, Search, Package, Users, MapPin, BarChart3, RefreshCw } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  recentOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface Product {
  ProductID: number;
  Name: string;
  ProductNumber: string;
  ListPrice: number;
  Color: string;
  CategoryName: string;
  SubcategoryName: string;
}

interface Customer {
  CustomerID: number;
  CustomerName: string;
  AccountNumber: string;
  City: string;
  State: string;
}

interface Territory {
  TerritoryID: number;
  Name: string;
  CountryRegionCode: string;
  GroupName: string;
}

export default function DataPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'customers' | 'territories'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTerritories();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'customers') {
      fetchCustomers();
    }
  }, [activeTab, searchTerm]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/data/stats');
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = new URL('http://localhost:5001/api/data/products');
      if (searchTerm) url.searchParams.set('search', searchTerm);
      
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setProducts(result.data.products);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const url = new URL('http://localhost:5001/api/data/customers');
      if (searchTerm) url.searchParams.set('search', searchTerm);
      
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setCustomers(result.data.customers);
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTerritories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/data/territories');
      if (response.ok) {
        const result = await response.json();
        setTerritories(result.data.territories);
      }
    } catch (error) {
      console.error('Fetch territories error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Explorer</h1>
        <p className="text-gray-600">
          Explore the underlying data structure and reference information
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Products</p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(stats.totalProducts)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Customers</p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(stats.totalCustomers)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Orders</p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(stats.totalOrders)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <RefreshCw className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Recent</p>
                <p className="text-lg font-bold text-gray-900">{formatNumber(stats.recentOrders)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Database className="h-6 w-6 text-indigo-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Revenue</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-pink-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Avg Order</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Explorer */}
      <div className="bg-white rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Products ({formatNumber(stats?.totalProducts || 0)})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Customers ({formatNumber(stats?.totalCustomers || 0)})
            </button>
            <button
              onClick={() => setActiveTab('territories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'territories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MapPin className="h-4 w-4 inline mr-2" />
              Territories ({territories.length})
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        {(activeTab === 'products' || activeTab === 'customers') && (
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : (
            <>
              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Color
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.ProductID} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-black">{product.Name}</div>
                              <div className="text-sm text-gray-600">{product.ProductNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-black">{product.CategoryName}</div>
                            <div className="text-sm text-gray-600">{product.SubcategoryName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                            {product.ListPrice > 0 ? formatCurrency(product.ListPrice) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.Color ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.Color || 'No Color'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Customers Tab */}
              {activeTab === 'customers' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.CustomerID} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-black">
                              {customer.CustomerName || 'Unknown Customer'}
                            </div>
                            <div className="text-sm text-gray-600">ID: {customer.CustomerID}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                            {customer.AccountNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                            {customer.City && customer.State 
                              ? `${customer.City}, ${customer.State}`
                              : 'N/A'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Territories Tab */}
              {activeTab === 'territories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {territories.map((territory) => (
                    <div key={territory.TerritoryID} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="font-semibold text-black">{territory.Name}</h3>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">Country: {territory.CountryRegionCode}</p>
                        <p className="font-medium">Group: {territory.GroupName}</p>
                        <p className="text-xs text-gray-600 mt-1">ID: {territory.TerritoryID}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* API Information */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          🔌 API Information
        </h3>
        <div className="text-blue-800 space-y-2">
          <p>• <strong>Backend API:</strong> <a href="http://localhost:5001" target="_blank" className="underline">http://localhost:5001</a></p>
          <p>• <strong>API Documentation:</strong> <a href="http://localhost:5001/api-docs/" target="_blank" className="underline">http://localhost:5001/api-docs/</a></p>
          <p>• <strong>Database:</strong> SQLite with {formatNumber(stats?.totalProducts || 0)} products, {formatNumber(stats?.totalCustomers || 0)} customers</p>
          <p>• <strong>Data Source:</strong> Imported from provided CSV files (Case Study Data.xlsx)</p>
        </div>
      </div>
    </div>
  );
}
