import { motion } from "framer-motion";
import { Droplets, Shield, TrendingUp, Leaf } from "lucide-react";

const reasons = [
  { icon: Droplets, title: "Scalp is the Foundation", text: "Healthy hair starts below the surface. A balanced scalp microbiome promotes stronger follicles." },
  { icon: Shield, title: "Prevent Hair Loss Early", text: "80% of hair thinning is linked to scalp inflammation that goes undiagnosed." },
  { icon: TrendingUp, title: "Track Your Progress", text: "Data-driven insights help you see measurable improvements week over week." },
  { icon: Leaf, title: "Natural Recovery", text: "Our protocols focus on gentle, science-backed methods that work with your body." },
];

const WhyScalpHealth = () => {
  return (
    <section id="why-it-matters" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Scalp Health Matters
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
            Your scalp is living skin that needs care just like the rest of your body.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-6 rounded-2xl bg-card shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <r.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{r.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">{r.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyScalpHealth;
