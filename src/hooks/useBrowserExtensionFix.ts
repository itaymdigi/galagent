import { useEffect } from 'react';

/**
 * Custom hook to handle browser extension interference
 * This helps prevent hydration mismatches and connection errors caused by extensions
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
          'bis_skin_checked',
          'data-coloris',
          'data-darkreader-inline-bgcolor',
          'data-darkreader-inline-color',
          'cz-shortcut-listen'
        ];

        commonExtensionAttributes.forEach(attr => {
          const elements = document.querySelectorAll(`[${attr}]`);
          elements.forEach(element => {
            element.removeAttribute(attr);
          });
        });

        // Remove extension-added elements that cause issues
        const extensionSelectors = [
          '[id*="extension"]',
          '[class*="extension"]',
          '[id*="chrome-extension"]',
          '[class*="chrome-extension"]'
        ];

        extensionSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
              // Only remove if it's clearly an extension element and not part of our app
              if (element.tagName === 'DIV' && element instanceof HTMLElement) {
                const computedStyle = window.getComputedStyle(element);
                if ((computedStyle.position === 'absolute' || computedStyle.position === 'fixed') &&
                    computedStyle.zIndex && parseInt(computedStyle.zIndex) > 10000) {
                  element.remove();
                }
              }
            });
          } catch (e) {
            // Ignore errors when removing extension elements
          }
        });
      };

      // Suppress extension-related console errors
      const originalError = console.error;
      console.error = (...args) => {
        const errorMessage = args.join(' ');
        
        // Filter out common extension errors
        const extensionErrorPatterns = [
          'Could not establish connection',
          'Receiving end does not exist',
          'Extension context invalidated',
          'back/forward cache',
          'message channel is closed',
          'chrome-extension://'
        ];
        
        const isExtensionError = extensionErrorPatterns.some(pattern => 
          errorMessage.includes(pattern)
        );
        
        if (!isExtensionError) {
          originalError.apply(console, args);
        }
      };

      // Run cleanup after a short delay to let extensions finish their work
      setTimeout(removeExtensionAttributes, 100);
      
      // Also run periodically to handle dynamic content
      const interval = setInterval(removeExtensionAttributes, 5000);
      
      // Clean up on unmount
      return () => {
        clearInterval(interval);
        console.error = originalError; // Restore original console.error
      };
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      const cleanup = handleExtensionInterference();
      
      // Additional: Handle runtime errors from extensions
      const handleRuntimeError = (event: ErrorEvent) => {
        const errorMessage = event.message || '';
        
        // Suppress extension-related runtime errors
        const extensionErrorPatterns = [
          'chrome-extension://',
          'Could not establish connection',
          'Extension context invalidated'
        ];
        
        const isExtensionError = extensionErrorPatterns.some(pattern => 
          errorMessage.includes(pattern)
        );
        
        if (isExtensionError) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      };

      // Handle unhandled promise rejections from extensions
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason?.toString() || '';
        
        const extensionErrorPatterns = [
          'chrome-extension://',
          'Could not establish connection',
          'Extension context invalidated',
          'back/forward cache'
        ];
        
        const isExtensionError = extensionErrorPatterns.some(pattern => 
          reason.includes(pattern)
        );
        
        if (isExtensionError) {
          event.preventDefault();
          return false;
        }
      };

      window.addEventListener('error', handleRuntimeError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      
      return () => {
        cleanup?.();
        window.removeEventListener('error', handleRuntimeError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);
} 