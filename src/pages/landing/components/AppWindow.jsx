import { forwardRef } from "react";

// A premium macOS-style application window that frames a real product
// screenshot. Used by the Hero and the scrollytelling showcase so every
// screenshot reads as "the actual product", not a floating image.
const AppWindow = forwardRef(function AppWindow(
  { src, alt, label = "app.vousfin.com", className = "", imgClassName = "", children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={`vf-glass-pro relative overflow-hidden rounded-2xl border border-[#C8A96E]/15 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] ${className}`}
      {...rest}
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-[#C8A96E]/10 bg-[#161310]/80 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#E0736B]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#D4B87A]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#7EB5A6]" />
        <span className="ml-3 truncate font-mono text-[0.65rem] tracking-wide text-[#6B6259]">
          {label}
        </span>
      </div>
      {/* stage */}
      <div className="relative bg-[#0d0b09]">
        {src && (
          <img
            src={src}
            alt={alt}
            className={`block w-full ${imgClassName}`}
            loading="lazy"
            draggable={false}
          />
        )}
        {children}
        {/* gold inner edge + soft top sheen */}
        <div className="pointer-events-none absolute inset-0 rounded-b-2xl border border-transparent shadow-[inset_0_0_60px_rgba(200,169,110,0.05)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A96E]/30 to-transparent" />
      </div>
    </div>
  );
});

export default AppWindow;
