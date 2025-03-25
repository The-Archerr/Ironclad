import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { type User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, age?: number) => Promise<void>;
  googleLogin: (googleId: string, name: string, email: string, profilePicUrl?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  // Check for stored user on mount
  useEffect(() => {
    console.log("Checking for stored user...");
    try {
      const storedUser = localStorage.getItem("ironclad_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("Found stored user:", parsedUser.name);
        setUser(parsedUser);
      } else {
        console.log("No stored user found");
      }
    } catch (err) {
      console.error("Error retrieving stored user:", err);
      localStorage.removeItem("ironclad_user");
    }
    setIsLoading(false);
  }, []);

  // Auto-redirect to auth page if no user
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("No user found, redirecting to auth page");
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log(`Attempting login for ${email}...`);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const userData = await response.json();
      console.log("Login successful");
      
      // Store user data
      setUser(userData);
      localStorage.setItem("ironclad_user", JSON.stringify(userData));
      
      // Navigate to dashboard
      console.log("Redirecting to dashboard");
      navigate("/");
      
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, age?: number) => {
    setIsLoading(true);
    console.log(`Attempting to register ${name} (${email})...`);
    
    try {
      const response = await apiRequest("POST", "/api/auth/register", { 
        name, 
        email, 
        password,
        age: age || null,
        bio: "",
        profilePicUrl: null,
        googleId: null
      });
      const userData = await response.json();
      console.log("Registration successful");
      
      // Store user data
      setUser(userData);
      localStorage.setItem("ironclad_user", JSON.stringify(userData));
      
      // Navigate to dashboard
      console.log("Redirecting to dashboard");
      navigate("/");
      
      return userData;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (googleId: string, name: string, email: string, profilePicUrl?: string) => {
    setIsLoading(true);
    console.log(`Attempting Google login for ${email}...`);
    
    try {
      const response = await apiRequest("POST", "/api/auth/google", { 
        googleId, 
        name, 
        email, 
        profilePicUrl: profilePicUrl || null 
      });
      const userData = await response.json();
      console.log("Google login successful");
      
      // Store user data
      setUser(userData);
      localStorage.setItem("ironclad_user", JSON.stringify(userData));
      
      // Navigate to dashboard
      console.log("Redirecting to dashboard");
      navigate("/");
      
      return userData;
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("Logging out...");
    setUser(null);
    localStorage.removeItem("ironclad_user");
    navigate("/auth");
  };

  // Using createElement with explicit React import
  return React.createElement(
    AuthContext.Provider, 
    { value: { user, isLoading, login, register, googleLogin, logout } }, 
    children
  );
}