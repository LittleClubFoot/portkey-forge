import { AlertCircle, X } from "lucide-react";
import clsx from "clsx";

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({
  message,
  onDismiss,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={clsx(
        "flex items-start gap-3 rounded-md bg-red-50 border border-red-200 p-4",
        className
      )}
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-700">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-800 transition-colors"
          >
            Try again
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-md p-1 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
