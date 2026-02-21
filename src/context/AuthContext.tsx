import React, { createContext, useState, useContext, ReactNode } from "react";

type User = {
  uid: string;
  name: "Rubayet" | "Raisa";
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (name: "Rubayet" | "Raisa") => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (name: "Rubayet" | "Raisa") => {
    // In a real app, this would use Firebase Auth.
    // We mock it for the demo since we lack real config credentials.
    setUser({
      uid: name === "Rubayet" ? "user_rubayet" : "user_raisa",
      name: name,
      email: `${name.toLowerCase()}@us.com`,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
