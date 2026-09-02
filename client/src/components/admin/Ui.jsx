// Small shared UI primitives for the admin panel — kept in one file to stay lightweight.
export function Card({ title, description, action, children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-navy-100 shadow-sm ${className}`}
    >
      {(title || description || action) && (
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h2 className="font-display text-lg font-semibold text-navy-800">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-navy-500 mt-0.5">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Field({ label, children, hint, className = "" }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-sm font-medium text-navy-700 mb-1">
          {label}
        </span>
      )}
      {children}
      {hint && <span className="block text-xs text-navy-400 mt-1">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-marigold-400 focus:border-transparent";

export function Input(props) {
  return (
    <input {...props} className={`${inputCls} ${props.className || ""}`} />
  );
}

export function Textarea(props) {
  return (
    <textarea {...props} className={`${inputCls} ${props.className || ""}`} />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className={`${inputCls} bg-white ${props.className || ""}`}
    >
      {children}
    </select>
  );
}

export function Button({ variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-marigold-400 text-navy-900 hover:bg-marigold-300",
    secondary: "bg-navy-100 text-navy-700 hover:bg-navy-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border border-navy-200 text-navy-700 hover:bg-navy-50",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}
    />
  );
}

export function IconButton({ variant = "outline", className = "", ...props }) {
  const variants = {
    outline: "border border-navy-200 text-navy-600 hover:bg-navy-50",
    danger: "border border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors ${variants[variant] || variants.outline} ${className}`}
    />
  );
}

export function Banner({ type = "info", children }) {
  const styles = {
    info: "bg-teal-50 text-teal-700 border-teal-100",
    error: "bg-red-50 text-red-700 border-red-100",
    success: "bg-green-50 text-green-700 border-green-100",
  };
  return (
    <div
      className={`rounded-lg border px-4 py-2.5 text-sm ${styles[type] || styles.info}`}
    >
      {children}
    </div>
  );
}

export function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? "bg-marigold-400" : "bg-navy-200"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function EmptyState({ text }) {
  return <p className="text-sm text-navy-400 text-center py-8">{text}</p>;
}
