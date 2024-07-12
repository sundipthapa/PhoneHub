import { toast } from 'react-toastify';

export const logout = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("cart");
  localStorage.removeItem("wishList");
  toast.success("Logout successfully");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
};
