<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import Lenis from 'lenis';
import CountUp from '@/components/CountUp.vue';
import { useUserStore } from '@/stores/userStore';
import AuthModal from '@/components/AuthModal.vue';

// --- LAZY LOADING ---
const ScrollStack = defineAsyncComponent(() => import('@/components/ScrollStack.vue'));
const MagicCard = defineAsyncComponent(() => import('@/components/MagicCard.vue'));

const router = useRouter();
const userStore = useUserStore();
let lenis = null;

// --- STATE ДЛЯ AUTH MODAL (Вход/Регистрация) ---
const isAuthModalForceOpen = ref(false);

const goToApp = () => {
  if (userStore.isRegistered) {
    router.push('/dashboard');
  } else {
    // Если не авторизован, показываем модалку авторизации
    isAuthModalForceOpen.value = true;
  }
};

const closeAuthModal = () => {
  isAuthModalForceOpen.value = false;
};

// --- STATE ДЛЯ ИНФО-МОДАЛОК (Privacy, Terms...) ---
const isInfoModalOpen = ref(false);
const currentInfoTitle = ref('');
const currentInfoContent = ref('');

const modalContentMap = {
  privacy: {
    title: "Privacy Policy",
    body: "<p>At SmartList, your privacy is our priority.</p><br/><ul><li><strong>Data Collection:</strong> We only collect email addresses for account sync.</li><li><strong>Encryption:</strong> All lists are encrypted using AES-256.</li><li><strong>Third Parties:</strong> We strictly do not sell your data to advertisers.</li></ul><br/><p>If you have questions, contact privacy@smartlist.app</p>"
  },
  terms: {
    title: "Terms of Service",
    body: "<p>By using SmartList, you agree to the following:</p><br/><ul><li><strong>Usage:</strong> Do not use the app for illegal activities.</li><li><strong>Liability:</strong> We are not responsible if you forget to buy milk.</li><li><strong>Updates:</strong> We may update these terms at any time.</li></ul>"
  },
  security: {
    title: "Security",
    body: "<p>We use industry-standard security measures:</p><br/><ul><li>SSL/TLS encryption for all data in transit.</li><li>Secure database storage with Google Cloud Platform.</li><li>Regular security audits.</li></ul>"
  },
  about: {
    title: "About Us",
    body: "<p>SmartList was built by a team of developers who were tired of chaotic shopping trips. Our mission is to make family grocery shopping synchronized, smart, and stress-free using the power of Vue 3 and Gemini AI.</p>"
  },
  careers: {
    title: "Careers",
    body: "<p>We are hiring!</p><br/><ul><li>Senior Frontend Developer (Vue 3)</li><li>Backend Engineer (Spring Boot)</li><li>AI Specialist</li></ul><br/><p>Send your CV to careers@smartlist.app</p>"
  }
};

const openInfoModal = (type) => {
  const content = modalContentMap[type];
  if (content) {
    currentInfoTitle.value = content.title;
    currentInfoContent.value = content.body;
    isInfoModalOpen.value = true;
    if (lenis) lenis.stop();
  }
};

const closeInfoModal = () => {
  isInfoModalOpen.value = false;
  if (lenis) lenis.start();
};

// --- SCROLL REVEAL DIRECTIVE ---
const vAnimateOnScroll = {
  mounted: (el) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  }
};

onMounted(() => {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
});

onUnmounted(() => {
  if (lenis) lenis.destroy();
});

