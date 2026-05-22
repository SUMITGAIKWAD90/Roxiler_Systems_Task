export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner" aria-hidden />
      <p>{label}</p>
    </div>
  );
}
