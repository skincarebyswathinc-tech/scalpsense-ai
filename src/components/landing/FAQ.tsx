import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const hardcodedFaqs = [
  { q: "How does the scalp diagnostic quiz work?", a: "Our quiz asks targeted questions about your scalp symptoms, hair care habits, lifestyle factors, and medical history. Using AI analysis, we generate a comprehensive scalp health score and personalized recommendations." },
  { q: "Is ScalpSense a replacement for seeing a dermatologist?", a: "No. ScalpSense is an educational and wellness tool designed to help you understand your scalp health. For medical conditions, we always recommend consulting a licensed dermatologist." },
  { q: "How long until I see results?", a: "Most users report noticeable improvements within 3-4 weeks of following their personalized recovery protocol. Our 6-week plan is designed for sustainable, lasting results." },
  { q: "Is my data private and secure?", a: "Absolutely. Your health data is encrypted and never shared with third parties. You can delete your account and all associated data at any time." },
  { q: "Does it cost anything?", a: "The scalp diagnostic quiz and basic report are completely free. Premium features like the full 6-week recovery protocol and dashboard tracking are available with a subscription." },
];

const FAQ = () => {
  const { data: dbFaqs } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data } = await supabase.from("faqs").select("*").eq("is_active", true).order("sort_order");
      return data as { id: string; question: string; answer: string }[] | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Use DB FAQs if available, otherwise fall back to hardcoded
  const faqs = dbFaqs && dbFaqs.length > 0
    ? dbFaqs.map(f => ({ q: f.question, a: f.answer }))
    : hardcodedFaqs;

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card rounded-2xl shadow-soft px-6 border-none"
              >
                <AccordionTrigger className="font-body text-sm font-medium text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-body text-sm leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
