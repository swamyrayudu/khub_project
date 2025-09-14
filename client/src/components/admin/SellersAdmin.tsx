"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  Download
} from 'lucide-react';

interface Seller {
  id: number;
  email: string;
  name: string;
  shop_name: string;
  status: 'pending' | 'success' | 'active' | 'rejected' | 'suspended';
  created_at: string;
  email_verified: boolean;
  contact?: string;
  updated_at?: string;
}

interface StatusUpdateData {
  sellerId: number;
  status: string;
}

export default function SellersAdmin() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    filterSellers();
  }, [sellers, searchTerm, statusFilter]);

  const fetchSellers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/sellers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
      console.error('Fetch sellers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterSellers = () => {
    let filtered = sellers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(seller => 
        seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.shop_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(seller => seller.status === statusFilter);
    }

    setFilteredSellers(filtered);
  };

  const updateSellerStatus = async (sellerId: number, newStatus: string) => {
    // Show confirmation for destructive actions
    if (newStatus === 'rejected' || newStatus === 'suspended') {
      const confirmed = window.confirm(
        `Are you sure you want to ${newStatus === 'rejected' ? 'reject' : 'suspend'} this seller? This action will affect their access to the platform.`
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
        body: JSON.stringify({ 
          sellerId, 
          status: newStatus 
        } as StatusUpdateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Optimistic update
        setSellers(prevSellers => 
          prevSellers.map(seller => 
            seller.id === sellerId 
              ? { ...seller, status: newStatus as Seller['status'], updated_at: new Date().toISOString() }
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
      console.error('Update status error:', err);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportSellers = () => {
    const csvContent = [
      ['Email', 'Name', 'Shop Name', 'Status', 'Email Verified', 'Created At'].join(','),
      ...filteredSellers.map(seller => [
        seller.email,
        seller.name,
        seller.shop_name,
        seller.status,
        seller.email_verified ? 'Yes' : 'No',
        new Date(seller.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sellers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sellers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Sellers Management</h1>
          <p className="text-muted-foreground">
            Manage seller registrations and account statuses
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportSellers}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { status: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600' },
          { status: 'success', label: 'success', icon: CheckCircle, color: 'text-green-600' },
          { status: 'active', label: 'Active', icon: UserCheck, color: 'text-blue-600' },
          { status: 'rejected', label: 'Rejected', icon: UserX, color: 'text-red-600' },
        ].map(({ status, label, icon: Icon, color }) => {
          const count = sellers.filter(s => s.status === status).length;
          return (
            <div key={status} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold text-card-foreground">{count}</p>
                </div>
                <Icon className={`w-8 h-8 ${color}`} />
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
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-background"
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
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-card-foreground">Seller Info</th>
                <th className="text-left px-6 py-4 font-medium text-card-foreground">Shop</th>
                <th className="text-left px-6 py-4 font-medium text-card-foreground">Status</th>
                <th className="text-left px-6 py-4 font-medium text-card-foreground">Joined</th>
                <th className="text-left px-6 py-4 font-medium text-card-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-card-foreground">{seller.email}</span>
                        {seller.email_verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{seller.name}</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="text-card-foreground">{seller.shop_name || 'N/A'}</span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(seller.status)}`}>
                      {getStatusIcon(seller.status)}
                      {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-card-foreground">
                        {new Date(seller.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(seller.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
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
                        className="text-sm border border-border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
            <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No sellers found</h3>
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
  );
}
