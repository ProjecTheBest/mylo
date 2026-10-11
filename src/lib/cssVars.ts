/** Inline `style` yazmadan elemana CSS custom property atar. */
export function setCssVars(el: HTMLElement | null, vars: Readonly<Record<string, string>>): void {
  if (!el) return;
  for (const [name, value] of Object.entries(vars)) {
    el.style.setProperty(name, value);
  }
}