const features = [
  {
    id: 1,
    title: "🧠 AI-Powered Intelligence",
    description: "Type 'milk' and watch Gemini AI automatically categorize it, find the best image, and suggest prices from local stores.",
    colorClass: "bg-purple"
  },
  {
    id: 2,
    title: "⚡ Real-Time Sync",
    description: "Your partner checks off an item? It vanishes from your list instantly. No more double-buying or confusion.",
    colorClass: "bg-blue"
  },
  {
    id: 3,
    title: "👨‍👩‍👧‍👦 Family Collaboration",
    description: "Share lists via link. No accounts needed. Everyone sees updates live. Perfect for households of any size.",
    colorClass: "bg-green"
  },
  {
    id: 4,
    title: "💰 Smart Budget Tracking",
    description: "Automatic expense categorization. See exactly where your money goes. Compare store prices in real-time.",
    colorClass: "bg-orange"
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["Up to 3 shopping lists", "Basic AI categorization", "Mobile & Web access", "Community support"],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    features: ["Unlimited lists", "Advanced AI features", "Price comparison", "Budget analytics", "Priority support", "Receipt scanning"],
    cta: "Start 14-Day Trial",
    popular: true
  },
  {
    name: "Family",
    price: "$9.99",
    period: "/month",
    features: ["Everything in Pro", "Up to 6 family members", "Shared budget dashboard", "Custom categories", "Premium support", "Advanced analytics"],
    cta: "Start 14-Day Trial",
    popular: false
  }
];

const faqs = [
  {
    question: "How does the AI categorization work?",
    answer: "We use Google's Gemini AI to analyze your items and automatically sort them into smart categories like Groceries, Household, etc. It also fetches relevant images to make your list visually appealing."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your information with third parties."
  },
  {
    question: "Can I use it offline?",
    answer: "Yes! SmartList works offline. Your changes sync automatically when you're back online, so you never lose data."
  },
  {
    question: "How does real-time collaboration work?",
    answer: "We use GraphQL subscriptions over WebSocket. When anyone in your family updates the list, everyone else sees the change instantly - no refresh needed."
  }
];

const activeFaq = ref(null);
const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index;
};
</script>

