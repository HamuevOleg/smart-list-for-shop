<template>
  <div class="landing-page">
    <header class="landing-header" :class="{ 'scrolled': isScrolled }">
      <div class="header-container">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18H3zM12 8v8m-4-4h8"/>
          </svg>
          <span class="logo-text">SmartList</span>
        </div>
        <nav class="nav-links">
          <a href="#features" class="nav-link">Возможности</a>
          <a href="#demo" class="nav-link">Демо</a>
          <a href="#testimonials" class="nav-link">Отзывы</a>
        </nav>
        <div class="nav-buttons">
          <button class="btn btn-outline" @click="showSignup = true">Войти</button>
          <button class="btn btn-primary" @click="showSignup = true">
            Регистрация
          </button>
        </div>
      </div>
    </header>

    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content container">
        <div class="hero-badge">
          Now Powered by AI Technology
        </div>

        <h1 class="hero-title">
          Умные списки покупок
          <br>
          для современных команд.
        </h1>

        <p class="hero-subtitle">
          Синхронизация в реальном времени, автоматическая категоризация через AI и сравнение цен. Экономьте время и бюджет.
        </p>

        <div class="hero-buttons">
          <button class="btn btn-primary btn-lg" @click="showSignup = true">
            Начать бесплатно
          </button>
          <button class="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-blue-900" @click="scrollToDemo">
            Смотреть демо
          </button>
        </div>
      </div>
    </section>

    <div class="white-bg-wrapper">
      <section class="stats-section container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">10k+</div>
            <div class="stat-label">Активных пользователей</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">2M$</div>
            <div class="stat-label">Сэкономлено средств</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">99.9%</div>
            <div class="stat-label">Uptime сервиса</div>
          </div>
        </div>
      </section>

      <section class="section-padding bg-gray-50" id="demo">
        <div class="container">
          <div class="section-header">
            <h2>Автоматизация рутины</h2>
            <p>Введите название товара, а AI определит категорию и найдет лучшую цену.</p>
          </div>

          <div class="demo-interface">
            <div class="demo-window rounded shadow-lg bg-white">
              <div class="window-header">
                <div class="window-dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="window-title">SmartList App - New List</div>
              </div>
              <div class="window-body p-8">
                <div class="demo-input-group mb-8">
                  <input
                    v-model="demoInput"
                    type="text"
                    class="form-input-clean"
                    placeholder="Например: молоко, авокадо..."
                    @input="handleDemoInput"
                  />
                </div>

                <Transition name="fade">
                  <div v-if="demoResult" class="demo-result-clean">
                    <div class="result-row">
                      <div class="result-main">
                        <div class="item-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </div>
                        <div>
                          <h4 class="text-lg font-semibold">{{ demoResult.name }}</h4>
                          <span class="badge-clean">{{ demoResult.category }}</span>
                        </div>
                      </div>
                      <div class="result-prices">
                        <div class="price-option">
                          <span class="store text-gray-500">Metro</span>
                          <span class="font-medium">{{ demoResult.price }}</span>
                        </div>
                        <div class="price-option best-price">
                          <span class="store text-green-600">Linella (Лучшая цена)</span>
                          <span class="font-bold text-green-700">{{ demoResult.betterPrice }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-padding container" id="features">
        <div class="section-header">
          <h2>Ключевые преимущества</h2>
          <p>Функционал, необходимый для эффективного управления покупками.</p>
        </div>

        <div class="features-grid-clean">
          <div class="feature-card-clean" v-for="(feature, i) in features" :key="i">
            <div class="feature-icon-clean">
              <component :is="feature.iconComponent" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <section class="section-padding bg-gray-50" id="testimonials">
        <div class="container">
          <div class="section-header">
            <h2>Отзывы клиентов</h2>
          </div>

          <div class="testimonial-slider">
            <button class="slider-nav prev" @click="prevTestimonial" aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>

            <div class="slider-track-container">
              <div class="testimonial-card-clean" :key="currentTestimonialIndex">
                <div class="quote-icon">“</div>
                <p class="testimonial-text">{{ testimonials[currentTestimonialIndex].text }}</p>
                <div class="testimonial-author">
                  <div class="author-avatar-placeholder">
                    {{ testimonials[currentTestimonialIndex].name.charAt(0) }}
                  </div>
                  <div class="author-info">
                    <div class="author-name">{{ testimonials[currentTestimonialIndex].name }}</div>
                    <div class="author-role">{{ testimonials[currentTestimonialIndex].role }}</div>
                  </div>
                </div>
              </div>
            </div>

            <button class="slider-nav next" @click="nextTestimonial" aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
          <div class="slider-dots">
            <span
              v-for="(t, i) in testimonials"
              :key="i"
              class="dot"
              :class="{ active: i === currentTestimonialIndex }"
              @click="currentTestimonialIndex = i"
            ></span>
          </div>
        </div>
      </section>

      <section class="cta-section-clean section-padding container text-center">
        <h2>Готовы оптимизировать процесс покупок?</h2>
        <p class="mb-8 text-gray-600 max-w-2xl mx-auto">Присоединяйтесь к тысячам пользователей, которые уже экономят время и деньги с SmartList.</p>
        <button class="btn btn-primary btn-lg" @click="showSignup = true">
          Начать бесплатно сейчас
        </button>
        <div class="mt-4 text-sm text-gray-500">Не требуется кредитная карта. Базовый тариф бесплатен навсегда.</div>
      </section>

      <footer class="footer-clean bg-gray-900 text-white pt-16 pb-8">
        <div class="container grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div class="footer-brand">
            <div class="logo mb-4">
              <span class="logo-text text-white">SmartList</span>
            </div>
            <p class="text-gray-400">Профессиональное решение для управления совместными покупками.</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Продукт</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">Функции</a></li>
              <li><a href="#" class="hover:text-white">Безопасность</a></li>
              <li><a href="#" class="hover:text-white">Enterprise</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Компания</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">О нас</a></li>
              <li><a href="#" class="hover:text-white">Блог</a></li>
              <li><a href="#" class="hover:text-white">Контакты</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Legal</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">Условия использования</a></li>
              <li><a href="#" class="hover:text-white">Политика конфиденциальности</a></li>
            </ul>
          </div>
        </div>
        <div class="container border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          © 2025 SmartList. Все права защищены. Разработано в Молдове.
        </div>
      </footer>
    </div>

    <Transition name="modal-fade">
      <div class="modal-backdrop-clean" v-if="showSignup" @click.self="showSignup = false">
        <div class="modal-content-clean">
          <button class="modal-close-btn" @click="showSignup = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div class="modal-header-clean">
            <h2>Добро пожаловать</h2>
            <p>Создайте аккаунт, чтобы начать работу.</p>
          </div>

          <form @submit.prevent="handleRegister" class="modal-form">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">Ваше Имя</label>
              <input
                v-model="username"
                type="text"
                placeholder="Иван Петров"
                class="form-input-clean w-full"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary w-full py-3">
              Продолжить
            </button>
          </form>
          <div class="text-center mt-4 text-sm text-gray-500">
            Регистрируясь, вы принимаете <a href="#" class="text-blue-600 hover:underline">Условия</a>.
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// Icons as simple components for the features section
const IconCpu = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>' }
const IconZap = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' }
const IconTrendingUp = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>' }
const IconUsers = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' }
const IconPieChart = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>' }
const IconLock = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>' }

const router = useRouter()
const userStore = useUserStore()

const showSignup = ref(false)
const username = ref('')
const demoInput = ref('')
const demoResult = ref(null)
const isScrolled = ref(false)

// Scroll handler for header styling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const features = [
  { iconComponent: IconCpu, title: 'AI Авто-сортировка', description: 'Мгновенная категоризация товаров с использованием алгоритмов машинного обучения.' },
  { iconComponent: IconZap, title: 'Real-time Синхронизация', description: 'Используем WebSocket для мгновенного обновления списков на всех устройствах.' },
  { iconComponent: IconTrendingUp, title: 'Сравнение цен', description: 'Анализ цен в популярных сетях (Metro, Linella) для поиска выгодных предложений.' },
  { iconComponent: IconUsers, title: 'Совместный доступ', description: 'Эффективное управление семейными или командными списками покупок.' },
  { iconComponent: IconPieChart, title: 'Аналитика расходов', description: 'Наглядные диаграммы и отчеты о структуре ваших трат.' },
  { iconComponent: IconLock, title: 'Безопасность данных', description: 'Шифрование данных и строгое соблюдение политики конфиденциальности.' }
]

