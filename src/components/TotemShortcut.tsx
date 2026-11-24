'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Atalho de teclado para entrar no modo /totem:
 *   Ctrl + Shift + L  (Life Totem)
 *   Ctrl + Alt + T    (Alternativa segura, não conflita com reabrir aba do navegador)
 */
export function TotemShortcut() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (pathname === '/totem') return;

      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);
      if (isTyping) return;

      const key = e.key.toLowerCase();
      const isCtrlShiftL = (e.ctrlKey || e.metaKey) && e.shiftKey && key === 'l';
      const isCtrlAltT = (e.ctrlKey || e.metaKey) && e.altKey && key === 't';

      if (isCtrlShiftL || isCtrlAltT) {
        e.preventDefault();
        router.push('/totem');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pathname, router]);

  return null;
}
