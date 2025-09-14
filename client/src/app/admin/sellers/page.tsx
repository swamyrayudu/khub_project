"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Sun, 
  Moon, 
  Search, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Shield,
  Loader2,
  Download,
  Filter,
  Users
} from 'lucide-react';

interface Seller {
  id: number;
  email: string;
  name: string;
  shop_name: string;
  status: 'pending' | 'success' | 'active' | 'rejected' | 'suspended';
  created_at: string;
  email_verified: boolean;
}

export default function SellersAdmin() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchSellers();
    initializeTheme();
  }, []);

  useEffect(() => {
    filterSellers();
  }, [sellers, searchTerm, statusFilter]);

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const fetchSellers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/sellers');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSellers(data.sellers || []);
        toast.success(`Loaded ${data.sellers?.length || 0} sellers`);
      } else {
        throw new Error(data.message || 'Failed to fetch sellers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sellers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterSellers = () => {
    let filtered = sellers;

    if (searchTerm) {
      filtered = filtered.filter(seller => 
        seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.shop_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(seller => seller.status === statusFilter);
    }

    setFilteredSellers(filtered);
  };

  const updateSellerStatus = async (sellerId: number, newStatus: string) => {
    if (newStatus === 'rejected' || newStatus === 'suspended') {
      const confirmed = window.confirm(
        `Are you sure you want to ${newStatus === 'rejected' ? 'reject' : 'suspend'} this seller?`
      );
      if (!confirmed) return;
    }

    setUpdatingStatus(sellerId);

    try {
      const response = await fetch('/api/admin/sellers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sellerId, status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update seller status');
      }

      const data = await response.json();
      
      if (data.success) {
        setSellers(prevSellers => 
          prevSellers.map(seller => 
            seller.id === sellerId 
              ? { ...seller, status: newStatus as Seller['status'] }
              : seller
          )
        );
        
        toast.success(`Seller status updated to ${newStatus}`);
      } else {
        throw new Error(data.message || 'Failed to update seller status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update seller status';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'success':
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-700';
      case 'suspended':
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sellers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-background">
        <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Sellers</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchSellers}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sellers Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage seller registrations and account statuses
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {darkMode ? 'Light' : 'Dark'}
            </button>
            
            <button
              onClick={fetchSellers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { status: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600 dark:text-yellow-400' },
            { status: 'success', label: 'success', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
            { status: 'active', label: 'Active', icon: Shield, color: 'text-blue-600 dark:text-blue-400' },
            { status: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-600 dark:text-red-400' },
          ].map(({ status, label, icon: Icon, color }) => {
            const count = sellers.filter(s => s.status === status).length;
            return (
              <div key={status} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold text-foreground">{count}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by email, name, or shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-input text-foreground"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-input appearance-none text-foreground min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="success">success</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredSellers.length} of {sellers.length} sellers
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Seller Info</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Shop</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Joined</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{seller.email}</span>
                          {seller.email_verified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{seller.name}</p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-foreground font-medium">{seller.shop_name || 'N/A'}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(seller.status)}`}>
                        {getStatusIcon(seller.status)}
                        {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-foreground">
                          {new Date(seller.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(seller.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={seller.status}
                          onChange={(e) => updateSellerStatus(seller.id, e.target.value)}
                          disabled={updatingStatus === seller.id}
                          className="text-sm bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:opacity-50 disabled:cursor-not-allowed text-foreground min-w-[120px]"
                        >
                          <option value="pending">Pending</option>
                          <option value="success">success</option>
                          <option value="active">Active</option>
                          <option value="rejected">Rejected</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        
                        {updatingStatus === seller.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSellers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No sellers found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No sellers have registered yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
