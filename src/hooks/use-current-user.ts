import { useState, useEffect } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bolt_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }, []);

  return user;
}
