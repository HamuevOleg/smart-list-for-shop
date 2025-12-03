<template>
  <aside class="how-it-works-sidebar">
    <div class="sidebar-header">
      <div class="title-group">
        <div class="icon-badge">
          <span class="badge-icon">🚀</span>
          <div class="pulse-ring"></div>
        </div>
        <div>
          <h3>How SmartList Works</h3>
          <p class="subtitle">AI-powered shopping magic</p>
        </div>
      </div>
      <button class="btn-close" @click="store.toggleHelpSidebar" title="Close" aria-label="Close sidebar">
        <span class="close-icon">×</span>
      </button>
    </div>

    <div class="workflow-container">
      <!-- Step 1: User Input -->
      <div class="step user-action" :class="{ 'active': activeStep >= 1 }">
        <div class="step-header-row">
          <div class="step-number">1</div>
          <h4 class="step-title">Add Your Item</h4>
        </div>
        <div class="step-body">
          <div class="step-icon-wrapper">
            <div class="step-icon">✍️</div>
          </div>
          <div class="step-content">
            <p class="step-description">Type what you need to buy</p>
            <div class="mock-input">
              <span class="input-prefix">📝</span>
              <span class="typed-text">{{ currentTypedText }}</span>
              <span class="cursor">|</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Animated Connector -->
      <div class="connector">
        <div class="connector-line"></div>
        <div class="data-flow">
          <div class="data-particle" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.4}s` }"></div>
        </div>
      </div>

      <!-- Step 2: AI Processing -->
      <div class="step ai-processing" :class="{ 'active': activeStep >= 2 }">
        <div class="step-header-row">
          <div class="step-number ai">2</div>
          <h4 class="step-title">AI Analysis</h4>
        </div>
        <div class="step-body">
          <div class="step-icon-wrapper ai-wrapper">
            <div class="ai-glow-effect"></div>
            <div class="step-icon ai-brain">🧠</div>
            <div class="brain-waves">
              <div class="wave" v-for="i in 3" :key="i"></div>
            </div>
          </div>
          <div class="step-content">
            <p class="step-description">Gemini AI processes your request</p>
            <div class="processing-list">
              <div class="process-item" :class="{ 'active': activeStep >= 2 }">
                <div class="process-spinner"></div>
                <span>Analyzing text</span>
              </div>
              <div class="process-item" :class="{ 'active': activeStep >= 2 }" style="animation-delay: 0.2s">
                <div class="process-spinner"></div>
                <span>Finding category</span>
              </div>
              <div class="process-item" :class="{ 'active': activeStep >= 2 }" style="animation-delay: 0.4s">
                <div class="process-spinner"></div>
                <span>Getting images</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Animated Connector -->
      <div class="connector">
        <div class="connector-line"></div>
        <div class="data-flow">
          <div class="data-particle success" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.4}s` }"></div>
        </div>
      </div>

      <!-- Step 3: Result -->
      <div class="step final-result" :class="{ 'active': activeStep >= 3 }">
        <div class="step-header-row">
          <div class="step-number success">3</div>
          <h4 class="step-title">Smart Item Created!</h4>
        </div>
        <div class="step-body">
          <div class="step-icon-wrapper success-wrapper">
            <div class="step-icon success-icon">✨</div>
            <div class="sparkles">
              <span class="sparkle" v-for="i in 6" :key="i">✨</span>
            </div>
          </div>
          <div class="step-content">
            <p class="step-description">Ready to shop with full details</p>
            <div class="result-card">
              <div class="card-left">
                <div class="card-emoji">🥑</div>
                <div class="card-info">
                  <div class="card-name">Avocados</div>
                  <div class="card-badges">
                    <span class="category-badge">🍎 Fruits & Veg</span>
                  </div>
                </div>
              </div>
              <div class="card-right">
                <div class="card-price">42 MDL</div>
                <div class="card-check">✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="section-header">
        <span class="section-icon">✨</span>
        <h4 class="section-title">Smart Features</h4>
      </div>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <span class="feature-text">Auto-categorize</span>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💰</div>
          <span class="feature-text">Price tracking</span>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🖼️</div>
          <span class="feature-text">Visual items</span>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <span class="feature-text">Lightning fast</span>
        </div>
      </div>
    </div>

    <!-- Try It Section -->
    <div class="try-it-section">
      <button class="btn-try-now" @click="handleTryNow">
        <span class="btn-glow"></span>
        <span class="btn-icon">🎯</span>
        <span class="btn-text">Try Adding an Item</span>
        <span class="btn-arrow">→</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useListStore } from '@/stores/listStore'

