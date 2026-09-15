type IconName = "arrow" | "cart" | "check" | "clock" | "leaf" | "menu" | "phone" | "pin" | "shield" | "x";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    cart: <><path d="M3.5 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6.3" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    leaf: <><path d="M20 4C10 4 5 8 5 14c0 3.3 2.7 6 6 6 6 0 9-6 9-16Z" /><path d="M4 21c3-4 6.5-7.5 11-10" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    phone: <path d="M6.5 4.5 9 4l2 4.5-2 1.5c1 2 2.5 3.5 4.5 4.5l1.5-2 4.5 2 .5 2.5c-1 2-3 2.5-5 2C9 17.5 6.5 14 5 9.5c-.7-2.2-.5-4 .5-5Z" />,
    pin: <><path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}