<template>
  <div class="landing-page">

    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="stars"></div>
    </div>

    <div v-if="isAuthModalForceOpen" class="landing-auth-wrapper">
      <AuthModal />
      <button class="close-auth-landing" @click="closeAuthModal" title="Close">×</button>
    </div>

    <Transition name="modal-fade">
      <div v-if="isInfoModalOpen" class="modal-backdrop" @click.self="closeInfoModal">
        <div class="modal-content">
          <button class="modal-close" @click="closeInfoModal">✕</button>
          <h2 class="modal-title">{{ currentInfoTitle }}</h2>
          <div class="modal-body" v-html="currentInfoContent"></div>
          <button class="btn-primary btn-modal-action" @click="closeInfoModal">Got it</button>
        </div>
      </div>
    </Transition>

    <div class="content-container">

      <nav class="navbar">
        <div class="nav-content">
          <div class="logo">
            <span class="logo-icon">🦄</span>
            <span class="logo-text">SmartList</span>
          </div>
          <div class="nav-actions">
            <a href="#pricing" class="nav-link">Pricing</a>
            <a href="#faq" class="nav-link">FAQ</a>
            <button class="btn-nav" @click="goToApp">Open App</button>
          </div>
        </div>
      </nav>

      <section class="hero-section">
        <div class="hero-badge">
          <span class="badge-icon">✨</span>
          <span>Powered by Gemini AI</span>
        </div>

        <h1 class="hero-title">
          Shopping Lists,<br/>
          <span class="gradient-text">Reimagined</span>
        </h1>

        <div class="hero-logo-container">
          <img src="@/assets/unicorn-logo.png" alt="SmartList Unicorn Logo" class="hero-logo" />
        </div>

        <p class="hero-subtitle">
          Real-time collaboration. AI-powered intelligence. Never forget the milk again.
        </p>

        <div class="hero-cta">
          <button class="btn-primary btn-large" @click="goToApp">
            <span>Start Free</span>
            <span class="btn-arrow">→</span>
          </button>
          <button class="btn-secondary btn-large">
            <span>Watch Demo</span>
            <span>▶</span>
          </button>
        </div>

        <div class="hero-stats">
          <div class="stats-container">
            <div class="stat-item">
              <h2>Active Users</h2>
              <div class="number text-green-500">
                <CountUp :to="15000" :duration="2.5" separator="," class-name="tabular-nums" />
                <span>+</span>
              </div>
            </div>

            <div class="stat-item">
              <h2>Lists Created</h2>
              <div class="number text-purple-500">
                <CountUp :to="85.5" :decimals="1" :duration="3" class-name="tabular-nums" />
                <span>k</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="features-section" v-animate-on-scroll>
        <div class="section-header">
          <h2 class="section-title">Why SmartList?</h2>
          <p class="section-subtitle">Four powerful reasons to switch today</p>
        </div>

        <div class="stack-wrapper">
          <ScrollStack :items="features" :itemDistance="60">
            <template #card="{ item }">
              <div class="feature-card-content" :class="item.colorClass">
                <div class="feature-icon">{{ item.title.split(' ')[0] }}</div>
                <div class="feature-text">
                  <h3>{{ item.title.substring(3) }}</h3>
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </template>
          </ScrollStack>
        </div>
      </section>

      <section class="demo-section" v-animate-on-scroll>
        <div class="demo-grid">
          <MagicCard class="demo-card" glowColor="236, 72, 153">
            <div class="demo-content">
              <div class="demo-icon">🤖</div>
              <h3>AI Recognition</h3>
              <p>Just type "bananas" and watch the magic happen</p>
              <div class="demo-showcase">
                <div class="demo-input">🍌 Bananas</div>
                <div class="demo-arrow">↓</div>
                <div class="demo-result">
                  <img src="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=60&h=60&fit=crop" alt="Bananas" class="demo-img" loading="lazy">
                  <div>
                    <div class="result-title">Bananas</div>
                    <div class="result-meta">🍎 Fruits • $2.99/kg</div>
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>

          <MagicCard class="demo-card" glowColor="59, 130, 246">
            <div class="demo-content">
              <div class="demo-icon">⚡</div>
              <h3>Live Updates</h3>
              <p>Changes appear instantly on all devices</p>
              <div class="demo-showcase">
                <div class="sync-demo">
                  <div class="device device-1">
                    <div class="device-screen">
                      <div class="list-item checked">✓ Milk</div>
                      <div class="list-item">Bread</div>
                    </div>
                  </div>
                  <div class="sync-indicator">⟷</div>
                  <div class="device device-2">
                    <div class="device-screen">
                      <div class="list-item checked">✓ Milk</div>
                      <div class="list-item">Bread</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>

          <MagicCard class="demo-card" glowColor="16, 185, 129">
            <div class="demo-content">
              <div class="demo-icon">💰</div>
              <h3>Budget Tracking</h3>
              <p>See where your money goes</p>
              <div class="demo-showcase">
                <div class="budget-chart">
                  <div class="chart-bar" style="height: 75%; background: #ec4899;"><span>Groceries</span></div>
                  <div class="chart-bar" style="height: 45%; background: #8b5cf6;"><span>Snacks</span></div>
                  <div class="chart-bar" style="height: 60%; background: #3b82f6;"><span>Household</span></div>
                </div>
              </div>
            </div>
          </MagicCard>
        </div>
      </section>

      <section class="pricing-section" id="pricing">
        <div class="section-header" v-animate-on-scroll>
          <h2 class="section-title">Simple Pricing</h2>
          <p class="section-subtitle">Choose the plan that fits your needs</p>
        </div>

        <div class="pricing-grid">
          <div
            v-for="(plan, idx) in pricingPlans"
            :key="plan.name"
            class="pricing-card"
            :class="{ popular: plan.popular }"
            v-animate-on-scroll
            :style="{ transitionDelay: `${idx * 100}ms` }"
          >
            <div v-if="plan.popular" class="popular-badge">Most Popular</div>
            <div class="plan-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="price">{{ plan.price }}</span>
                <span class="period">{{ plan.period }}</span>
              </div>
            </div>
            <ul class="plan-features">
              <li v-for="feature in plan.features" :key="feature">
                <span class="check-icon">✓</span>
                <span>{{ feature }}</span>
              </li>
            </ul>
            <button class="btn-plan" :class="{ 'btn-plan-popular': plan.popular }" @click="goToApp">{{ plan.cta }}</button>
          </div>
        </div>
      </section>

      <section class="faq-section" id="faq" v-animate-on-scroll>
        <div class="section-header">
          <h2 class="section-title">FAQ</h2>
          <p class="section-subtitle">Everything you need to know</p>
        </div>
        <div class="faq-list">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="faq-item"
            :class="{ active: activeFaq === index }"
            @click="toggleFaq(index)"
          >
            <div class="faq-question">
              <span>{{ faq.question }}</span>
              <span class="faq-icon" :class="{ rotated: activeFaq === index }">▼</span>
            </div>
            <Transition name="faq-expand">
              <div v-if="activeFaq === index" class="faq-answer">{{ faq.answer }}</div>
            </Transition>
          </div>
        </div>
      </section>

      <section class="cta-section" v-animate-on-scroll>
        <div class="cta-content">
          <h2 class="cta-title">Ready to get started?</h2>
          <p class="cta-subtitle">Join thousands of families shopping smarter</p>
          <button class="btn-primary btn-large" @click="goToApp">
            <span>Start Free Today</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </section>

      <footer class="footer">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="logo">
              <span class="logo-icon">🛒</span>
              <span class="logo-text">SmartList</span>
            </div>
            <p>Shopping lists, reimagined.</p>
          </div>

          <div class="footer-links">
            <div class="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <div class="footer-column">
              <h4>Company</h4>
              <a href="#" @click.prevent="openInfoModal('about')">About</a>
              <a href="#" @click.prevent="openInfoModal('about')">Blog</a>
              <a href="#" @click.prevent="openInfoModal('careers')">Careers</a>
            </div>
            <div class="footer-column">
              <h4>Legal</h4>
              <a href="#" @click.prevent="openInfoModal('privacy')">Privacy</a>
              <a href="#" @click.prevent="openInfoModal('terms')">Terms</a>
              <a href="#" @click.prevent="openInfoModal('security')">Security</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2025 SmartList. Built with ❤️ using Vue 3, GraphQL & Gemini AI</p>
        </div>
      </footer>

    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* === Landing Auth Modal Wrapper === */
