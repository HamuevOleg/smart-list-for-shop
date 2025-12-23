<script setup>
import { useRouter } from 'vue-router';
// Убедись, что импорты ведут к правильным файлам
import MagicBento from '@/components/MagicBento.vue';
import MagicCard from '@/components/MagicCard.vue';
import ScrollStack from '@/components/ScrollStack.vue';

const router = useRouter();

const goToApp = () => {
  router.push('/app'); // Твой роут
};

const apiExample = `subscription OnListUpdate {
  list(id: "123") {
    items { name checked }
  }
}`;

// Данные для Scroll Stack (шаги)
const stackCards = [
  {
    id: 1,
    title: "1. Create & AI Sort",
    text: "Dump thoughts: 'Milk, bread, soap'. Gemini AI sorts them automatically into Dairy, Bakery, and Household.",
    icon: "🧠",
    colorClass: "bg-gradient-purple"
  },
  {
    id: 2,
    title: "2. Invite the Squad",
    text: "Share link via Telegram. No account needed. Everyone lands on the same live list instantly.",
    icon: "🔗",
    colorClass: "bg-gradient-blue"
  },
  {
    id: 3,
    title: "3. Real-Time Shop",
    text: "You cross off Milk -> It vanishes on your partner's screen instantly. No conflicts.",
    icon: "⚡",
    colorClass: "bg-gradient-green"
  },
  {
    id: 4,
    title: "4. Analytics",
    text: "See how much you spend on 'Snacks' vs 'Veggies'. SmartList helps optimize your budget.",
    icon: "📊",
    colorClass: "bg-gradient-orange"
  }
];
</script>

<template>
  <div class="landing-page">

    <div class="fixed-bg">
      <div class="stars"></div>
      <div class="glow-spot spot-1"></div>
      <div class="glow-spot spot-2"></div>
    </div>

    <div class="content-wrapper">

      <nav class="top-nav">
        <div class="logo">
          <span class="unicorn-sticker">🦄</span>
          <span class="brand-name">SmartList</span>
        </div>
        <button class="nav-btn" @click="goToApp">Open App</button>
      </nav>

      <header class="hero">
        <h1 class="hero-title">
          Sync Shopping.<br />
          <span class="text-pink">Automated by AI.</span>
        </h1>
        <p class="hero-subtitle">Real-time collaboration for families. No more "You forgot the milk".</p>
      </header>

      <MagicBento glowColor="236, 72, 153">

        <MagicCard class="span-2" glowColor="59, 130, 246">
          <div class="card-padding flex-column h-full">
            <div>
              <h2 class="card-title">Experience the Future</h2>
              <p class="card-desc">Stop texting lists. Start syncing streams.</p>
              <button @click="goToApp" class="cta-btn">
                Get Started <span class="arrow">→</span>
              </button>
            </div>
            <div class="mockup-list">
              <div class="list-row checked"><span>🥛 Milk</span></div>
              <div class="list-row"><span>🍞 Bread</span></div>
              <div class="list-row active"><span>🍌 Bananas</span></div>
            </div>
          </div>
        </MagicCard>

        <MagicCard class="span-1 row-2" glowColor="16, 185, 129">
          <div class="card-padding flex-center h-full">
            <div class="icon-lg">✨</div>
            <h3 class="card-subtitle">Gemini AI</h3>
            <p class="card-desc-sm">Auto-categorization</p>
            <div class="ai-pill">
              "Avocado" <span class="green-text">➜ Veggies</span>
            </div>
          </div>
        </MagicCard>

        <MagicCard class="span-1" glowColor="249, 115, 22">
          <div class="card-padding flex-center h-full">
            <div class="icon-lg">🖼️</div>
            <h3 class="card-subtitle">Auto-Images</h3>
            <p class="card-desc-sm">Google Search API integration.</p>
          </div>
        </MagicCard>

        <MagicCard class="span-1" glowColor="168, 85, 247">
          <div class="code-wrapper">
            <div class="window-header">
              <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
            </div>
            <pre><code>{{ apiExample }}</code></pre>
            <div class="code-footer">
              <h3>GraphQL API</h3>
            </div>
          </div>
        </MagicCard>

      </MagicBento>

      <section class="stack-section">
        <h2 class="section-label">How It Works</h2>

        <ScrollStack :items="stackCards" :itemDistance="40">
          <template #card="{ item, index }">
            <div class="stack-card-content">
              <div class="stack-icon-box">{{ item.icon }}</div>
              <div class="stack-info">
                <h3>{{ item.title }}</h3>
                <p>{{ item.text }}</p>
              </div>
              <div class="stack-num">0{{ index + 1 }}</div>
            </div>
          </template>
        </ScrollStack>
      </section>

      <footer class="footer">
        © 2025 SmartList Project. Made with 🦄 & Vue 3.
      </footer>

    </div>
  </div>
</template>

<style scoped>
/* --- BASE RESET --- */
.landing-page {
  font-family: 'Inter', sans-serif;
  color: #fff;
  min-height: 100vh;
  position: relative;
  /* overflow-x: hidden; - Lenis сам справится, но можно оставить */
}

