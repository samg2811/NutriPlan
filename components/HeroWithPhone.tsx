"use client";

import PhoneDemo from "./PhoneDemo";
import { scrollToLogin } from "@/lib/scrollToLogin";
import styles from "./HeroWithPhone.module.css";

export default function HeroWithPhone() {
  function go(e: React.MouseEvent) {
    e.preventDefault();
    scrollToLogin();
  }

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
          NutriGoal uses your ingredients, budget, and available time to help you find
          meals that fit your needs, then tracks what you eat so you always know what
          comes next.
        </p>
        <div className={styles.buttons}>
          <a href="#login" onClick={go} className={styles.primary}>Get started →</a>
          <a href="#login" onClick={go} className={styles.secondary}>Log in</a>
        </div>
      </div>

      <PhoneDemo onOpen={scrollToLogin} />
    </section>
  );
}
