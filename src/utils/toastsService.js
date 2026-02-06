import toast from 'react-hot-toast';

export const showSuccessToast = (message, opts = {}) => {
  return toast.success(message, opts);
};

export const showErrorToast = (message, opts = {}) => {
  return toast.error(message || 'Something went wrong', opts);
};

export const showToast = (message, opts = {}) => {
  return toast(message, opts);
};

export const showLoadingToast = (message = 'Loading...', opts = {}) => {
  return toast.loading(message, opts);
};

export const dismissToast = (id) => {
  return toast.dismiss(id);
};

export default toast;
