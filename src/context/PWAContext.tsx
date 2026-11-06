import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAContextType {
  isInstalled: boolean;
  isInstallable: boolean;
  hasPrompt: boolean;
  isIOS: boolean;
  isSafari: boolean;
  showIOSModal: boolean;
  setShowIOSModal: (val: boolean) => void;
  showConfirmModal: boolean;
  setShowConfirmModal: (val: boolean) => void;
  installSuccessToast: boolean;
  setInstallSuccessToast: (val: boolean) => void;
  triggerInstall: () => void;
  confirmInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isSafari, setIsSafari] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [installSuccessToast, setInstallSuccessToast] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker with autoUpdate
    if ('serviceWorker' in navigator) {
      registerSW({
        immediate: true,
        onRegisteredSW(swUrl, r) {
          if (r) {
            setInterval(async () => {
              if (!r.installing && navigator.onLine) {
                await r.update();
              }
            }, 60 * 60 * 1000);
          }
        },
        onRegisterError(error) {
          console.warn('PWA service worker registration error:', error);
        },
      });
    }

    // 2. Check if already installed / standalone mode
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }
    };
    checkStandalone();

    // 3. Detect iOS and Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafariBrowser =
      /safari/.test(ua) && !/chrome|crios|fxios|android|edg/.test(ua);

    setIsIOS(isIOSDevice);
    setIsSafari(isSafariBrowser);

    // 4. Listen for beforeinstallprompt
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
      }, 6000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(() => {
    if (isInstalled) {
      setInstallSuccessToast(true);
      setTimeout(() => setInstallSuccessToast(false), 4000);
      return;
    }

    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      setShowConfirmModal(true);
    } else {
      // In desktop/browser where prompt is pending or not supported
      setShowConfirmModal(true);
    }
  }, [deferredPrompt, isIOS, isInstalled]);

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
        setTimeout(() => setInstallSuccessToast(false), 6000);
      }
    } catch (err) {
      console.warn('Install error:', err);
    } finally {
      setDeferredPrompt(null);
      setShowConfirmModal(false);
    }
  }, [deferredPrompt]);

  const isInstallable = !isInstalled && (!!deferredPrompt || isIOS);

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        isInstallable,
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
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
