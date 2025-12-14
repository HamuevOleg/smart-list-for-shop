<template>
  <div class="best-shops-container">
    <div class="shops-header">
      <h2>🇲🇩 Best Shops in Moldova</h2>
      <p>Handpicked recommendations for you</p>
    </div>

    <div class="categories-grid">
      <div class="category-card">
        <div class="card-icon">🛒</div>
        <div class="card-content">
          <h3>Supermarkets</h3>
          <ul class="shop-list">
            <li>
              <span class="shop-name">Metro</span>
              <span class="tag cheap">Wholesale</span>
            </li>
            <li>
              <span class="shop-name">Linella</span>
              <span class="tag local">Local</span>
            </li>
            <li>
              <span class="shop-name">Nr 1</span>
              <span class="tag quality">Quality</span>
            </li>
            <li>
              <span class="shop-name">Kaufland</span>
              <span class="tag diverse">Diverse</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="category-card">
        <div class="card-icon">🍷</div>
        <div class="card-content">
          <h3>Wine Shops</h3>
          <ul class="shop-list">
            <li>
              <span class="shop-name">Wine.md</span>
              <span class="tag premium">Premium</span>
            </li>
            <li>
              <span class="shop-name">Invino</span>
              <span class="tag cozy">Cozy</span>
            </li>
            <li>
              <span class="shop-name">Purcari Bar</span>
              <span class="tag exclusive">Exclusive</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="category-card">
        <div class="card-icon">🥕</div>
        <div class="card-content">
          <h3>Fresh Markets</h3>
          <ul class="shop-list">
            <li>
              <span class="shop-name">Central Market</span>
              <span class="tag huge">Huge</span>
            </li>
            <li>
              <span class="shop-name">EcoLocal</span>
              <span class="tag organic">Organic</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="category-card">
        <div class="card-icon">🔌</div>
        <div class="card-content">
          <h3>Tech & Home</h3>
          <ul class="shop-list">
            <li>
              <span class="shop-name">Maximum</span>
              <span class="tag tech">Tech</span>
            </li>
            <li>
              <span class="shop-name">Darwin</span>
              <span class="tag gadgets">Gadgets</span>
            </li>
            <li>
              <span class="shop-name">JYSK</span>
              <span class="tag home">Home</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.best-shops-container {
  animation: fadeIn 0.5s ease;
  padding-bottom: 2rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.shops-header {
  text-align: center;
  margin-bottom: 2rem;
}

.shops-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff, var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.shops-header p {
  color: var(--text-light);
  font-size: 1rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-color: var(--primary-color);
}

.card-icon {
  font-size: 2.5rem;
  background: var(--bg-input);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  margin-bottom: 0.5rem;
}

.card-content h3 {
  text-align: center;
  margin: 0 0 1rem 0;
  color: var(--secondary-color);
  font-size: 1.2rem;
}

.shop-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.shop-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.shop-list li:last-child {
  border-bottom: none;
}

.shop-name {
  font-weight: 600;
  color: #fff;
}

.tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

/* Tag Colors */
.cheap { background: rgba(255, 215, 0, 0.2); color: #ffd700; }
.local { background: rgba(50, 205, 50, 0.2); color: #32cd32; }
.quality { background: rgba(138, 43, 226, 0.2); color: #8a2be2; }
.diverse { background: rgba(255, 69, 0, 0.2); color: #ff4500; }
.premium { background: rgba(218, 165, 32, 0.2); color: #daa520; }
.cozy { background: rgba(255, 105, 180, 0.2); color: #ff69b4; }
.exclusive { background: rgba(0, 191, 255, 0.2); color: #00bfff; }
.huge { background: rgba(128, 128, 128, 0.2); color: #d3d3d3; }
.organic { background: rgba(60, 179, 113, 0.2); color: #3cb371; }
.tech { background: rgba(0, 0, 255, 0.2); color: #4169e1; }
.gadgets { background: rgba(148, 0, 211, 0.2); color: #9400d3; }
.home { background: rgba(255, 140, 0, 0.2); color: #ff8c00; }

</style>
