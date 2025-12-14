<template>
  <div class="landing-page">
    <canvas ref="canvasRef" id="landing-canvas"></canvas>

    <div class="content-wrapper">
      <header class="landing-header">
        <div class="logo">🦄 SmartList</div>
        <div class="nav-buttons">
          <button class="btn btn-ghost" @click="scrollToDemo">Demo</button>
          <button class="btn btn-primary" @click="showSignup = true">Get Started</button>
        </div>
      </header>

      <section class="hero">
        <h1>Shopping, <br> <span class="gradient-text">Reimagined.</span></h1>
        <p>
          Collaborative lists, AI-powered categories, and real-time finance tracking.
          Stop overspending. Start SmartListing.
        </p>
        <div class="hero-buttons">
          <button class="btn btn-primary btn-large" @click="showSignup = true">
            Start Free Now 🚀
          </button>
        </div>
      </section>

      <section class="features" id="demo">
        <h2>Why SmartList?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="icon">🧠</div>
            <h3>AI Sorting</h3>
            <p>Just type "Milk". We automatically tag it as Dairy and find emojis.</p>
          </div>
          <div class="feature-card">
            <div class="icon">⚡</div>
            <h3>Real-time Sync</h3>
            <p>Your partner crosses an item off? It disappears on your screen instantly.</p>
          </div>
          <div class="feature-card">
            <div class="icon">💰</div>
            <h3>Price Compare</h3>
            <p>See totals for Metro vs Linella automatically. Save money on every trip.</p>
          </div>
        </div>
      </section>
    </div>

    <Transition name="modal">
      <div class="modal-backdrop" v-if="showSignup" @click.self="showSignup = false">
        <div class="modal-content">
          <button class="modal-close" @click="showSignup = false">×</button>
          <h2>Join the Club 👋</h2>
          <p>Enter your name to start your first list.</p>

          <form @submit.prevent="handleRegister">
            <input
              v-model="username"
              type="text"
              placeholder="Your Name (e.g. Alex)"
              class="landing-input"
              required
              autofocus
            />
            <button type="submit" class="btn btn-primary btn-block">
              Let's Go!
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useGalaxyBackground } from '@/composables/useGalaxyBackground'

const router = useRouter()
const userStore = useUserStore()

const showSignup = ref(false)
const username = ref('')

// Подключаем твой красивый фон, но с другими настройками для Лэндинга
const { canvasRef } = useGalaxyBackground({
  starSpeed: 0.2,
  density: 2,
  hueShift: 200, // Немного другой оттенок для главной
  mouseRepulsion: true,
  transparent: false // Непрозрачный фон, чтобы перекрыть body
})

const handleRegister = () => {
  if (!username.value.trim()) return

  // Сохраняем пользователя
  userStore.setUser(username.value, '👽') // Дефолтный аватар пока инопланетянин

  // Редирект в приложение
  router.push('/dashboard')
}

const scrollToDemo = () => {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* Стили специфичные для Лэндинга */
.landing-page {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  color: #fff;
  overflow-y: auto; /* Скролл для страницы */
  z-index: 1000; /* Поверх всего */
}

#landing-canvas {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
  background: #060010;
}

.content-wrapper {
  position: relative; z-index: 1;
  max-width: 1200px; margin: 0 auto;
}

/* Header */
.landing-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5rem 2rem;
}
.logo { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #ff3366, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-buttons { display: flex; gap: 1rem; }

/* Hero */
.hero {
  text-align: center; padding: 6rem 1rem;
  display: flex; flex-direction: column; align-items: center;
}
.hero h1 { font-size: 4rem; line-height: 1.1; margin-bottom: 1.5rem; font-weight: 800; }
.hero p { font-size: 1.2rem; color: #c0a0d0; max-width: 600px; margin-bottom: 2.5rem; line-height: 1.6; }
.gradient-text { background: linear-gradient(90deg, #ff3366, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.btn-large { padding: 1rem 3rem; font-size: 1.2rem; border-radius: 50px; }

/* Features */
.features { padding: 4rem 2rem; }
.features h2 { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }

.feature-card {
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem; border-radius: 20px; transition: transform 0.3s;
  backdrop-filter: blur(10px);
}
.feature-card:hover { transform: translateY(-10px); border-color: #ff3366; }
.icon { font-size: 3rem; margin-bottom: 1rem; }
.feature-card h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
.feature-card p { color: #c0a0d0; }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8);
  display: flex; justify-content: center; align-items: center; z-index: 2000;
  backdrop-filter: blur(5px);
}
.modal-content {
  background: #1a0f1f; padding: 2.5rem; border-radius: 24px;
  width: 90%; max-width: 400px; text-align: center;
  border: 1px solid #5a2f6a; position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.modal-close {
  position: absolute; top: 1rem; right: 1rem; background: none; border: none;
  color: #fff; font-size: 2rem; cursor: pointer;
}
.landing-input {
  width: 100%; padding: 1rem; margin: 1.5rem 0;
  background: #060010; border: 1px solid #5a2f6a; border-radius: 12px;
  color: #fff; font-size: 1.1rem; outline: none; text-align: center;
}
.landing-input:focus { border-color: #ff3366; }
.btn-block { width: 100%; padding: 1rem; font-size: 1.1rem; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .hero h1 { font-size: 2.5rem; }
}
</style>
