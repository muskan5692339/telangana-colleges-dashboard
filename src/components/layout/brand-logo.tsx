export function BrandLogo({ className = "h-12" }: { className?: string }) {
  return (
    <img
      src="/brand/vigyan-shaala-logo.jpg"
      alt="Vigyan Shaala, Community Science"
      className={`w-auto rounded-md bg-white object-contain ${className}`}
    />
  );
}
