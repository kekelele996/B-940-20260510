import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({
  open,
  onOpenChange,
  title,
  description,
  variant = 'default',
}) => {
  const bgColor = {
    default: 'bg-white',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
  }[variant];

  const textColor = {
    default: 'text-gray-900',
    success: 'text-green-900',
    error: 'text-red-900',
  }[variant];

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      className={`toast-root ${bgColor} ${textColor}`}
    >
      {title && (
        <ToastPrimitive.Title className="font-medium mb-1">
          {title}
        </ToastPrimitive.Title>
      )}
      {description && (
        <ToastPrimitive.Description className="text-sm opacity-80">
          {description}
        </ToastPrimitive.Description>
      )}
    </ToastPrimitive.Root>
  );
};

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport: React.FC = () => (
  <ToastPrimitive.Viewport className="toast-viewport" />
);

// Toast Context
interface ToastContextType {
  toast: (props: { title?: string; description?: string; variant?: 'default' | 'success' | 'error' }) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastContextProvider');
  }
  return context;
};

interface ToastState {
  open: boolean;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

export const ToastContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastState, setToastState] = React.useState<ToastState>({ open: false });

  const toast = React.useCallback((props: { title?: string; description?: string; variant?: 'default' | 'success' | 'error' }) => {
    setToastState({ ...props, open: true });
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        <Toast
          open={toastState.open}
          onOpenChange={(open) => setToastState((prev) => ({ ...prev, open }))}
          title={toastState.title}
          description={toastState.description}
          variant={toastState.variant}
        />
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
};