// Testimonials Slider Logic
const currentTestimonialIndex = ref(0)
const testimonials = [
  { name: 'Анна Маркова', role: 'Менеджер проектов', text: 'SmartList кардинально изменил наш подход к закупкам в офисе. Мы экономим до 20% бюджета благодаря функции сравнения цен.' },
  { name: 'Дмитрий Коваленко', role: 'Разработчик', text: 'Как технический специалист, я впечатлен скоростью синхронизации. GraphQL подписки работают безупречно. Отличный стек технологий.' },
  { name: 'Мария Иванова', role: 'Домохозяйка, Мама 3 детей', text: 'Наконец-то мы с мужем перестали покупать одно и то же дважды. Общий список в реальном времени — это спасение для большой семьи.' }
]

const nextTestimonial = () => {
  currentTestimonialIndex.value = (currentTestimonialIndex.value + 1) % testimonials.length
}

const prevTestimonial = () => {
  currentTestimonialIndex.value = (currentTestimonialIndex.value - 1 + testimonials.length) % testimonials.length
}

// Demo Data (Cleaned up)
const demoData = {
  milk: { name: 'Молоко пастеризованное', category: 'Молочные продукты', price: '42 MDL', betterPrice: '38 MDL' },
  avocado: { name: 'Авокадо Хасс', category: 'Фрукты и Овощи', price: '65 MDL', betterPrice: '59 MDL' },
  bread: { name: 'Хлеб цельнозерновой', category: 'Выпечка', price: '18 MDL', betterPrice: '15 MDL' },
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

    // Simple mock search
    const matchKey = Object.keys(demoData).find(key => input.includes(key))

    if (matchKey) {
      demoResult.value = demoData[matchKey]
    } else {
      demoResult.value = {
        name: demoInput.value,
        category: 'Другое (Определяется...)',
        price: '--',
        betterPrice: '--'
      }
    }
  }, 300)
}

