"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Define the shape of our auth context
type AuthContextType = {
  user: User | null;
  session: Session | null;
  userScore: UserScore | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  updateScore: (newScore: number) => void;
};

// Definizione del tipo per i dati del punteggio
type UserScore = {
  id: number;
  user_id: string;
  user_nick: string;
  score: number;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userScore: null,
  isLoading: true,
  signOut: async () => {},
  isAuthenticated: false,
  updateScore: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get session data on mount
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
      }

      if (session?.user) {
        const score = await fetchUserScore(session.user.id);
        setUserScore(score);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Funzione per recuperare il record del punteggio dell'utente
  const fetchUserScore = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user score:", error);
        return null;
      }

      return data as UserScore | null;
    } catch (error) {
      console.error("Exception fetching user score:", error);
      return null;
    }
  };

  // Function to sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Funzione per aggiornare il punteggio dell'utente nel contesto
  const updateScore = (newScore: number) => {
    if (!userScore) return;
    
    // Aggiorna lo stato locale del punteggio
    setUserScore({
      ...userScore,
      score: newScore
    });
  };

  // Value to be provided to consuming components
  const value = {
    user,
    session,
    userScore,
    isLoading,
    signOut,
    isAuthenticated: !!user,
    updateScore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