.landing-auth-wrapper {
  position: fixed;
  inset: 0;
  z-index: 9999;
  /* AuthModal имеет свой backdrop, но нам нужен контейнер для кнопки закрытия */
  pointer-events: none; /* Пропускаем клики до модалки, кроме кнопки закрытия */
}

.landing-auth-wrapper > * {
  pointer-events: auto; /* Включаем клики для самой модалки */
}

.close-auth-landing {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  pointer-events: auto;
}

.close-auth-landing:hover {
  background: rgba(255, 51, 102, 0.8);
  transform: scale(1.1) rotate(90deg);
}

/* === MODAL STYLES (INFO) === */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}

.modal-content {
  background: #121218;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 24px;
  max-width: 550px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  max-height: 85vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 10;
}

.modal-close:hover { color: #fff; }

.modal-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #fff;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding-right: 2rem;
}

.modal-body {
  color: #d1d5db;
  line-height: 1.7;
  margin-bottom: 2rem;
  font-size: 1rem;
}

:deep(.modal-body ul) { padding-left: 1.5rem; margin-bottom: 1rem; }
:deep(.modal-body li) { margin-bottom: 0.5rem; }
:deep(.modal-body strong) { color: #fff; }

.btn-modal-action { width: 100%; justify-content: center; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.95); }

/* === BASE LAYOUT === */
.animate-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); will-change: opacity, transform; }
.animate-on-scroll.is-visible { opacity: 1; transform: translateY(0); }

