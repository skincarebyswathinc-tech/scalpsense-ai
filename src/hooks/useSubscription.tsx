import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Plan = "free" | "premium";

interface SubscriptionContextType {
  plan: Plan;
  isPremium: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: "free",
  isPremium: false,
  loading: true,
  refetch: async () => {},
});

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan>("free");
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setPlan("free");
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions" as any)
      .select("plan, status, expires_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (data) {
      const sub = data as any;
      const isExpired = sub.expires_at && new Date(sub.expires_at) < new Date();
      setPlan(isExpired ? "free" : (sub.plan as Plan));
    } else {
      // Auto-create free subscription for existing users
      await supabase.from("subscriptions" as any).insert({ user_id: user.id, plan: "free", status: "active" } as any);
      setPlan("free");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        isPremium: plan === "premium",
        loading,
        refetch: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