const store = useListStore()

// Animation state
const activeStep = ref(0)
const currentTypedText = ref('')
const fullText = 'Avocados'
let typingInterval = null
let stepInterval = null

// Typing animation
const startTypingAnimation = () => {
  let charIndex = 0
  typingInterval = setInterval(() => {
    if (charIndex <= fullText.length) {
      currentTypedText.value = fullText.slice(0, charIndex)
      charIndex++
    } else {
      clearInterval(typingInterval)
      setTimeout(() => {
        activeStep.value = 2
      }, 300)
    }
  }, 150)
}

// Step progression
const startStepAnimation = () => {
  activeStep.value = 1
  setTimeout(() => {
    startTypingAnimation()
  }, 500)

  setTimeout(() => {
    activeStep.value = 3
  }, 4000)

  // Loop the animation
  stepInterval = setInterval(() => {
    activeStep.value = 0
    currentTypedText.value = ''
    setTimeout(() => {
      activeStep.value = 1
      startTypingAnimation()
    }, 500)
    setTimeout(() => {
      activeStep.value = 3
    }, 4000)
  }, 8000)
}

const handleTryNow = () => {
  store.showAddItemForm()
  // Scroll to the form
  setTimeout(() => {
    const form = document.querySelector('.add-item-form')
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

onMounted(() => {
  startStepAnimation()
})

onUnmounted(() => {
  if (typingInterval) clearInterval(typingInterval)
  if (stepInterval) clearInterval(stepInterval)
})
</script>

<style scoped>
.how-it-works-sidebar {
  background: linear-gradient(135deg, rgba(30, 20, 50, 0.98), rgba(50, 30, 70, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.75rem;
  color: #fff;
  height: fit-content;
  position: sticky;
  top: 20px;
  min-width: 360px;
  box-sizing: border-box;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 51, 102, 0.1);
}

/* === HEADER === */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.icon-badge {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), #60a5fa);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(255, 51, 102, 0.4);
  flex-shrink: 0;
}

.badge-icon {
  font-size: 1.5rem;
  position: relative;
  z-index: 2;
}

.pulse-ring {
  position: absolute;
  inset: -4px;
  border-radius: 14px;
  border: 2px solid var(--primary-color);
  animation: pulse-ring 2s ease-out infinite;
}

.title-group h3 {
  margin: 0 0 0.2rem 0;
  font-size: 1.3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.3;
}

.btn-close {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.btn-close:hover {
  background: rgba(255, 51, 102, 0.25);
  transform: rotate(90deg) scale(1.05);
  border-color: var(--primary-color);
  color: #fff;
}

.close-icon {
  display: block;
  line-height: 1;
}

/* === WORKFLOW === */
.workflow-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 1.5rem;
}

.step {
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0.4;
  transform: scale(0.98);
}

.step.active {
  opacity: 1;
  transform: scale(1);
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.step-header-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.step-number {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.step.active .step-number {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.step-number.ai {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(255, 51, 102, 0.2));
  border-color: rgba(96, 165, 250, 0.4);
}

.step.active .step-number.ai {
  background: linear-gradient(135deg, #60a5fa, var(--primary-color));
  border-color: var(--primary-color);
  box-shadow: 0 0 20px rgba(255, 51, 102, 0.6);
}

.step-number.success {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.step.active .step-number.success {
  background: #10b981;
  border-color: #10b981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
}

.step-title {
  font-weight: 700;
  font-size: 1.05rem;
  margin: 0;
  color: #fff;
  flex: 1;
}

.step-body {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-icon-wrapper {
  position: relative;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-icon {
  font-size: 1.8rem;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.step.active .step-icon {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.step-description {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.4;
}

/* === USER INPUT MOCK === */
.mock-input {
  background: rgba(0, 0, 0, 0.4);
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  border: 1px solid rgba(96, 165, 250, 0.25);
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.input-prefix {
  font-size: 1rem;
  opacity: 0.8;
}

.typed-text {
  color: #60a5fa;
  font-weight: 600;
  font-size: 0.95rem;
}

.cursor {
  animation: blink 1s step-end infinite;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 700;
}

/* === AI PROCESSING === */
.ai-wrapper {
  width: 56px;
  height: 56px;
}

.ai-brain {
  background: linear-gradient(135deg, #2a2a72, var(--primary-color));
  animation: brain-pulse 2s ease-in-out infinite;
  box-shadow: 0 4px 16px rgba(255, 51, 102, 0.3);
}

.ai-glow-effect {
  position: absolute;
  inset: -12px;
  background: radial-gradient(circle, var(--primary-color) 0%, transparent 65%);
  opacity: 0.25;
  animation: glow-pulse 2s ease-in-out infinite;
  z-index: 1;
  border-radius: 50%;
  filter: blur(8px);
}

.brain-waves {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.wave {
  position: absolute;
  inset: 0;
  border: 2px solid var(--primary-color);
  border-radius: 14px;
  opacity: 0;
  animation: wave-expand 2s ease-out infinite;
}

.wave:nth-child(2) { animation-delay: 0.7s; }
.wave:nth-child(3) { animation-delay: 1.4s; }

.processing-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.process-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.75rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.process-item.active {
  opacity: 1;
  transform: translateX(0);
  border-color: rgba(96, 165, 250, 0.2);
}

.process-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(96, 165, 250, 0.3);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

/* === RESULT CARD === */
.success-wrapper {
  width: 56px;
  height: 56px;
}

.success-icon {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
  border-color: rgba(16, 185, 129, 0.3);
}

.step.active .success-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  animation: success-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 3.5s backwards;
}

.result-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.06));
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
}

.card-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
}

.card-emoji {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  flex-shrink: 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card-name {
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  line-height: 1.2;
}

.card-badges {
  display: flex;
  gap: 0.4rem;
}

.category-badge {
  font-size: 0.7rem;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 3px 7px;
  border-radius: 6px;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;
}

.card-price {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 6px;
}

.card-check {
  width: 28px;
  height: 28px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  animation: check-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 3.5s backwards;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

.sparkles {
  position: absolute;
  inset: -20px;
  pointer-events: none;
  z-index: 3;
}

.sparkle {
  position: absolute;
  font-size: 0.7rem;
  animation: sparkle-float 2s ease-in-out infinite;
  opacity: 0;
}

.sparkle:nth-child(1) { top: 0; left: 50%; animation-delay: 3.5s; }
.sparkle:nth-child(2) { top: 20%; right: 0; animation-delay: 3.7s; }
.sparkle:nth-child(3) { bottom: 20%; left: 0; animation-delay: 3.9s; }
.sparkle:nth-child(4) { bottom: 0; right: 30%; animation-delay: 4.1s; }
.sparkle:nth-child(5) { top: 40%; left: -10px; animation-delay: 4.3s; }
.sparkle:nth-child(6) { top: 60%; right: -10px; animation-delay: 4.5s; }

/* === CONNECTOR === */
.connector {
  height: 32px;
  margin-left: 48px;
  position: relative;
}

.connector-line {
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
  margin-left: 15px;
}

.data-flow {
  position: absolute;
  top: 0;
  left: 15px;
  width: 2px;
  height: 100%;
}

.data-particle {
  position: absolute;
  top: -6px;
  left: -3px;
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  box-shadow: 0 0 12px var(--primary-color);
  animation: flow-down 2s ease-in-out infinite;
}

.data-particle.success {
  background: #10b981;
  box-shadow: 0 0 12px #10b981;
}

/* === FEATURES SECTION === */
.features-section {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.section-icon {
  font-size: 1.2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #fff;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.65rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  transition: all 0.3s ease;
  cursor: default;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.3rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  flex-shrink: 0;
}

.feature-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

/* === TRY IT SECTION === */
.try-it-section {
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-try-now {
  width: 100%;
  background: linear-gradient(135deg, var(--primary-color), #60a5fa);
  border: none;
  color: #fff;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 6px 24px rgba(255, 51, 102, 0.35);
  position: relative;
  overflow: hidden;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-try-now:hover .btn-glow {
  opacity: 1;
}

.btn-try-now:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 32px rgba(255, 51, 102, 0.5);
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-text {
  flex: 1;
}