const handleRegister = () => {
  if (!username.value.trim()) return
  // Use a generic avatar placeholder instead of alien emoji
  userStore.setUser(username.value, 'U')
  router.push('/dashboard')
}

const scrollToDemo = () => {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* Reset & Base Styles */
* { margin: 0; padding: 0; box-sizing: border-box; }
.landing-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  background-color: #fff;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.white-bg-wrapper {
  background-color: #fff;
  position: relative;
  z-index: 2;
}

.section-padding {
  padding: 6rem 0;
}

/* Utility Classes */
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-900 { background-color: #111827; }
.text-white { color: #fff; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-blue-600 { color: #2563eb; }
.text-green-600 { color: #059669; }
.text-green-700 { color: #047857; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.text-center { text-align: center; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }
.mt-4 { margin-top: 1rem; }
.p-8 { padding: 2rem; }
.w-full { width: 100%; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.rounded { border-radius: 0.5rem; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.gap-8 { gap: 2rem; }
.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
.border-t { border-top-width: 1px; }
.border-gray-800 { border-color: #1f2937; }
.hover\:text-white:hover { color: #fff; }
.hover\:underline:hover { text-decoration: underline; }
.max-w-2xl { max-width: 42rem; }
.mx-auto { margin-left: auto; margin-right: auto; }

/* Typography */
h1 { font-size: 3.5rem; line-height: 1.2; font-weight: 800; letter-spacing: -0.025em; }
h2 { font-size: 2.25rem; line-height: 1.3; font-weight: 700; letter-spacing: -0.025em; margin-bottom: 1rem; color: #111827; }
p { font-size: 1.125rem; line-height: 1.75; color: #4b5563; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.75rem 1.5rem; border-radius: 0.375rem; font-weight: 600;
  transition: all 0.2s; cursor: pointer; border: none; font-size: 1rem;
}
.btn-primary {
  background-color: #2563eb; color: #fff;
}
.btn-primary:hover { background-color: #1d4ed8; }
.btn-outline {
  background-color: transparent; color: #374151; border: 1px solid #d1d5db;
}
.btn-outline:hover { background-color: #f3f4f6; }
.btn-lg { padding: 1rem 2rem; font-size: 1.125rem; }
.hover\:bg-white:hover { background-color: #fff !important; }
.hover\:text-blue-900:hover { color: #1e3a8a !important; }
.border-white { border-color: #fff !important; }

/* Header */
.landing-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  padding: 1.25rem 0; transition: all 0.3s ease;
  background-color: transparent;
}
.landing-header.scrolled {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem 0;
}
.header-container {
  display: flex; justify-content: space-between; align-items: center;
  max-width: 1200px; margin: 0 auto; padding: 0 2rem;
}
.logo { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; font-size: 1.5rem; color: #111827; }
.logo-icon { width: 28px; height: 28px; color: #2563eb; }
.scrolled .logo-text { color: #111827; }
.landing-header:not(.scrolled) .logo-text,
.landing-header:not(.scrolled) .nav-link { color: #fff; }
.landing-header:not(.scrolled) .btn-outline { color: #fff; border-color: rgba(255,255,255,0.5); }

.nav-links { display: flex; gap: 2rem; }
.nav-link { text-decoration: none; color: #374151; font-weight: 600; transition: color 0.2s; }
.nav-link:hover { color: #2563eb; }
.nav-buttons { display: flex; gap: 1rem; }

/* Hero Section */
.hero-section {
  position: relative;
  height: 85vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  /* Replace with a real professional shopping/tech image url */
  background-image: url('https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80');
  background-size: cover;
  background-position: center;
  color: #fff;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to right, rgba(17, 24, 39, 0.9), rgba(17, 24, 39, 0.4));
}
.hero-content { position: relative; z-index: 10; max-width: 800px; }
.hero-badge {
  display: inline-block; padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1); color: #fff;
  border-radius: 9999px; font-size: 0.875rem; font-weight: 600;
  margin-bottom: 1.5rem; backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.hero-title { margin-bottom: 1.5rem; color: #fff; }
.hero-subtitle { margin-bottom: 3rem; color: rgba(255, 255, 255, 0.8); max-width: 600px; }
.hero-buttons { display: flex; gap: 1rem; }

/* Stats Section */
.stats-section { padding: 4rem 2rem; background-color: #fff; border-bottom: 1px solid #e5e7eb; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; text-align: center; }
.stat-number { font-size: 3rem; font-weight: 800; color: #2563eb; line-height: 1; margin-bottom: 0.5rem; }
.stat-label { color: #4b5563; font-weight: 500; }

/* Section Headers */
.section-header { text-align: center; margin-bottom: 4rem; max-width: 700px; margin-left: auto; margin-right: auto; }

/* Demo Interface (Clean) */
.demo-window { border: 1px solid #e5e7eb; overflow: hidden; }
.window-header {
  background-color: #f3f4f6; padding: 0.75rem 1.5rem; border-bottom: 1px solid #e5e7eb;
  display: flex; align-items: center;
}
.window-dots { display: flex; gap: 6px; margin-right: 1rem; }
.window-dots span { width: 10px; height: 10px; border-radius: 50%; background-color: #d1d5db; }
.window-title { font-size: 0.875rem; color: #6b7280; font-weight: 500; }
.form-input-clean {
  width: 100%; padding: 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem;
  font-size: 1.125rem; transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input-clean:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

.demo-result-clean { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; background-color: #fff; }
.result-row { display: flex; justify-content: space-between; align-items: center; }
.result-main { display: flex; align-items: center; gap: 1rem; }
.item-icon {
  width: 48px; height: 48px; background-color: #eff6ff; color: #2563eb;
  border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;
}
.badge-clean {
  display: inline-block; padding: 0.25rem 0.75rem; background-color: #e5e7eb;
  color: #374151; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-top: 0.25rem;
}
.result-prices { text-align: right; }
.price-option { display: flex; flex-direction: column; }
.price-option.best-price { margin-top: 0.5rem; }

/* Features Grid (Clean) */
.features-grid-clean { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; }
.feature-card-clean h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; color: #111827; }
.feature-card-clean p { color: #4b5563; }
.feature-icon-clean {
  width: 56px; height: 56px; background-color: #eff6ff; color: #2563eb;
  border-radius: 0.75rem; display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.5rem;
}
.feature-icon-clean svg { width: 28px; height: 28px; }

/* Testimonials Slider */
.testimonial-slider {
  position: relative;
  max-width: 800px;
  margin: 0 auto 3rem auto;
  display: flex;
  align-items: center;
}
.slider-track-container {
  flex-grow: 1;
  overflow: hidden;
  padding: 1rem;
}
.testimonial-card-clean {
  background-color: #fff;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-align: center;
  position: relative;
}
.quote-icon {
  position: absolute; top: 1rem; left: 2rem; font-size: 5rem; color: #e5e7eb; line-height: 1;
}
.testimonial-text { font-size: 1.25rem; color: #111827; font-weight: 500; margin-bottom: 2rem; position: relative; z-index: 2; }
.testimonial-author { display: flex; align-items: center; justify-content: center; gap: 1rem; }
.author-avatar-placeholder {
  width: 48px; height: 48px; background-color: #2563eb; color: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem; font-weight: 600;
}
.author-name { font-weight: 600; color: #111827; }
.author-role { font-size: 0.875rem; color: #6b7280; }

.slider-nav {
  background: #fff; border: 1px solid #e5e7eb; color: #374151;
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
}
.slider-nav:hover { background-color: #f9fafb; border-color: #d1d5db; color: #2563eb; }
.slider-nav.prev { left: -24px; }
.slider-nav.next { right: -24px; }
.slider-dots { display: flex; justify-content: center; gap: 0.5rem; }
.dot { width: 10px; height: 10px; border-radius: 50%; background-color: #d1d5db; cursor: pointer; transition: background-color 0.2s; }
.dot.active { background-color: #2563eb; }

/* Modal (Clean) */
.modal-backdrop-clean {
  position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center; z-index: 100;
  backdrop-filter: blur(4px);
}
.modal-content-clean {
  background-color: #fff; padding: 2.5rem; border-radius: 1rem;
  width: 100%; max-width: 450px; position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.modal-close-btn {
  position: absolute; top: 1.25rem; right: 1.25rem; background: transparent; border: none;
  color: #9ca3af; cursor: pointer; transition: color 0.2s;
}
.modal-close-btn:hover { color: #111827; }
.modal-header-clean { text-align: center; margin-bottom: 2rem; }
.modal-header-clean h2 { font-size: 1.75rem; margin-bottom: 0.5rem; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-content-clean { animation: modalIn 0.3s ease-out; }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  h1 { font-size: 2.5rem; }
  h2 { font-size: 1.75rem; }
  .nav-links, .stats-grid, .features-grid-clean { display: none; }
  .hero-buttons { flex-direction: column; width: 100%; }
  .btn-lg { width: 100%; }
  .stats-grid { grid-template-columns: 1fr; gap: 1rem; }
  .result-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .result-prices { text-align: left; width: 100%; display: flex; justify-content: space-between; }
  .slider-nav { display: none; }
  .testimonial-card-clean { padding: 2rem; }
  .quote-icon { left: 1rem; top: 0.5rem; }
  .md\:grid-cols-4 { grid-template-columns: 1fr; }
}
</style>
