import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

/**
 * Toast Provider component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Make showToast globally available for API services
  React.useEffect(() => {
    window.showToast = (type, message, options = {}) => {
      addToast({ type, message, ...options });
    };

    return () => {
      delete window.showToast;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast functionality
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, clearAllToasts } = context;

  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, duration: 7000, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    custom: (toast) => addToast(toast),
    remove: removeToast,
    clear: clearAllToasts,
  };

  return toast;
};

/**
 * Toast Container component
 */
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-16 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Individual Toast Item component
 */
const ToastItem = ({ toast, onRemove }) => {
  const { type, message, title, action } = toast;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'var(--torre-bg-secondary)',
      borderColor: 'var(--torre-green)',
      iconColor: 'var(--torre-green)',
      titleColor: 'var(--torre-text-primary)',
      messageColor: 'var(--torre-text-secondary)',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'var(--torre-bg-secondary)',
      borderColor: 'var(--torre-red)',
      iconColor: 'var(--torre-red)',
      titleColor: 'var(--torre-text-primary)',
      messageColor: 'var(--torre-text-secondary)',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'var(--torre-bg-secondary)',
      borderColor: 'var(--torre-accent)',
      iconColor: 'var(--torre-accent)',
      titleColor: 'var(--torre-text-primary)',
      messageColor: 'var(--torre-text-secondary)',
    },
    info: {
      icon: Info,
      bgColor: 'var(--torre-bg-secondary)',
      borderColor: 'var(--torre-accent)',
      iconColor: 'var(--torre-accent)',
      titleColor: 'var(--torre-text-primary)',
      messageColor: 'var(--torre-text-secondary)',
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative rounded-lg border p-4 shadow-lg backdrop-blur-sm"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        borderWidth: '1px'
      }}
    >
      <div className="flex">
        {/* Icon */}
        <div className="flex-shrink-0">
          <IconComponent
            className="h-5 w-5"
            style={{ color: config.iconColor }}
          />
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3
              className="text-sm font-medium mb-1"
              style={{ color: config.titleColor }}
            >
              {title}
            </h3>
          )}

          <p
            className="text-sm"
            style={{ color: config.messageColor }}
          >
            {message}
          </p>

          {/* Action */}
          {action && (
            <div className="mt-3">
              <button
                onClick={() => {
                  action.onClick();
                  onRemove();
                }}
                className="text-sm font-medium underline hover:no-underline transition-colors duration-200"
                style={{ color: config.titleColor }}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onRemove}
              className="inline-flex rounded-md p-1.5 focus:outline-none transition-colors duration-200"
              style={{
                color: config.iconColor,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--torre-bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
              onFocus={(e) => {
                e.target.style.outline = `2px solid ${config.iconColor}`;
                e.target.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
              }}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ToastProvider;
