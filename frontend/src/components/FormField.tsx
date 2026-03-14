interface FormFieldProps {
  label: string
  id: string
  type?: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  autoComplete?: string
}

export function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  required,
  autoComplete,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`rounded-lg border px-3 py-2 text-sm outline-none transition
          focus:ring-2 focus:ring-indigo-400
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
