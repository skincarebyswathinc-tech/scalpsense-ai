import { Shield, ShieldCheck, BadgeCheck, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: BarChart3, value: "82%", label: "of users saw improvement in 6 weeks" },
  { icon: BadgeCheck, value: "50,000+", label: "scalp tests completed" },
  { icon: ShieldCheck, value: "100%", label: "money-back guarantee" },
];

const SocialProofStats = () => {
  return (
    <section className="py-12 bg-accent/30 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              <div className="p-3 rounded-full bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="font-body text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofStats;
