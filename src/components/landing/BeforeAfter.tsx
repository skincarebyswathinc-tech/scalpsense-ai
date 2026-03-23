import { motion } from "framer-motion";
import beforeAfterImg from "@/assets/before-after.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const transformations = [
  { name: "Sarah M.", weeks: 6, improvement: "Visibly thicker hairline", score: "+32%" },
  { name: "Rahul P.", weeks: 4, improvement: "Reduced shedding by 60%", score: "+28%" },
  { name: "Emily T.", weeks: 5, improvement: "Eliminated scalp flaking", score: "+41%" },
];

const BeforeAfter = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real Transformations, Real Results
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-lg mx-auto">
            See how our users recovered their scalp health in just weeks.
          </p>
        </motion.div>

        {/* Main before-after image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-elevated">
            <img
              src={beforeAfterImg}
              alt="Before and after scalp health transformation showing visibly thicker hair"
              className="w-full"
              loading="lazy"
              width={1024}
              height={576}
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-6">
              <p className="text-primary-foreground font-display text-lg font-bold">6-Week Recovery Protocol</p>
              <p className="text-primary-foreground/80 font-body text-sm">Visible improvement with consistent daily habits</p>
            </div>
          </div>
        </motion.div>

        {/* Transformation cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {transformations.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card text-center space-y-2"
            >
              <p className="text-2xl font-display font-bold text-primary">{t.score}</p>
              <p className="font-body text-sm font-medium text-foreground">{t.improvement}</p>
              <p className="text-xs text-muted-foreground font-body">{t.name} • {t.weeks} weeks</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero" size="xl" asChild>
            <Link to="/quiz">Start Free Scalp Test →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
