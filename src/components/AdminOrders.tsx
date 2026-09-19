import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Smartphone,
  MapPin,
  User,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Filter,
  Search,
  Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCedis } from '../utils/whatsapp';
import { Order, OrderStatus, OrderItem } from '../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <CheckCircle className="w-3 h-3" /> },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Package className="w-3 h-3" /> },
  ready: { label: 'Ready', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: <XCircle className="w-3 h-3" /> },
};

export const AdminOrders: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ orderId: string; orderName: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      console.log('📋 Fetching orders from Supabase...');
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching orders:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('✅ Orders fetched successfully:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      console.log(`🔄 Updating order ${orderId} status to ${newStatus}...`);
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Error updating order status:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        alert(`Failed to update order status: ${error.message}`);
        throw error;
      }

      console.log('✅ Order status updated successfully:', data);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setDeletingOrder(orderId);
    try {
      console.log(`🗑️ Deleting order ${orderId}...`);
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('❌ Error deleting order:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        alert(`Failed to delete order: ${error.message}`);
        throw error;
      }

      console.log('✅ Order deleted successfully');
      
      // Remove from local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
      // Close modal if the deleted order was selected
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      
      setDeleteConfirmDialog(null);
    } catch (error) {
      console.error('❌ Error deleting order:', error);
    } finally {
      setDeletingOrder(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSearch = 
        !searchQuery || 
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.momo_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);
  }, [orders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-['Outfit',sans-serif]">
              Orders Dashboard
            </h2>
            <p className="text-xs text-stone-500">
              {orders.length} total orders
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            statusFilter === 'all'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          All ({orders.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status as OrderStatus)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === status
                ? config.color
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {config.label} ({statusCounts[status as OrderStatus] || 0})
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, MoMo reference, or item name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-stone-500">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-semibold text-stone-900 mb-1">No orders found</h3>
          <p className="text-xs text-stone-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your filters or search query'
              : 'Orders will appear here when customers place them'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-amber-300 transition-colors cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-stone-400 shrink-0" />
                    <span className="font-semibold text-stone-900 text-sm truncate">
                      {order.customer_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[order.status].color}`}>
                  {STATUS_CONFIG[order.status].icon}
                  {STATUS_CONFIG[order.status].label}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3 h-3 text-stone-400 shrink-0" />
                  <span className="font-mono font-semibold text-stone-700">{order.momo_reference}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package className="w-3 h-3 text-stone-400 shrink-0" />
                  <span className="text-stone-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatCedis(order.total_amount)}
                  </span>
                </div>

                {order.order_type === 'delivery' && order.delivery_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                    <span className="text-stone-600 truncate">{order.delivery_address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-stone-200 bg-amber-50/50 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 font-['Outfit',sans-serif]">Order Details</h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Customer Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Customer Information</h4>
                <div className="bg-stone-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-400" />
                    <span className="text-sm font-medium text-stone-900">{selectedOrder.customer_name}</span>
                  </div>
                  {selectedOrder.phone && (
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-stone-400" />
                      <span className="text-sm text-stone-600">{selectedOrder.phone}</span>
                    </div>
                  )}
                  {selectedOrder.order_type === 'delivery' && selectedOrder.delivery_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-stone-600">{selectedOrder.delivery_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* MoMo Reference */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Payment Details</h4>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-500 mb-1">MoMo Transaction ID</p>
                      <p className="font-mono font-bold text-stone-900 text-sm">{selectedOrder.momo_reference}</p>
                    </div>
                    <span className="text-lg font-bold text-amber-800">{formatCedis(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Order Items</h4>
                <div className="bg-stone-50 rounded-xl p-3 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-500">{item.quantity}x</span>
                        <span className="font-medium text-stone-900">{item.productName}</span>
                      </div>
                      <span className="font-semibold text-stone-700">{formatCedis(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.special_instructions && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Special Instructions</h4>
                  <div className="bg-stone-50 rounded-xl p-3">
                    <p className="text-sm text-stone-600">{selectedOrder.special_instructions}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Order Timeline</h4>
                <div className="bg-stone-50 rounded-xl p-3 space-y-1 text-xs text-stone-500">
                  <div className="flex justify-between">
                    <span>Placed:</span>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{formatDate(selectedOrder.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Update Actions */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
              <div>
                <p className="text-xs font-semibold text-stone-700 mb-2">Update Order Status:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrder.id, status as OrderStatus)}
                      disabled={updatingStatus === selectedOrder.id || selectedOrder.status === status}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedOrder.status === status
                          ? config.color + ' ring-2 ring-offset-1'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      } disabled:opacity-50`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Delete Order Button */}
              <div className="pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmDialog({ orderId: selectedOrder.id, orderName: selectedOrder.customer_name })}
                  disabled={deletingOrder === selectedOrder.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmDialog && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setDeleteConfirmDialog(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Delete Order?</h3>
                <p className="text-xs text-stone-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-sm text-stone-600 mb-6">
              Are you sure you want to permanently delete the order from <strong>{deleteConfirmDialog.orderName}</strong>? This will remove it from the database and cannot be recovered.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmDialog(null)}
                disabled={deletingOrder === deleteConfirmDialog.orderId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteOrder(deleteConfirmDialog.orderId)}
                disabled={deletingOrder === deleteConfirmDialog.orderId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {deletingOrder === deleteConfirmDialog.orderId ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
