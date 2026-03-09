import { motion } from "framer-motion";
import { ClipboardList, BarChart3, CalendarCheck } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Take the Quiz",
    description: "Answer a few quick questions about your scalp symptoms, lifestyle, and hair history.",
  },
  {
    icon: BarChart3,
    title: "Get Your Report",
    description: "Receive a detailed scalp health score with personalized insights and risk factors.",
  },
  {
    icon: CalendarCheck,
    title: "Follow Your Plan",
    description: "Access a 6-week recovery protocol tailored to your unique scalp condition.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-md mx-auto">
            Three simple steps to healthier hair
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-2xl p-8 shadow-card text-center space-y-4"
            >
              <div className="mx-auto w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
                <step.icon className="w-7 h-7 text-accent-foreground" />
              </div>
              <div className="text-sm font-body font-semibold text-primary tracking-wide uppercase">
                Step {i + 1}
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
