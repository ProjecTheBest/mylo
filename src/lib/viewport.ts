export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** `env(safe-area-inset-*)` değerlerini px olarak okur (çentik, ev çubuğu). */
export function readSafeInsets(): Insets {
  const probe = document.createElement("div");
  probe.className =
    "pointer-events-none invisible fixed top-0 left-0 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]";
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe);
  const insets: Insets = {
    top: parseFloat(computed.paddingTop) || 0,
    right: parseFloat(computed.paddingRight) || 0,
    bottom: parseFloat(computed.paddingBottom) || 0,
    left: parseFloat(computed.paddingLeft) || 0,
  };
  probe.remove();
  return insets;
}