.landing-page { min-height: 100vh; background: #0a0a0f; color: #fff; position: relative; overflow-x: hidden; width: 100%; }

.animated-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.gradient-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; animation: float 20s infinite ease-in-out; will-change: transform; }
.orb-1 { width: min(500px, 70vw); height: min(500px, 70vw); background: radial-gradient(circle, #ec4899, transparent); top: -10%; left: 10%; }
.orb-2 { width: min(600px, 80vw); height: min(600px, 80vw); background: radial-gradient(circle, #8b5cf6, transparent); bottom: -10%; right: 10%; animation-delay: -7s; }
.orb-3 { width: min(400px, 60vw); height: min(400px, 60vw); background: radial-gradient(circle, #3b82f6, transparent); top: 40%; right: 20%; animation-delay: -14s; }
@keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 30px) scale(0.9); } }

.stars { position: absolute; inset: 0; background-image: radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent); background-size: 200% 200%; opacity: 0.5; animation: twinkle 8s infinite; }
@keyframes twinkle { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }

.content-container { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

.navbar { padding: 1.5rem 0; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(10px); background: rgba(10, 10, 15, 0.8); border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.nav-content { display: flex; justify-content: space-between; align-items: center; }
.logo { display: flex; align-items: center; gap: 0.75rem; font-size: 1.5rem; font-weight: 700; }
.logo-icon { font-size: 2rem; }
.logo-text { background: linear-gradient(135deg, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-actions { display: flex; align-items: center; gap: 2rem; }
.nav-link { color: #d1d5db; text-decoration: none; font-weight: 500; transition: color 0.2s; }
.nav-link:hover { color: #fff; }
.btn-nav { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-nav:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4); }

.hero-section { text-align: center; padding: 8rem 0 6rem; display: flex; flex-direction: column; align-items: center; }
.hero-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.9rem; margin-bottom: 2rem; animation: fadeInDown 0.8s ease; }
.badge-icon { animation: spin 3s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.hero-title { font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem; animation: fadeInUp 0.8s ease 0.2s backwards; }
.gradient-text { background: linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradient-shift 3s ease infinite; background-size: 200% 200%; }
@keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
.hero-logo-container { margin-top: -20px; margin-bottom: 30px; z-index: 2; animation: fadeInUp 0.8s ease 0.3s backwards; }
.hero-logo { width: min(180px, 40vw); height: auto; filter: drop-shadow(0 10px 20px rgba(139, 92, 246, 0.3)); }
.hero-subtitle { font-size: clamp(1rem, 3vw, 1.3rem); color: #9ca3af; max-width: 600px; margin: 0 auto 3rem; animation: fadeInUp 0.8s ease 0.4s backwards; padding: 0 1rem; }
.hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 4rem; animation: fadeInUp 0.8s ease 0.6s backwards; }

.btn-primary, .btn-secondary { padding: 1rem 2rem; border-radius: 50px; font-weight: 600; font-size: 1.1rem; cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; border: none; min-width: 160px; }
.btn-primary { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3); }
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(236, 72, 153, 0.5); }
.btn-secondary { background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2); }
.btn-secondary:hover { background: rgba(255, 255, 255, 0.15); transform: translateY(-3px); }
.btn-arrow { transition: transform 0.3s; }
.btn-primary:hover .btn-arrow { transform: translateX(5px); }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }

/* === FEATURES === */
.features-section { padding: 6rem 0; }
.section-header { text-align: center; margin-bottom: 4rem; padding: 0 1rem; }
.section-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; margin-bottom: 1rem; }
.section-subtitle { color: #9ca3af; font-size: 1.2rem; }

.feature-card-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 3rem;
  height: auto; /* Fix for mobile stack overlap */
  min-height: 100%;
  border-radius: 24px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

.feature-icon { font-size: 4rem; min-width: 100px; text-align: center; }
.feature-text h3 { font-size: 1.8rem; margin-bottom: 0.75rem; font-weight: 700; }
.feature-text p { color: #d1d5db; font-size: 1.1rem; line-height: 1.6; }

.bg-purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(10, 10, 15, 0.9)); border-left: 4px solid #8b5cf6; }
.bg-blue { background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(10, 10, 15, 0.9)); border-left: 4px solid #3b82f6; }
.bg-green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(10, 10, 15, 0.9)); border-left: 4px solid #10b981; }
.bg-orange { background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(10, 10, 15, 0.9)); border-left: 4px solid #f97316; }

/* === DEMO & PRICING === */
.demo-section { padding: 6rem 0; }
.demo-grid, .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
.demo-card { min-height: 400px; }
.demo-content { padding: 2rem; height: 100%; display: flex; flex-direction: column; gap: 1rem; }
.demo-icon { font-size: 3rem; }
.demo-content h3 { font-size: 1.5rem; font-weight: 700; }
.demo-content p { color: #9ca3af; margin-bottom: 1rem; }
.demo-showcase { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 1rem; }
.demo-input { background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); text-align: center; }
.demo-arrow { text-align: center; font-size: 1.5rem; color: #9ca3af; }
.demo-result { display: flex; align-items: center; gap: 1rem; background: rgba(236, 72, 153, 0.1); padding: 1rem; border-radius: 12px; border: 1px solid rgba(236, 72, 153, 0.3); }
.demo-img { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; }
.result-title { font-weight: 600; margin-bottom: 0.25rem; }
.result-meta { font-size: 0.9rem; color: #9ca3af; }
.sync-demo { display: flex; align-items: center; justify-content: center; gap: 1rem; }
.device { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 8px; width: 130px; }
.device-screen { background: #0a0a0f; border-radius: 10px; padding: 10px; height: 180px; display: flex; flex-direction: column; gap: 8px; }
.list-item { font-size: 0.8rem; padding: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; }
.list-item.checked { opacity: 0.5; text-decoration: line-through; background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.sync-indicator { font-size: 2rem; color: #3b82f6; animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
.budget-chart { display: flex; align-items: flex-end; justify-content: center; gap: 15px; height: 200px; padding-bottom: 20px; border-bottom: 2px solid rgba(255, 255, 255, 0.1); }
.chart-bar { width: 60px; border-radius: 8px 8px 0 0; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 10px; font-size: 0.8rem; font-weight: 600; position: relative; transition: transform 0.3s; }
.chart-bar:hover { transform: scaleY(1.05); }
.chart-bar span { position: absolute; bottom: -25px; color: #9ca3af; font-size: 0.75rem; }

.pricing-section { padding: 6rem 0; }
.pricing-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 2.5rem; position: relative; transition: transform 0.3s, box-shadow 0.3s; }
.pricing-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.05); }
.pricing-card.popular { background: linear-gradient(180deg, rgba(236, 72, 153, 0.1), rgba(255, 255, 255, 0.03)); border-color: rgba(236, 72, 153, 0.5); box-shadow: 0 0 30px rgba(236, 72, 153, 0.1); }
.popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 0.25rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
.plan-header { text-align: center; margin-bottom: 2rem; }
.plan-name { font-size: 1.5rem; margin-bottom: 0.5rem; }
.plan-price .price { font-size: 3rem; font-weight: 800; }
.plan-price .period { color: #9ca3af; font-size: 1rem; }
.plan-features { list-style: none; margin-bottom: 2.5rem; }
.plan-features li { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; color: #d1d5db; }
.check-icon { color: #10b981; font-weight: bold; }
.btn-plan { width: 100%; padding: 1rem; border-radius: 12px; background: rgba(255, 255, 255, 0.1); color: white; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-plan:hover { background: rgba(255, 255, 255, 0.2); }
.btn-plan-popular { background: linear-gradient(135deg, #ec4899, #8b5cf6); }
.btn-plan-popular:hover { opacity: 0.9; transform: scale(1.02); }

/* === FAQ === */
.faq-section { padding: 6rem 0; max-width: 800px; margin: 0 auto; }
.faq-list { display: flex; flex-direction: column; gap: 1rem; }
.faq-item { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; cursor: pointer; transition: background 0.2s; }
.faq-item:hover { background: rgba(255, 255, 255, 0.05); }
.faq-item.active { background: rgba(255, 255, 255, 0.07); border-color: rgba(255, 255, 255, 0.2); }
.faq-question { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 1.1rem; }
.faq-icon { transition: transform 0.3s; color: #ec4899; }
.faq-icon.rotated { transform: rotate(180deg); }
.faq-answer { padding: 0 1.5rem 1.5rem; color: #9ca3af; line-height: 1.6; }
.faq-expand-enter-active, .faq-expand-leave-active { transition: all 0.3s ease; max-height: 200px; opacity: 1; }
.faq-expand-enter-from, .faq-expand-leave-to { max-height: 0; opacity: 0; padding-bottom: 0; }

/* === CTA & FOOTER === */
.cta-section { padding: 8rem 0; text-align: center; }
.cta-content { background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1)); padding: 4rem 2rem; border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.1); position: relative; overflow: hidden; }
.cta-content::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #ec4899, transparent); }
.cta-title { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; }
.cta-subtitle { color: #9ca3af; font-size: 1.2rem; margin-bottom: 2.5rem; }

.footer { border-top: 1px solid rgba(255, 255, 255, 0.1); padding: 4rem 0 2rem; background: rgba(10, 10, 15, 0.5); }
.footer-content { display: grid; grid-template-columns: 1fr 2fr; gap: 4rem; margin-bottom: 4rem; }
.footer-brand p { color: #9ca3af; margin-top: 1rem; }
.footer-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
.footer-column h4 { font-size: 1.1rem; margin-bottom: 1.5rem; color: #fff; }
.footer-column a { display: block; color: #9ca3af; text-decoration: none; margin-bottom: 0.75rem; transition: color 0.2s; cursor: pointer; }
.footer-column a:hover { color: #ec4899; }
.footer-bottom { text-align: center; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.05); color: #6b7280; font-size: 0.9rem; }

.hero-stats { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1); animation: fadeInUp 0.8s ease 0.8s backwards; width: 100%; }
.stats-container { display: flex; justify-content: center; align-items: center; gap: 3rem; flex-wrap: wrap; }
.stat-item { text-align: center; }
.stat-item h2 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 0.5rem; }
.number { font-size: 3rem; font-weight: 800; line-height: 1; display: flex; justify-content: center; align-items: baseline; }
.text-green-500 { color: #10b981; text-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
.text-purple-500 { color: #a855f7; text-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
.tabular-nums { font-variant-numeric: tabular-nums; }

/* ========================================= */
/* === RESPONSIVE DESIGN (MOBILE & TABLET) === */
/* ========================================= */

@media (max-width: 992px) {
  .hero-title { font-size: 3.5rem; }
  .feature-card-content { flex-direction: column; text-align: center; padding: 2.5rem; gap: 1.5rem; }
  .footer-content { grid-template-columns: 1fr; gap: 3rem; }
}

@media (max-width: 768px) {
  .content-container { padding: 0 1.5rem; }
  .nav-actions .nav-link { display: none; }
  .navbar { padding: 1rem 0; }
  .hero-section { padding: 5rem 0 4rem; }
  .hero-title { font-size: 2.5rem; line-height: 1.2; }
  .hero-logo-container { margin-top: 0; }
  .hero-stats { margin-top: 3rem; }
  .stats-container { gap: 2rem; flex-direction: column; }

  /* === ФИКС ПРОБЛЕМЫ С НАЛОЖЕНИЕМ КАРТОЧЕК НА МОБИЛКАХ === */
  /* Мы принудительно отключаем sticky-эффекты и блюр внутри ScrollStack */
  :deep(.scroll-stack-item) {
    position: relative !important;
    top: auto !important;
    transform: none !important;
    margin-bottom: 2rem !important;
    opacity: 1 !important;
    filter: none !important; /* Убираем блюр */
    height: auto !important;
  }

  :deep(.scroll-stack-wrapper) {
    height: auto !important;
  }
  /* ======================================================== */

  .features-section { padding: 4rem 0; }
  .feature-card-content { padding: 1.5rem; min-height: auto; }
  .feature-icon { font-size: 3rem; margin-bottom: 1rem; }

  .demo-section { padding: 4rem 0; }
  .demo-card { min-height: auto; }
  .sync-demo { transform: scale(0.9); }

  .pricing-section { padding: 4rem 0; }
  .pricing-card { padding: 2rem; }

  /* Footer Mobile Fix */
  .footer-links { grid-template-columns: 1fr; text-align: center; gap: 2.5rem; }
  .footer-brand { text-align: center; display: flex; flex-direction: column; align-items: center; }
  .footer-column h4 { margin-bottom: 1rem; color: #ec4899; }

  .cta-section { padding: 4rem 0; }
  .cta-content { padding: 3rem 1.5rem; border-radius: 24px; }
  .cta-title { font-size: 2rem; }
}

@media (max-width: 480px) {
  .hero-cta { flex-direction: column; width: 100%; }
  .btn-primary, .btn-secondary { width: 100%; }
  .logo-text { display: none; }
  .logo-icon { font-size: 2.5rem; }
  .number { font-size: 2.5rem; }
}
</style>
