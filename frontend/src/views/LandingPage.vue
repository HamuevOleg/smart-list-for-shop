<template>
  <div class="landing-page">
    <canvas ref="canvasRef" id="landing-canvas"></canvas>

    <!-- Floating Elements -->
    <div class="floating-elements">
      <div class="float-item" style="top: 10%; left: 10%;">🛒</div>
      <div class="float-item" style="top: 20%; right: 15%;">💰</div>
      <div class="float-item" style="bottom: 15%; left: 20%;">✨</div>
      <div class="float-item" style="bottom: 25%; right: 10%;">📊</div>
    </div>

    <div class="content-wrapper">
      <!-- Header with glassmorphism -->
      <header class="landing-header">
        <div class="logo">
          <span class="logo-icon">🦄</span>
          <span class="logo-text">SmartList</span>
        </div>
        <nav class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#demo" class="nav-link">Demo</a>
          <a href="#pricing" class="nav-link">Pricing</a>
        </nav>
        <div class="nav-buttons">
          <button class="btn btn-ghost" @click="showSignup = true">Sign In</button>
          <button class="btn btn-primary glow-btn" @click="showSignup = true">
            <span class="btn-shine"></span>
            Get Started
          </button>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          New: AI-Powered Shopping Assistant
        </div>

        <h1 class="hero-title">
          Shopping Lists,
          <br>
          <span class="gradient-text">Reimagined</span>
          <span class="cursor-blink">_</span>
        </h1>

        <p class="hero-subtitle">
          Collaborative lists with AI categories, real-time sync, and smart price tracking.
          <br>
          <strong>Stop overspending. Start SmartListing.</strong>
        </p>

        <div class="hero-buttons">
          <button class="btn btn-primary btn-xl glow-btn" @click="showSignup = true">
            <span class="btn-shine"></span>
            <span>Start Free Now</span>
            <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button class="btn btn-ghost btn-xl" @click="scrollToDemo">
            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Watch Demo
          </button>
        </div>

        <!-- Stats -->
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">10K+</div>
            <div class="stat-label">Active Users</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">$2M+</div>
            <div class="stat-label">Money Saved</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">4.9★</div>
            <div class="stat-label">App Rating</div>
          </div>
        </div>
      </section>

      <!-- Interactive Demo Section -->
      <section class="demo-section" id="demo">
        <div class="section-header">
          <span class="section-badge">✨ See it in action</span>
          <h2>Type. AI Sorts. You Save.</h2>
          <p>Watch how SmartList transforms your shopping experience</p>
        </div>

        <div class="demo-container">
          <div class="demo-card">
            <div class="demo-input-wrapper">
              <input
                v-model="demoInput"
                type="text"
                class="demo-input"
                placeholder="Try typing 'milk' or 'avocado'..."
                @input="handleDemoInput"
              />
              <div class="input-icon">🔍</div>
            </div>

            <transition name="slide-up">
              <div v-if="demoResult" class="demo-result">
                <div class="result-header">
                  <span class="result-badge">✨ AI Detected</span>
                  <span class="result-time">0.3s</span>
                </div>
                <div class="result-content">
                  <div class="result-image">{{ demoResult.emoji }}</div>
                  <div class="result-info">
                    <h4>{{ demoResult.name }}</h4>
                    <div class="result-tags">
                      <span class="tag">{{ demoResult.category }}</span>
                      <span class="tag price-tag">{{ demoResult.price }}</span>
                    </div>
                  </div>
                </div>
                <div class="result-comparison">
                  <div class="store-price">
                    <span class="store-name">🏪 Metro</span>
                    <span class="price">{{ demoResult.price }}</span>
                  </div>
                  <div class="store-price">
                    <span class="store-name">🏬 Linella</span>
                    <span class="price better">{{ demoResult.betterPrice }}</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="features-section" id="features">
        <div class="section-header">
          <span class="section-badge">🚀 Superpowers</span>
          <h2>Everything You Need</h2>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="(feature, i) in features" :key="i">
            <div class="feature-icon-wrapper">
              <div class="feature-icon">{{ feature.icon }}</div>
              <div class="icon-glow"></div>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <!-- Social Proof -->
      <section class="social-proof">
        <div class="testimonials">
          <div class="testimonial-card" v-for="(t, i) in testimonials" :key="i">
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <p>"{{ t.text }}"</p>
            <div class="author">
              <div class="avatar">{{ t.avatar }}</div>
              <div class="author-info">
                <div class="author-name">{{ t.name }}</div>
                <div class="author-role">{{ t.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>Ready to Shop Smarter?</h2>
          <p>Join thousands who've transformed their shopping experience</p>
          <button class="btn btn-primary btn-xl glow-btn" @click="showSignup = true">
            <span class="btn-shine"></span>
            Start Your Free Trial
          </button>
          <div class="cta-note">✨ No credit card required • Free forever</div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="logo">
              <span class="logo-icon">🦄</span>
              <span class="logo-text">SmartList</span>
            </div>
            <p>Shopping, Reimagined.</p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Security</a>
            </div>
            <div class="footer-column">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div class="footer-column">
              <h4>Resources</h4>
              <a href="#">Help Center</a>
              <a href="#">API Docs</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 SmartList. Made with 💜 in Moldova</p>
        </div>
      </footer>
    </div>

    <!-- Signup Modal -->
    <Transition name="modal">
      <div class="modal-backdrop" v-if="showSignup" @click.self="showSignup = false">
        <div class="modal-content">
          <button class="modal-close" @click="showSignup = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div class="modal-header">
            <div class="modal-icon">🚀</div>
            <h2>Welcome to SmartList!</h2>
            <p>Enter your name to start your journey</p>
          </div>

          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label>Your Name</label>
              <input
                v-model="username"
                type="text"
                placeholder="Alex Smith"
                class="form-input"
                required
                autofocus
              />
            </div>
            <button type="submit" class="btn btn-primary btn-block glow-btn">
              <span class="btn-shine"></span>
              Let's Go! 🎉
            </button>
          </form>

          <div class="modal-footer">
            By signing up, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'react'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useGalaxyBackground } from '@/composables/useGalaxyBackground'

const router = useRouter()
const userStore = useUserStore()

const showSignup = ref(false)
const username = ref('')
const demoInput = ref('')
const demoResult = ref(null)

const { canvasRef } = useGalaxyBackground({
  starSpeed: 0.3,
  density: 2.5,
  hueShift: 180,
  mouseRepulsion: true,
  transparent: false,
  glowIntensity: 0.5,
  twinkleIntensity: 0.4
})

const features = [
  { icon: '🧠', title: 'AI Auto-Sort', description: 'Type "milk" and watch AI instantly categorize it as Dairy with emoji.' },
  { icon: '⚡', title: 'Real-time Sync', description: 'Changes appear instantly on all devices. No refresh needed.' },
  { icon: '💰', title: 'Smart Compare', description: 'Auto-compare Metro vs Linella prices. Save on every trip.' },
  { icon: '👥', title: 'Collaborate', description: 'Share lists with family. Everyone stays in sync.' },
  { icon: '📊', title: 'Finance Track', description: 'Beautiful charts show where your money goes.' },
  { icon: '🔒', title: 'Privacy First', description: 'Your data is encrypted and never shared.' }
]

const testimonials = [
  { avatar: '👩', name: 'Sarah M.', role: 'Busy Mom', text: 'SmartList saved me 4 hours a week and $200/month. Game changer!' },
  { avatar: '👨', name: 'Alex P.', role: 'Student', text: 'The AI sorting is mind-blowing. I just type and it handles everything.' },
  { avatar: '👵', name: 'Maria K.', role: 'Retiree', text: 'Finally I can share lists with my daughter. So easy!' }
]

const demoData = {
  milk: { name: 'Fresh Milk', category: '🥛 Dairy', price: '42 MDL', betterPrice: '38 MDL', emoji: '🥛' },
  avocado: { name: 'Avocados', category: '🥑 Fruits', price: '65 MDL', betterPrice: '59 MDL', emoji: '🥑' },
  bread: { name: 'Whole Grain Bread', category: '🍞 Bakery', price: '18 MDL', betterPrice: '15 MDL', emoji: '🍞' },
  cheese: { name: 'Cheddar Cheese', category: '🧀 Dairy', price: '89 MDL', betterPrice: '82 MDL', emoji: '🧀' }
}

let debounceTimer = null

const handleDemoInput = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const input = demoInput.value.toLowerCase().trim()
    if (!input) {
      demoResult.value = null
      return
    }

    const match = Object.keys(demoData).find(key => input.includes(key) || key.includes(input))
    if (match) {
      demoResult.value = demoData[match]
    } else {
      demoResult.value = {
        name: demoInput.value,
        category: '🛒 Other',
        price: '-- MDL',
        betterPrice: '-- MDL',
        emoji: '🔍'
      }
    }
  }, 300)
}

