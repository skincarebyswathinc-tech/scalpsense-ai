import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, CreditCard, TrendingUp, TrendingDown, BarChart3, ShieldCheck,
  Package, ArrowRight, Activity, Percent, UserMinus, Gift,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { motion } from "framer-motion";

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  premiumUsers: number;
  freeUsers: number;
  monthlyRevenue: number;
  conversionRate: number;
  churnRate: number;
  totalReferrals: number;
  totalProductClicks: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--destructive))",
  "hsl(var(--accent-foreground))",
];

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, activeSubscriptions: 0, premiumUsers: 0, freeUsers: 0,
    monthlyRevenue: 0, conversionRate: 0, churnRate: 0, totalReferrals: 0,
    totalProductClicks: 0,
  });
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; users: number }[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{ name: string; value: number }[]>([]);
  const [topReferrers, setTopReferrers] = useState<{ code: string; conversions: number; clicks: number }[]>([]);
  const [productClickData, setProductClickData] = useState<{ name: string; clicks: number }[]>([]);
  const [recentUsers, setRecentUsers] = useState<{ id: string; display_name: string | null; created_at: string }[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (data && data.length > 0) {
        setIsAdmin(true);
        fetchAllData();
      }
      setChecking(false);
    };
    checkAdmin();
  }, [user, authLoading]);

  const fetchAllData = async () => {
    // Fetch all data in parallel
    const [subsRes, referralsRes, clicksRes, profilesRes] = await Promise.all([
      supabase.from("subscriptions").select("*"),
      supabase.from("referrals").select("referral_code, conversions, clicks").order("conversions", { ascending: false }).limit(10),
      supabase.from("product_clicks").select("product_id, click_type, created_at"),
      supabase.from("profiles").select("id, display_name, created_at").order("created_at", { ascending: false }).limit(10),
    ]);

    const subs = subsRes.data || [];
    const referrals = referralsRes.data || [];
    const clicks = clicksRes.data || [];
    const profiles = profilesRes.data || [];

    // Compute stats
    const totalUsers = profiles.length > 0 ? profiles.length : subs.length;
    const premiumSubs = subs.filter((s: any) => s.plan === "premium" && s.status === "active");
    const freeSubs = subs.filter((s: any) => s.plan === "free" && s.status === "active");
    const expiredSubs = subs.filter((s: any) => s.status === "expired" || s.status === "cancelled");

    const monthlyRevenue = premiumSubs.length * 399; // Using discounted price
    const conversionRate = subs.length > 0 ? Math.round((premiumSubs.length / subs.length) * 100) : 0;
    const churnRate = subs.length > 0 ? Math.round((expiredSubs.length / subs.length) * 100) : 0;

    setStats({
      totalUsers,
      activeSubscriptions: premiumSubs.length,
      premiumUsers: premiumSubs.length,
      freeUsers: freeSubs.length,
      monthlyRevenue,
      conversionRate,
      churnRate,
      totalReferrals: referrals.reduce((sum: number, r: any) => sum + (r.conversions || 0), 0),
      totalProductClicks: clicks.filter((c: any) => c.click_type === "purchase_click").length,
    });

    // Plan distribution
    setPlanDistribution([
      { name: "Premium", value: premiumSubs.length || 0 },
      { name: "Free", value: freeSubs.length || 0 },
      { name: "Churned", value: expiredSubs.length || 0 },
    ].filter((d) => d.value > 0));

    // Revenue trend (group subscriptions by month)
    const monthMap: Record<string, { revenue: number; users: number }> = {};
    subs.forEach((s: any) => {
      const date = new Date(s.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { revenue: 0, users: 0 };
      monthMap[key].users++;
      if (s.plan === "premium") monthMap[key].revenue += 399;
    });
    const sortedMonths = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en", { month: "short", year: "2-digit" }),
        ...data,
      }));
    setRevenueData(sortedMonths.length > 0 ? sortedMonths : [
      { month: "Mar 26", revenue: 0, users: 0 },
    ]);

    // Top referrers
    setTopReferrers(referrals.filter((r: any) => r.conversions > 0 || r.clicks > 0).slice(0, 5).map((r: any) => ({
      code: r.referral_code,
      conversions: r.conversions || 0,
      clicks: r.clicks || 0,
    })));

    // Product click aggregation
    const productClicks: Record<string, number> = {};
    clicks.filter((c: any) => c.click_type === "purchase_click").forEach((c: any) => {
      productClicks[c.product_id] = (productClicks[c.product_id] || 0) + 1;
    });
    // Fetch product names for top clicked
    const topProductIds = Object.entries(productClicks)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([id]) => id);

    if (topProductIds.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", topProductIds);
      if (products) {
        setProductClickData(
          topProductIds.map((id) => ({
            name: products.find((p: any) => p.id === id)?.name || "Unknown",
            clicks: productClicks[id],
          }))
        );
      }
    }

    // Recent users
    setRecentUsers(profiles.slice(0, 8));
  };

  if (checking || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Checking permissions…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center gap-4">
          <ShieldCheck className="h-16 w-16 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Access Required</h1>
          <p className="text-muted-foreground font-body">You don't have permission to access this page.</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Total Users", value: stats.totalUsers, color: "text-primary" },
    { icon: CreditCard, label: "Active Subscriptions", value: stats.activeSubscriptions, color: "text-primary" },
    { icon: TrendingUp, label: "Monthly Revenue", value: `₹${stats.monthlyRevenue.toLocaleString()}`, color: "text-primary" },
    { icon: Percent, label: "Conversion Rate", value: `${stats.conversionRate}%`, color: stats.conversionRate > 10 ? "text-primary" : "text-destructive" },
    { icon: UserMinus, label: "Churn Rate", value: `${stats.churnRate}%`, color: stats.churnRate < 15 ? "text-primary" : "text-destructive" },
    { icon: Gift, label: "Referral Conversions", value: stats.totalReferrals, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">Business metrics and analytics at a glance.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin/products"><Package className="mr-2 h-4 w-4" /> Manage Products</Link>
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground font-body">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Growth */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Revenue Growth
              </CardTitle>
              <CardDescription className="font-body text-xs">Monthly revenue trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Plan Distribution
              </CardTitle>
              <CardDescription className="font-body text-xs">User breakdown by plan</CardDescription>
            </CardHeader>
            <CardContent>
              {planDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {planDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <p className="text-muted-foreground font-body text-sm">No subscription data yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Sales / Clicks */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Product Click Tracking
              </CardTitle>
              <CardDescription className="font-body text-xs">Purchase clicks by product</CardDescription>
            </CardHeader>
            <CardContent>
              {productClickData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={productClickData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <p className="text-muted-foreground font-body text-sm">No product click data yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Referrers */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" /> Top Referral Sources
              </CardTitle>
              <CardDescription className="font-body text-xs">By conversions & clicks</CardDescription>
            </CardHeader>
            <CardContent>
              {topReferrers.length > 0 ? (
                <div className="space-y-3">
                  {topReferrers.map((r, i) => (
                    <div key={r.code} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-display font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-body text-sm font-medium text-foreground font-mono">{r.code}</p>
                          <p className="text-xs text-muted-foreground font-body">{r.clicks} clicks</p>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary">{r.conversions} conversions</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <p className="text-muted-foreground font-body text-sm">No referral data yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Growth */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> User Growth
            </CardTitle>
            <CardDescription className="font-body text-xs">New signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="space-y-2">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-display text-sm font-bold text-primary">
                        {(u.display_name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{u.display_name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground font-body">{new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground font-body text-sm">No users yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
