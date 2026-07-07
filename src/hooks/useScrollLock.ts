import { useLayoutEffect } from "react";

let lockCount = 0;
let originalOverflow = "";

export function useScrollLock() {
  useLayoutEffect(() => {
    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
      }
    };
  }, []);
}
