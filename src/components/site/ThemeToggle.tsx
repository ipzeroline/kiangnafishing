"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ label }: { label: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("kiangna-theme");
    const initial = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("kiangna-theme", next ? "dark" : "light");
  }

  return (
    <button type="button" onClick={toggle} className="site-theme-toggle" aria-label={label} title={label}>
      <span aria-hidden="true" className="theme-icon sun" />
      <span aria-hidden="true" className="theme-icon moon" />
    </button>
  );
}
