import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ClipboardList,
  Database,
  GitBranch,
  LayoutDashboard,
  Lock,
  Mail,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const sections = [
  { id: "overview", label: "Website Goal", icon: Sparkles },
  { id: "demo", label: "Demo Flow", icon: GitBranch },
  { id: "features", label: "Feature Map", icon: LayoutDashboard },
  { id: "admin", label: "Admin Control", icon: Wrench },
  { id: "database", label: "Database Design", icon: Database },
  { id: "evolution", label: "Evolution", icon: RefreshCw },
  { id: "future", label: "Future Plan", icon: ShieldCheck },
];

const demoFlow = [
  { title: "Landing", path: "/", detail: "Trust, social proof, urgency, FAQs, email capture" },
  { title: "Assessment", path: "/quiz", detail: "Admin-managed questions, automatic columns, weighted answers" },
  { title: "Report", path: "/report", detail: "Dynamic scoring, message rules, recommendations" },
  { title: "Protocol", path: "/protocol", detail: "Recovery plan, habit tasks, guided next steps" },
  { title: "Dashboard", path: "/dashboard", detail: "Progress score, streak, charts, logs, encouragement" },
  { title: "Premium", path: "/upgrade", detail: "Paid conversion remains independent from admin overrides" },
];

const adminFlow = [
  "Products and recovery kits",
  "Assessment questions and scoring weights",
  "Message rules and report copy",
  "Reviews, testimonials, FAQs, leads",
  "Users and premium/free status",
  "Email campaign control",
];

const featureGroups = [
  {
    title: "User Experience",
    icon: Users,
    items: ["Landing page", "Scalp quiz", "Initial report", "Dashboard", "Progress graphs", "Habit tracking", "Photo timeline", "Profile"],
  },
  {
    title: "Personalization Engine",
    icon: Brain,
    items: ["Dynamic scoring", "Scoring weights", "Message rules", "Symptoms logic", "Recovery score", "Product recommendations"],
  },
  {
    title: "Admin Operations",
    icon: Wrench,
    items: ["Quiz editor", "Product media", "Kits", "FAQ editor", "Reviews approval", "Lead management", "User plan control"],
  },
  {
    title: "Growth Layer",
    icon: BarChart3,
    items: ["Email capture", "Referrals", "Testimonials", "Premium gating", "Campaign control", "PWA install path"],
  },
];

const databaseTables = [
  { name: "profiles", purpose: "User identity, public profile metadata, soft-delete state" },
  { name: "scalp_assessments", purpose: "Quiz answers with user/session linkage and flexible response JSON" },
  { name: "user_reports", purpose: "Generated score outputs, recommendations, and report history" },
  { name: "daily_habits", purpose: "Habit completion dates, streak source, recovery consistency" },
  { name: "products / product_kits", purpose: "Admin-managed catalog, images, targeting, recovery bundles" },
  { name: "subscriptions", purpose: "Premium status from payments plus safe admin grants" },
  { name: "user_roles", purpose: "Separate role table for secure admin access" },
  { name: "reviews / faqs / leads", purpose: "Admin-controlled content and conversion data" },
];

const milestones = [
  "Static wellness landing evolved into a guided diagnosis funnel.",
  "Assessment became admin-driven instead of hardcoded.",
  "Report engine moved to configurable scoring and message rules.",
  "Dashboard connected to live assessments, reports, habits, and logs.",
  "Admin panel expanded into the source of truth for content and operations.",
  "Security hardened with role-based admin checks and stronger password rules.",
];

const futurePlan = [
  { title: "Govern changes", detail: "Keep all business logic configurable through admin, with audit-friendly labels and validation." },
  { title: "Protect data", detail: "Continue using role-based access, row-level policies, and backend functions for privileged actions." },
  { title: "Improve intelligence", detail: "Use real outcome data to refine scoring weights, product targeting, and recovery messages." },
  { title: "Scale operations", detail: "Add campaign analytics, export tools, admin activity history, and QA dashboards." },
];

