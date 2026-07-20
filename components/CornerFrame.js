export default function CornerFrame({ children, className = '' }) {
  const corner = 'absolute w-6 h-6 border-gold';
  return (
    <div className={`relative ${className}`}>
      <span className={`${corner} top-2 left-2 border-t-2 border-l-2`} />
      <span className={`${corner} top-2 right-2 border-t-2 border-r-2`} />
      <span className={`${corner} bottom-2 left-2 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-2 right-2 border-b-2 border-r-2`} />
      {children}
    </div>
  );
}
