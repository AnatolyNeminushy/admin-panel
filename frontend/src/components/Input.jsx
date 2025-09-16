// src/components/Input.jsx

/**
 * Текстовое поле с «плавающей» меткой (tailwind peer-хак).
 * Важно: placeholder должен быть непустым (пробел), чтобы сработали peer-классы.
 */
export default function Input({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder = " ",
  autoComplete,
  required = false,
  ariaInvalid, 
}) {
  const inputId = name || `input-${label?.toString().toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="relative w-full">
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder} 
        autoComplete={autoComplete}
        required={required}
        aria-invalid={ariaInvalid}
        className="peer w-full border border-gray-300 rounded-md px-3 pt-5 pb-2 text-sm focus:border-[#17E1B1] focus:ring-0 focus:outline-none bg-white"
      />
      <label
        htmlFor={inputId}
        className="
          absolute left-3 top-0.5 text-gray-300 text-sm transition-all
          peer-placeholder-shown:top-3.5
          peer-placeholder-shown:text-gray-400
          peer-placeholder-shown:text-base
          peer-focus:top-0.5
          peer-focus:text-sm
          peer-focus:text-gray-300
        "
      >
        {label}
      </label>
    </div>
  );
}