/* --- BACKGROUND --- */
.fixed-bg { position: fixed; inset: 0; background: #09090b; z-index: -1; }
.stars { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.3; }
.glow-spot { position: absolute; width: 600px; height: 600px; border-radius: 50%; filter: blur(120px); opacity: 0.2; pointer-events: none; }
.spot-1 { top: -10%; left: 20%; background: #db2777; animation: float 10s infinite ease-in-out; }
.spot-2 { bottom: -10%; right: 10%; background: #7c3aed; animation: float 12s infinite ease-in-out reverse; }
@keyframes float { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px, 20px)} }

/* --- NAV --- */
.content-wrapper { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
.top-nav { display: flex; justify-content: space-between; align-items: center; padding: 2rem 0; margin-bottom: 4rem; }
.logo { display: flex; align-items: center; gap: 10px; font-size: 1.5rem; font-weight: 700; }
.brand-name { color: #f472b6; }
.nav-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 20px; border-radius: 20px; cursor: pointer; transition: 0.2s; }
.nav-btn:hover { background: rgba(255,255,255,0.2); }

/* --- HERO --- */
.hero { text-align: center; margin-bottom: 5rem; }
.hero-title { font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 1rem; color: white; }
.text-pink { background: linear-gradient(to right, #f472b6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-subtitle { font-size: 1.2rem; color: #a1a1aa; }

/* --- BENTO HELPERS --- */
/* Классы, которые мы вешаем на MagicCard */
.span-2 { grid-column: span 2; }
.span-1 { grid-column: span 1; }
.row-2 { grid-row: span 2; }

@media (max-width: 768px) {
  .span-2, .span-1, .row-2 { grid-column: span 1; grid-row: auto; }
}

/* --- CARD CONTENT STYLES --- */
.card-padding { padding: 2rem; box-sizing: border-box; height: 100%; display: flex; flex-direction: column; }
.flex-column { flex-direction: column; justify-content: space-between; }
.flex-center { align-items: center; justify-content: center; text-align: center; }
.h-full { height: 100%; }

.card-title { font-size: 1.8rem; font-weight: 700; margin: 0 0 10px 0; color: white; }
.card-subtitle { font-size: 1.4rem; font-weight: 600; margin: 10px 0; color: white; }
.card-desc { color: #d1d5db; margin-bottom: 1.5rem; line-height: 1.5; }
.card-desc-sm { color: #9ca3af; font-size: 0.9rem; }
.icon-lg { font-size: 3rem; margin-bottom: 10px; }

/* КНОПКА */
.cta-btn {
  background: #ec4899; color: white; border: none; padding: 12px 24px; border-radius: 50px;
  font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
  width: fit-content; transition: 0.2s;
}
.cta-btn:hover { background: #db2777; transform: translateY(-2px); }

/* ЭЛЕМЕНТЫ UI В КАРТОЧКАХ */
.mockup-list { background: #18181b; padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin-top: auto; }
.list-row { padding: 8px; border-bottom: 1px solid #27272a; color: #71717a; display: flex; align-items: center; }
.list-row.active { color: white; background: rgba(236, 72, 153, 0.1); border-radius: 6px; border-bottom: none; }
.list-row.checked { text-decoration: line-through; opacity: 0.5; }

.ai-pill { background: #27272a; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; border: 1px solid #3f3f46; margin-top: auto; }
.green-text { color: #4ade80; font-weight: bold; }

.code-wrapper { padding: 1.5rem; background: #000; height: 100%; font-family: 'Fira Code', monospace; font-size: 0.8rem; color: #a78bfa; display: flex; flex-direction: column; }
.window-header { display: flex; gap: 6px; margin-bottom: 10px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.r{background:#ef4444}.y{background:#eab308}.g{background:#22c55e}
.code-footer { margin-top: auto; border-top: 1px solid #333; padding-top: 10px; }
.code-footer h3 { margin: 0; color: #d8b4fe; font-size: 0.9rem; }

/* --- SCROLL STACK STYLES --- */
.stack-section { margin: 8rem 0; padding-bottom: 4rem; }
.section-label { text-align: center; font-size: 2rem; margin-bottom: 3rem; font-weight: 700; color: #e5e7eb; }

.stack-card-content { display: flex; align-items: center; gap: 2rem; height: 100%; color: white; }
.stack-icon-box { font-size: 3rem; min-width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 20px; display: flex; justify-content: center; align-items: center; }
.stack-info h3 { font-size: 1.6rem; margin: 0 0 5px 0; }
.stack-info p { color: #d1d5db; font-size: 1.1rem; margin: 0; }
.stack-num { margin-left: auto; font-size: 5rem; font-weight: 900; opacity: 0.1; }

/* Градиенты для стека */
.bg-gradient-purple { background: linear-gradient(135deg, rgba(88, 28, 135, 0.9), rgba(9, 9, 11, 0.95)); border-top: 1px solid #a855f7; }
.bg-gradient-blue   { background: linear-gradient(135deg, rgba(30, 58, 138, 0.9), rgba(9, 9, 11, 0.95)); border-top: 1px solid #3b82f6; }
.bg-gradient-green  { background: linear-gradient(135deg, rgba(20, 83, 45, 0.9), rgba(9, 9, 11, 0.95)); border-top: 1px solid #22c55e; }
.bg-gradient-orange { background: linear-gradient(135deg, rgba(124, 45, 18, 0.9), rgba(9, 9, 11, 0.95)); border-top: 1px solid #f97316; }

@media (max-width: 600px) {
  .stack-card-content { flex-direction: column; text-align: center; justify-content: center; }
  .stack-num { display: none; }
}

.footer { text-align: center; color: #71717a; padding-bottom: 2rem; font-size: 0.9rem; }
</style>
