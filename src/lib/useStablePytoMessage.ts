"use client";

import { useEffect, useState } from "react";

/**
 * Hält Pyto-Texte stabil, bis sich der Zustands-Schlüssel ändert.
 * Verhindert Flackern bei häufigen Parent-Re-Renders (z. B. Fortschrittsbalken).
 */
export function useStablePytoMessage(
  stateKey: string,
  resolveMessage: () => string,
): string {
  const [message, setMessage] = useState(resolveMessage);

  useEffect(() => {
    setMessage(resolveMessage());
    // resolveMessage absichtlich nicht in deps – nur bei stateKey neu wählen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey]);

  return message;
}
