export default function Alert({ type = 'info', children }) {
  if (!children) return null;
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-teal-50 text-teal-700 border-teal-200',
    info: 'bg-sandDeep text-ink border-sandDeep',
  };
  return (
    <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}
