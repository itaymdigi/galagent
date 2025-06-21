import { useEffect } from 'react';

/**
 * Custom hook to handle browser extension interference
 * This helps prevent hydration mismatches caused by extensions
 * that modify the DOM (like Bitdefender, ad blockers, etc.)
 */
export function useBrowserExtensionFix() {
  useEffect(() => {
    // Give browser extensions time to modify the DOM before React hydrates
    const handleExtensionInterference = () => {
      // Remove common extension attributes that cause hydration mismatches
      const removeExtensionAttributes = () => {
        const elementsWithBisSkin = document.querySelectorAll('[bis_skin_checked]');
        elementsWithBisSkin.forEach(element => {
          element.removeAttribute('bis_skin_checked');
        });

        // Remove other common extension attributes
        const commonExtensionAttributes = [
          'data-extension-id',
          'data-adblock-key',
          'data-security-check',
          'bis_skin_checked'
        ];

        commonExtensionAttributes.forEach(attr => {
          const elements = document.querySelectorAll(`[${attr}]`);
          elements.forEach(element => {
            element.removeAttribute(attr);
          });
        });
      };

      // Run cleanup after a short delay to let extensions finish their work
      setTimeout(removeExtensionAttributes, 100);
      
      // Also run periodically to handle dynamic content
      const interval = setInterval(removeExtensionAttributes, 5000);
      
      return () => clearInterval(interval);
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      const cleanup = handleExtensionInterference();
      return cleanup;
    }
  }, []);
} 