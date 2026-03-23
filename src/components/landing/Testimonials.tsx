import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    location: "Mumbai, India",
    text: "After years of trying random products, ScalpSense finally helped me understand what was actually going on with my scalp. My hair is visibly thicker after 6 weeks.",
    rating: 5,
    result: "Hair thickness improved 40%",
  },
  {
    name: "James R.",
    location: "London, UK",
    text: "The diagnostic quiz was eye-opening. I didn't realize my lifestyle habits were affecting my scalp health. The recovery protocol was easy to follow and I saw results in 3 weeks.",
    rating: 5,
    result: "Shedding reduced by 65%",
  },
  {
    name: "Priya K.",
    location: "Bangalore, India",
    text: "I love how personalized everything is. The weekly check-ins kept me accountable, and I could actually see my progress on the dashboard. Worth every rupee.",
    rating: 5,
    result: "Scalp score: 62 → 89",
  },
  {
    name: "Dr. Anisha T.",
    location: "Delhi, India",
    text: "As a dermatologist, I recommend ScalpSense to my patients for tracking between visits. The data-driven approach helps us monitor progress objectively.",
    rating: 5,
    result: "Recommends to patients",
  },
  {
    name: "Mark L.",
    location: "Sydney, AU",
    text: "I was skeptical at first, but the 60-second test pinpointed exactly my issues — stress-related shedding and scalp inflammation. 4 weeks in, my barber noticed the difference.",
    rating: 5,
    result: "Hairline regrowth visible",
  },
  {
    name: "Riya S.",
    location: "Pune, India",
    text: "The habit tracker is a game changer. Simple daily tasks like scalp massage and nutrition tracking actually made a difference. My ponytail feels thicker!",
    rating: 5,
    result: "Ponytail thickness +30%",
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
          <p className="text-sm font-body font-semibold text-primary uppercase tracking-wider mb-2">Trusted by 50,000+ users</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real People, Real Results
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-md mx-auto">
            Don't just take our word for it — hear from people who transformed their scalp health.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-6 shadow-card space-y-4 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-accent opacity-50" />
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground font-body text-sm leading-relaxed">
                "{t.text}"
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{t.location}</p>
                </div>
                <span className="text-xs font-body font-medium text-primary bg-accent px-2 py-1 rounded-full">
                  {t.result}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
