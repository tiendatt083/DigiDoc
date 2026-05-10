import { create } from 'zustand';
import api from '../api/axios';
import { toast } from '../utils/toast';

export const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/cart');
      set({ items: res.data });
    } catch (error) {
      // Không toast ở đây vì fetchCart được gọi tự động nhiều lần
      console.error('Failed to fetch cart', error);
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (documentId, quantity = 1) => {
    try {
      await api.post('/cart/add', { documentId, quantity });
      await get().fetchCart();
      toast.success('Đã thêm vào giỏ hàng! 🛒');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Không thể thêm vào giỏ hàng';
      toast.error(msg);
      return { success: false, error: msg };
    }
  },

  removeFromCart: async (id) => {
    try {
      await api.delete(`/cart/remove/${id}`);
      await get().fetchCart();
      toast.success('Đã xoá khỏi giỏ hàng');
    } catch (error) {
      toast.error('Không thể xoá sản phẩm');
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      await api.put(`/cart/update/${id}?quantity=${quantity}`);
      await get().fetchCart();
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set({ items: [] });
    } catch (error) {
      toast.error('Không thể xoá giỏ hàng');
    }
  },
}));
