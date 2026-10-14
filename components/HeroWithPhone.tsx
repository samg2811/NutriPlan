import PhoneDemo from "./PhoneDemo";
import styles from "./HeroWithPhone.module.css";

export default function HeroWithPhone() {
  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <p className={styles.eyebrow}>SMARTER MEAL PLANNING</p>
        <h1 className={styles.title}>
          What should
          <br />
          <span>you eat?</span>
        </h1>
        <p className={styles.sub}>
          NutriPlan uses your ingredients, budget, and available time to help you find
          meals that fit your needs, then tracks what you eat so you always know what
          comes next.
        </p>
        <div className={styles.buttons}>
          <a href="#planner" className={styles.primary}>Find my meal →</a>
          <a href="/food-log" className={styles.secondary}>Log what I ate</a>
        </div>
      </div>

      <PhoneDemo />
    </section>
  );
}
