import { useState, useEffect } from "react";

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        setKeyboardHeight(windowHeight - viewportHeight);
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  return keyboardHeight;
}
