import { useState, useId, type InputHTMLAttributes } from "react";

interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
}

export default function FormField({
  label,
  error,
  className = "",
  ...inputProps
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2 font-primary">
      <label
        htmlFor={id}
        className={`text-body-sm font-bold transition-colors ${
          error ? "text-red-600" : focused ? "text-blue-600" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        className={`rounded-md border-2 bg-white px-4 py-3 text-body text-black outline-none transition-colors placeholder:text-gray-300 focus:shadow-sm ${
          error
            ? "border-red-600 bg-red-50 focus:border-red-600"
            : "border-blue-100 focus:border-blue-600"
        } ${className}`}
        {...inputProps}
      />
      {error && (
        <span id={errorId} role="alert" className="text-body-sm text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
