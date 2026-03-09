import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    text: "After years of trying random products, ScalpSense finally helped me understand what was actually going on with my scalp. My hair is visibly thicker after 6 weeks.",
    rating: 5,
  },
  {
    name: "James R.",
    text: "The diagnostic quiz was eye-opening. I didn't realize my lifestyle habits were affecting my scalp health. The recovery protocol was easy to follow.",
    rating: 5,
  },
  {
    name: "Priya K.",
    text: "I love how personalized everything is. The weekly check-ins kept me accountable, and I could actually see my progress on the dashboard.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Real results from real people
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-2xl p-8 shadow-card space-y-4"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground font-body text-sm leading-relaxed italic">
                "{t.text}"
              </p>
              <p className="text-muted-foreground font-body text-sm font-semibold">
                — {t.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