const SlideShell = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="min-h-[calc(100vh-5rem)] py-8 md:py-12">
    <div className="mb-8 max-w-4xl">
      <p className="font-body text-sm font-semibold uppercase tracking-widest text-primary">Owner discussion deck</p>
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">{title}</h2>
      <p className="mt-4 max-w-3xl font-body text-base leading-7 text-muted-foreground md:text-lg">{subtitle}</p>
    </div>
    {children}
  </section>
);

const FlowArrow = () => (
  <div className="hidden items-center justify-center text-primary lg:flex">
    <ArrowRight className="h-6 w-6" />
  </div>
);

const Presentations = () => {
  const [active, setActive] = useState("overview");
  const activeIndex = useMemo(() => sections.findIndex((section) => section.id === active), [active]);
  const ActiveIcon = sections[activeIndex]?.icon ?? Sparkles;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="font-display text-2xl font-bold text-foreground">
              ScalpSense Presentation
            </Link>
            <p className="font-body text-sm text-muted-foreground">Interactive HTML flowchart at /presentations</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  type="button"
                  variant={active === section.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActive(section.id)}
                  className="shrink-0"
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="mt-6 rounded-lg border bg-card p-4 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="flex flex-1 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActive(section.id)}
                    className={cn(
                      "flex min-h-20 w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                      active === section.id ? "border-primary bg-accent shadow-card" : "bg-background hover:bg-muted",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Step {index + 1}
                      </span>
                      <span className="block font-body text-sm font-semibold text-foreground">{section.label}</span>
                    </span>
                  </button>
                  {index < sections.length - 1 && <FlowArrow />}
                </div>
              );
            })}
          </div>
        </div>

        {active === "overview" && (
          <SlideShell
            title="Goal: turn scalp recovery into a guided, measurable product journey"
            subtitle="The website is designed for the owner to control diagnosis logic, content, products, users, and growth operations without editing code."
          >
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Discussion objective</CardTitle>
                  <CardDescription>What this demo should communicate to the owner.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {[
                    "A visitor can move from awareness to assessment, report, protocol, dashboard, and premium conversion.",
                    "The admin panel is the control layer for questions, scoring, messages, products, FAQs, reviews, and users.",
                    "The database stores the operational truth: users, assessments, reports, habits, subscriptions, and content.",
                    "Future development should add capability without hardcoding business rules into pages.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3 rounded-lg bg-muted p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="font-body text-sm leading-6 text-foreground">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3"><ActiveIcon className="h-6 w-6 text-primary" /> Owner-ready summary</CardTitle>
                  <CardDescription>The product is now closer to an operating system than a static website.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 font-body text-sm leading-7 text-muted-foreground">
                    <p>
                      ScalpSense combines education, assessment, recommendation, recovery tracking, and admin control into one guided platform.
                    </p>
                    <p>
                      The most important architectural decision is admin-as-source-of-truth: content and logic should be managed from admin screens, not buried in code.
                    </p>
                    <p>
                      This presentation can be used during the demo to explain what each page does, how data flows, and what should be prioritized next.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SlideShell>
        )}

        {active === "demo" && (
          <SlideShell
            title="Live demo flow: visitor journey connected page by page"
            subtitle="Use this as the speaking path while showing the owner how each page contributes to diagnosis, recovery, and conversion."
          >
            <div className="grid gap-4 lg:grid-cols-6">
              {demoFlow.map((step, index) => (
                <div key={step.path} className="flex flex-col gap-3">
                  <Link to={step.path} className="group flex min-h-48 flex-col rounded-lg border bg-card p-4 shadow-soft transition-all hover:border-primary hover:shadow-card">
                    <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-body font-bold">
                      {index + 1}
                    </span>
                    <span className="font-display text-xl font-semibold text-foreground">{step.title}</span>
                    <span className="mt-2 font-body text-sm leading-6 text-muted-foreground">{step.detail}</span>
                    <span className="mt-auto inline-flex items-center gap-2 pt-4 font-body text-sm font-semibold text-primary">
                      Open {step.path} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </SlideShell>
        )}

        {active === "features" && (
          <SlideShell
            title="Feature inventory: what exists across the website"
            subtitle="This view lists the user-facing, admin-facing, personalization, and growth features that should be discussed in the owner walkthrough."
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featureGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <Card key={group.title} className="shadow-card">
                    <CardHeader>
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle>{group.title}</CardTitle>
                      <CardDescription>Core capabilities in this area.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                            <Star className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </SlideShell>
        )}

        {active === "admin" && (
          <SlideShell
            title="Admin panel: the single control layer"
            subtitle="The admin panel should remain the place where the owner updates business rules, content, products, and access decisions."
          >
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Admin controls</CardTitle>
                  <CardDescription>Every item here should be editable without code changes.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {adminFlow.map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-lg border bg-background p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent font-body font-bold text-accent-foreground">
                        {index + 1}
                      </span>
                      <span className="font-body text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <div className="rounded-lg border bg-card p-6 shadow-card">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { icon: ClipboardList, title: "Assessment rules", text: "Question fields auto-generate safe column keys and feed report generation." },
                    { icon: Brain, title: "Scoring weights", text: "Weights are editable and used in calculations instead of being stale fields." },
                    { icon: Package, title: "Recovery commerce", text: "Products, kits, targeting, media, and payment links are controlled centrally." },
                    { icon: Mail, title: "Communication", text: "FAQs, email capture, leads, campaigns, and testimonials support conversion." },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-lg bg-muted p-5">
                        <Icon className="mb-4 h-7 w-7 text-primary" />
                        <h3 className="font-display text-xl font-semibold text-foreground">{item.title}</h3>
                        <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </SlideShell>
        )}

        {active === "database" && (
          <SlideShell
            title="Database architecture: where the website stores truth"
            subtitle="Lovable Cloud powers the backend. The app stores user progress, assessment logic, reports, subscriptions, content, and admin-controlled data in structured tables."
          >
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3"><Lock className="h-6 w-6 text-primary" /> Data access model</CardTitle>
                  <CardDescription>How the system should be handled safely.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 font-body text-sm leading-6 text-muted-foreground">
                  <p>Users should only see their own assessments, reports, habits, photos, and profile data.</p>
                  <p>Admin access should be decided by the separate user roles table, never by profile flags or browser storage.</p>
                  <p>Privileged operations such as listing users or changing premium status should stay behind backend functions.</p>
                </CardContent>
              </Card>
              <div className="grid gap-3 md:grid-cols-2">
                {databaseTables.map((table) => (
                  <div key={table.name} className="rounded-lg border bg-card p-4 shadow-soft">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-primary" />
                      <h3 className="font-body text-sm font-bold text-foreground">{table.name}</h3>
                    </div>
                    <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">{table.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          </SlideShell>
        )}

        {active === "evolution" && (
          <SlideShell
            title="How the project evolved"
            subtitle="The platform moved from a website with fixed content into a configurable recovery system with live data and operational admin controls."
          >
            <div className="relative rounded-lg border bg-card p-6 shadow-card">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {milestones.map((item, index) => (
                  <div key={item} className="rounded-lg bg-muted p-5">
                    <span className="font-body text-xs font-semibold uppercase tracking-widest text-primary">Milestone {index + 1}</span>
                    <p className="mt-3 font-body text-base leading-7 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </SlideShell>
        )}

        {active === "future" && (
          <SlideShell
            title="Future development handling"
            subtitle="The next phase should focus on governance, reliability, analytics, and making admin changes safer as the business grows."
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {futurePlan.map((item, index) => (
                <Card key={item.title} className="shadow-card">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-body font-bold">
                      {index + 1}
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-body text-sm leading-6 text-muted-foreground">{item.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 rounded-lg border bg-accent p-6 text-accent-foreground shadow-soft">
              <h3 className="font-display text-2xl font-semibold">Recommended owner message</h3>
              <p className="mt-3 font-body leading-7">
                The website should be treated as a configurable health-commerce platform: admin controls the rules, the database stores the truth, and every future feature should strengthen diagnosis accuracy, recovery engagement, and premium conversion without weakening security.
              </p>
            </div>
          </SlideShell>
        )}
      </div>
    </main>
  );
};

export default Presentations;
