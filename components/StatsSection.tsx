import styles from "./StatsSection.module.css";

const STATS = [
  {
    big: "~40%",
    text: "of US adults have obesity, which raises the risk of heart disease, stroke and type 2 diabetes.",
    source: "CDC, data from Aug 2021 to Aug 2023",
  },
  {
    big: "22 states",
    text: "had adult obesity rates of 35% or higher in 2022. A decade earlier, no state did.",
    source: "CDC, 2022 data",
  },
  {
    big: "~20% lower",
    text: "odds of obesity among people who plan their meals ahead, in a study of 40,554 adults.",
    source: "Ducrot et al., 2017 (an association, not proof of cause)",
    href: "https://pubmed.ncbi.nlm.nih.gov/28153017/",
  },
  {
    big: "30–40%",
    text: "of the US food supply is wasted, which costs families money and fills landfills.",
    source: "USDA",
    href: "https://www.usda.gov/foodwaste/faqs",
  },
];

const HELPS = [
  {
    icon: "🥘",
    title: "Plan around what you have",
    text: "Tell us your ingredients, budget and time. We find meals that fit, so less food goes to waste.",
  },
  {
    icon: "📸",
    title: "Know what is in your food",
    text: "Snap a photo or type your meal and get calories and macros in seconds.",
  },
  {
    icon: "➡️",
    title: "Always know what is next",
    text: "Your daily log shows what you have left, and NutriGoal suggests the next meal to fit it.",
  },
];

export default function StatsSection() {
  return (
    <section className={styles.section} id="why">
      <p className={styles.eyebrow}>WHY IT MATTERS</p>
      <h2 className={styles.title}>Eating well is harder than it should be.</h2>
      <p className={styles.lead}>
        Most of us do not lack good intentions. We lack a plan. Deciding what to eat
        every day, with a tight budget and little time, is where healthy habits fall apart.
      </p>

      <div className={styles.grid}>
        {STATS.map((s) => (
          <div className={styles.card} key={s.big}>
            <div className={styles.big}>{s.big}</div>
            <p className={styles.text}>{s.text}</p>
            <p className={styles.source}>
              {s.href ? (
                <a href={s.href} target="_blank" rel="noopener noreferrer">{s.source}</a>
              ) : (
                s.source
              )}
            </p>
          </div>
        ))}
      </div>

      <div className={styles.help}>
        <h3 className={styles.helpTitle}>NutriGoal is here to help</h3>
        <div className={styles.helpGrid}>
          {HELPS.map((h) => (
            <div key={h.title} className={styles.helpItem}>
              <span className={styles.icon} aria-hidden>{h.icon}</span>
              <strong>{h.title}</strong>
              <p>{h.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
