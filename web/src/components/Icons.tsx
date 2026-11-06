type P = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
});

export const BagIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6 7h12l1 13H5L6 7z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
);
export const HomeIcon = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 11l8-7 8 7v9H4z" />
  </svg>
);
export const CupIcon = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
    <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
  </svg>
);
export const PinIcon = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
export const MenuIcon = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const LeafIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
    <path d="M5 19l8-8" />
  </svg>
);
export const BeanIcon = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <ellipse cx="12" cy="12" rx="6" ry="9" transform="rotate(30 12 12)" />
    <path d="M9 5c3 3 3 11 6 14" />
  </svg>
);
export const ArrowIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const CloseIcon = ({ size = 18, className }: P) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const CheckIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} strokeWidth={2.4} className={className}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const PlusIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const MinusIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M5 12h14" />
  </svg>
);
export const StarIcon = ({ size = 18, className, fill = "currentColor" }: P & { fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true" className={className}>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
);