const handleRegister = () => {
  if (!username.value.trim()) return
  userStore.setUser(username.value, '👽')
  router.push('/dashboard')
}

const scrollToDemo = () => {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.landing-page {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  color: #fff; overflow-y: auto; overflow-x: hidden;
}

#landing-canvas {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;
}

.content-wrapper {
  position: relative; z-index: 1;
}

/* Floating Elements */
.floating-elements {
  position: fixed; inset: 0; pointer-events: none; z-index: 1;
}

.float-item {
  position: absolute; font-size: 3rem; opacity: 0.1;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-30px) rotate(5deg); }
  75% { transform: translateY(30px) rotate(-5deg); }
}

/* Header */
.landing-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5rem 3rem; backdrop-filter: blur(20px);
  background: rgba(6, 0, 16, 0.6); border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky; top: 0; z-index: 100;
}

.logo {
  display: flex; align-items: center; gap: 0.75rem; font-size: 1.5rem; font-weight: 800;
}

.logo-icon { font-size: 2rem; }

.logo-text {
  background: linear-gradient(135deg, #ff3366, #60a5fa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex; gap: 2rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.7); text-decoration: none; font-weight: 600;
  transition: color 0.3s;
}

.nav-link:hover { color: #fff; }

.nav-buttons {
  display: flex; gap: 1rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem; border-radius: 50px; border: none;
  font-weight: 700; cursor: pointer; transition: all 0.3s;
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-size: 0.95rem; position: relative; overflow: hidden;
}

.btn-ghost {
  background: transparent; color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-ghost:hover {
  border-color: #ff3366; transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #ff3366, #e91e63);
  color: #fff; box-shadow: 0 10px 30px rgba(255, 51, 102, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(255, 51, 102, 0.6);
}

.btn-xl {
  padding: 1.25rem 2.5rem; font-size: 1.1rem;
}

.glow-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.glow-btn:hover::before {
  transform: translateX(100%);
}

.btn-shine {
  position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  to { left: 200%; }
}

.btn-arrow {
  width: 20px; height: 20px; transition: transform 0.3s;
}

.btn:hover .btn-arrow {
  transform: translateX(5px);
}

.play-icon {
  width: 20px; height: 20px;
}

/* Hero */
.hero {
  text-align: center; padding: 8rem 2rem 4rem;
  display: flex; flex-direction: column; align-items: center;
}

.hero-badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1.25rem; background: rgba(255, 51, 102, 0.1);
  border: 1px solid rgba(255, 51, 102, 0.3); border-radius: 50px;
  font-size: 0.85rem; font-weight: 600; margin-bottom: 2rem;
  animation: pulse 2s infinite;
}

.badge-dot {
  width: 8px; height: 8px; background: #10b981; border-radius: 50%;
  animation: ping 2s infinite;
}

@keyframes ping {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; transform: scale(1.2); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.hero-title {
  font-size: clamp(3rem, 10vw, 6rem); line-height: 1.1;
  font-weight: 900; margin-bottom: 1.5rem;
  animation: fadeInUp 0.8s ease;
}

.gradient-text {
  background: linear-gradient(135deg, #ff3366, #60a5fa, #34d399);
  background-size: 200% 200%;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.cursor-blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.hero-subtitle {
  font-size: clamp(1.1rem, 3vw, 1.4rem); color: #c0a0d0;
  max-width: 700px; margin-bottom: 3rem; line-height: 1.8;
  animation: fadeInUp 0.8s ease 0.2s backwards;
}

.hero-buttons {
  display: flex; gap: 1.5rem; margin-bottom: 4rem;
  animation: fadeInUp 0.8s ease 0.4s backwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-stats {
  display: flex; gap: 3rem; align-items: center;
  animation: fadeInUp 0.8s ease 0.6s backwards;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem; font-weight: 900;
  background: linear-gradient(135deg, #ff3366, #60a5fa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.9rem; color: #c0a0d0; margin-top: 0.25rem;
}

.stat-divider {
  width: 1px; height: 40px; background: rgba(255, 255, 255, 0.2);
}

/* Section Headers */
.section-header {
  text-align: center; margin-bottom: 4rem;
}

.section-badge {
  display: inline-block; padding: 0.5rem 1rem;
  background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 50px; font-size: 0.9rem; font-weight: 600;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 900;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.2rem; color: #c0a0d0;
}

/* Demo Section */
.demo-section {
  padding: 6rem 2rem; max-width: 800px; margin: 0 auto;
}

.demo-container {
  perspective: 1000px;
}

.demo-card {
  background: rgba(26, 15, 31, 0.8); backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 24px;
  padding: 3rem; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s;
}

.demo-card:hover {
  transform: translateY(-10px);
}

.demo-input-wrapper {
  position: relative; margin-bottom: 2rem;
}

.demo-input {
  width: 100%; padding: 1.5rem 4rem 1.5rem 1.5rem;
  background: rgba(6, 0, 16, 0.8); border: 2px solid rgba(255, 51, 102, 0.3);
  border-radius: 16px; color: #fff; font-size: 1.2rem;
  transition: all 0.3s;
}

.demo-input:focus {
  outline: none; border-color: #ff3366;
  box-shadow: 0 0 0 4px rgba(255, 51, 102, 0.2);
}

.input-icon {
  position: absolute; right: 1.5rem; top: 50%;
  transform: translateY(-50%); font-size: 1.5rem;
}

.demo-result {
  background: linear-gradient(135deg, rgba(255, 51, 102, 0.1), rgba(96, 165, 250, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;
  padding: 2rem;
}

.result-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.5rem;
}

.result-badge {
  background: rgba(52, 211, 153, 0.2); color: #34d399;
  padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;
  font-weight: 700;
}

.result-time {
  color: #c0a0d0; font-size: 0.9rem;
}

.result-content {
  display: flex; gap: 1.5rem; align-items: center; margin-bottom: 1.5rem;
}

.result-image {
  width: 80px; height: 80px; background: rgba(255, 255, 255, 0.05);
  border-radius: 16px; display: flex; align-items: center;
  justify-content: center; font-size: 3rem;
}

.result-info h4 {
  font-size: 1.5rem; margin-bottom: 0.5rem;
}

.result-tags {
  display: flex; gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem; background: rgba(255, 255, 255, 0.1);
  border-radius: 20px; font-size: 0.85rem;
}

.price-tag {
  background: rgba(255, 51, 102, 0.2); color: #ff3366;
}

.result-comparison {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
}

.store-price {
  background: rgba(6, 0, 16, 0.6); padding: 1rem;
  border-radius: 12px; display: flex; justify-content: space-between;
  align-items: center;
}

.price.better {
  color: #34d399; font-weight: 800;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from {
  opacity: 0; transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0; transform: translateY(-20px);
}

/* Features */
.features-section {
  padding: 6rem 2rem; max-width: 1200px; margin: 0 auto;
}

.features-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(26, 15, 31, 0.6); backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 24px;
  padding: 2.5rem; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer; position: relative; overflow: hidden;
}

.feature-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255, 51, 102, 0.1), transparent);
  opacity: 0; transition: opacity 0.3s;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  transform: translateY(-10px);
  border-color: rgba(255, 51, 102, 0.5);
  box-shadow: 0 20px 60px rgba(255, 51, 102, 0.3);
}

.feature-icon-wrapper {
  position: relative; width: 80px; height: 80px;
  margin-bottom: 1.5rem;
}

.feature-icon {
  width: 100%; height: 100%; background: rgba(255, 51, 102, 0.1);
  border-radius: 20px; display: flex; align-items: center;
  justify-content: center; font-size: 2.5rem;
  position: relative; z-index: 1;
}

.icon-glow {
  position: absolute; inset: -10px; background: radial-gradient(circle, rgba(255, 51, 102, 0.3), transparent);
  border-radius: 50%; filter: blur(20px); opacity: 0;
  transition: opacity 0.3s;
}

.feature-card:hover .icon-glow {
  opacity: 1;
}

.feature-card h3 {
  font-size: 1.5rem; margin-bottom: 0.75rem;
}

.feature-card p {
  color: #c0a0d0; line-height: 1.6;
}

/* Social Proof */
.social-proof {
  padding: 6rem 2rem; max-width: 1200px; margin: 0 auto;
}

.testimonials {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: rgba(26, 15, 31, 0.8); backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 24px;
  padding: 2rem; transition: all 0.3s;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 51, 102, 0.3);
}

.stars {
  font-size: 1.2rem; margin-bottom: 1rem;
}

.testimonial-card p {
  font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem;
  color: #fff;
}

.author {
  display: flex; gap: 1rem; align-items: center;
}

.avatar {
  width: 50px; height: 50px; background: linear-gradient(135deg, #ff3366, #60a5fa);
  border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 1.5rem;
}

.author-name {
  font-weight: 700;
}

.author-role {
  font-size: 0.9rem; color: #c0a0d0;
}

/* CTA Section */
.cta-section {
  padding: 8rem 2rem; text-align: center;
  background: linear-gradient(180deg, transparent, rgba(255, 51, 102, 0.05));
}

.cta-content h2 {
  font-size: clamp(2.5rem, 6vw, 4rem); margin-bottom: 1rem;
  font-weight: 900;
}

.cta-content p {
  font-size: 1.3rem; color: #c0a0d0; margin-bottom: 2.5rem;
}

.cta-note {
  margin-top: 1.5rem; color: #c0a0d0; font-size: 0.95rem;
}

/* Footer */
.landing-footer {
  padding: 4rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem; margin-bottom: 3rem;
}

.footer-brand p {
  margin-top: 1rem; color: #c0a0d0;
}

.footer-column h4 {
  margin-bottom: 1rem; font-size: 1.1rem;
}

.footer-column a {
  display: block; color: #c0a0d0; text-decoration: none;
  margin-bottom: 0.75rem; transition: color 0.3s;
}

.footer-column a:hover {
  color: #ff3366;
}

.footer-bottom {
  text-align: center; padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #c0a0d0;
}

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px); display: flex; justify-content: center;
  align-items: center; z-index: 2000;
}

.modal-content {
  background: rgba(26, 15, 31, 0.95); backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 51, 102, 0.3); border-radius: 32px;
  padding: 3rem; width: 90%; max-width: 450px;
  position: relative; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8);
}

