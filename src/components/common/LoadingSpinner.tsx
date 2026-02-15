import clsx from "clsx";

type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  message?: string;
}

const sizeStyles: Record<SpinnerSize, { circle: string; text: string }> = {
  sm: { circle: "h-5 w-5 border-2", text: "text-sm" },
  md: { circle: "h-8 w-8 border-[3px]", text: "text-base" },
  lg: { circle: "h-12 w-12 border-4", text: "text-lg" },
};

export default function LoadingSpinner({
  size = "md",
  message,
}: LoadingSpinnerProps) {
  const styles = sizeStyles[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={clsx(
          "animate-spin rounded-full border-gray-300 border-t-blue-600",
          styles.circle
        )}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className={clsx("text-gray-600", styles.text)}>{message}</p>
      )}
    </div>
  );
}
