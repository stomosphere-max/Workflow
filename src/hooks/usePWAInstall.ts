import { useState, useEffect, useCallback } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isSafari, setIsSafari] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [installSuccessToast, setInstallSuccessToast] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker using virtual:pwa-register
    if ('serviceWorker' in navigator) {
      registerSW({
        immediate: true,
        onRegisteredSW(swUrl, r) {
          if (r) {
            // Check for updates every hour
            setInterval(async () => {
              if (!r.installing && navigator.onLine) {
                await r.update();
              }
            }, 60 * 60 * 1000);
          }
        },
        onRegisterError(error) {
          console.warn('SW registration error:', error);
        },
      });
    }

    // 2. Check if already installed / running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (isStandaloneMode) {
        setIsInstalled(true);
      }
    };
    checkStandalone();

    // 3. Detect iOS and Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafariBrowser =
      /safari/.test(userAgent) && !/chrome|crios|fxios|android/.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsSafari(isSafariBrowser);

    // 4. Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 5. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowConfirmModal(false);
      setShowIOSModal(false);
      setInstallSuccessToast(true);
      setTimeout(() => {
        setInstallSuccessToast(false);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    // If iOS, open the step-by-step guidance modal
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    // If deferredPrompt is available (Android / Desktop Chrome / Edge)
    if (deferredPrompt) {
      setShowConfirmModal(true);
    } else {
      // Fallback for browsers without direct prompt or if already checked
      setShowConfirmModal(true);
    }
  }, [deferredPrompt, isIOS]);

  const confirmInstall = useCallback(async () => {
    if (!deferredPrompt) {
      setShowConfirmModal(false);
      return;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallSuccessToast(true);
        setTimeout(() => setInstallSuccessToast(false), 5000);
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    } finally {
      setDeferredPrompt(null);
      setShowConfirmModal(false);
    }
  }, [deferredPrompt]);

  return {
    isInstalled,
    isInstallable: !isInstalled && (!!deferredPrompt || isIOS),
    hasPrompt: !!deferredPrompt,
    isIOS,
    isSafari,
    showIOSModal,
    setShowIOSModal,
    showConfirmModal,
    setShowConfirmModal,
    installSuccessToast,
    setInstallSuccessToast,
    triggerInstall,
    confirmInstall,
  };
}