.modal-close {
  position: absolute; top: 1.5rem; right: 1.5rem;
  background: rgba(255, 255, 255, 0.1); border: none;
  width: 40px; height: 40px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; transition: all 0.3s;
}

.modal-close svg {
  width: 20px; height: 20px; color: #fff;
}

.modal-close:hover {
  background: rgba(255, 51, 102, 0.3);
  transform: rotate(90deg);
}

.modal-header {
  text-align: center; margin-bottom: 2rem;
}

.modal-icon {
  font-size: 3rem; margin-bottom: 1rem;
}

.modal-header h2 {
  font-size: 2rem; margin-bottom: 0.5rem;
}

.modal-header p {
  color: #c0a0d0;
}

.form-group {
  margin-bottom: 1.5rem; text-align: left;
}

.form-group label {
  display: block; margin-bottom: 0.5rem;
  font-weight: 600; color: #c0a0d0;
}

.form-input {
  width: 100%; padding: 1rem 1.5rem;
  background: rgba(6, 0, 16, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; color: #fff; font-size: 1.1rem;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none; border-color: #ff3366;
  box-shadow: 0 0 0 4px rgba(255, 51, 102, 0.2);
}

.btn-block {
  width: 100%; padding: 1.25rem; font-size: 1.1rem;
}

.modal-footer {
  margin-top: 2rem; text-align: center;
  font-size: 0.85rem; color: #c0a0d0;
}

.modal-footer a {
  color: #ff3366; text-decoration: none;
}

.modal-footer a:hover {
  text-decoration: underline;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content {
  animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.8) translateY(50px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .landing-header {
    padding: 1rem 1.5rem;
  }

  .nav-links {
    display: none;
  }

  .hero {
    padding: 4rem 1.5rem 3rem;
  }

  .hero-buttons {
    flex-direction: column; width: 100%;
  }

  .hero-stats {
    flex-wrap: wrap; gap: 2rem;
  }

  .stat-divider {
    display: none;
  }

  .features-grid, .testimonials {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: 1fr;
  }

  .demo-card {
    padding: 2rem;
  }

  .result-content {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .modal-content {
    padding: 2rem;
  }
}
