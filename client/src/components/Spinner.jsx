export default function Spinner({ className = "" }) {
  return (
    <div className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent text-indigo-600 align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`} role="status">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0">Loading...</span>
    </div>
  );
}
