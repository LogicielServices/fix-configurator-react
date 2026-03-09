import toast from 'react-hot-toast';

export const showSuccessToast = (message, opts = {}) => {
  return toast.success(message, {position: 'top-center', ...opts});
};

export const showErrorToast = (message, opts = {}) => {
  return toast.error(message || 'Something went wrong', {position: 'top-center', ...opts});
};

export const showToast = (message, opts = {}) => {
  return toast(message, {position: 'top-center', ...opts});
};

export const showLoadingToast = (message = 'Loading...', opts = {}) => {
  return toast.loading(message, {position: 'top-center', ...opts});
};

export const dismissToast = (id) => {
  return toast.dismiss(id);
};

export default toast;
