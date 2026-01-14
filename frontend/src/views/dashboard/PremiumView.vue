<template>
  <div class="premium-view">
    <div class="premium-header">
      <h1>💎 Upgrade to Premium</h1>
      <p>Unlock AI powers, unlimited lists, and family sharing.</p>
    </div>

    <div class="plans-grid">
      <div class="plan-card">
        <h3>Starter</h3>
        <div class="price">$0<span>/mo</span></div>
        <ul>
          <li>📦 3 Lists</li>
          <li>👥 2 Members</li>
          <li>🤖 Basic AI</li>
        </ul>
        <button class="btn btn-secondary">Current Plan</button>
      </div>

      <div class="plan-card pro">
        <div class="badge">Popular</div>
        <h3>Pro</h3>
        <div class="price">$4.99<span>/mo</span></div>
        <ul>
          <li>🚀 Unlimited Lists</li>
          <li>👨‍👩‍👧‍👦 5 Members</li>
          <li>✨ Smart Price Comparer</li>
        </ul>
        <button class="btn btn-primary">Upgrade Now</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.premium-view { padding: 2rem; text-align: center; }
.premium-header h1 { font-size: 2.5rem; background: linear-gradient(135deg, #f093fb, #f5576c); -webkit-background-clip: text; color: transparent; margin-bottom: 0.5rem; }
.premium-header p { color: #8b92a8; margin-bottom: 3rem; }
.plans-grid { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; }
.plan-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 2rem; width: 300px; text-align: left; position: relative; }
.plan-card.pro { border-color: #667eea; background: linear-gradient(180deg, rgba(102,126,234,0.1), rgba(0,0,0,0)); }
.badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #667eea; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }
.price { font-size: 2.5rem; font-weight: 800; margin: 1rem 0; }
.price span { font-size: 1rem; color: #8b92a8; font-weight: 400; }
ul { list-style: none; padding: 0; margin-bottom: 2rem; }
li { padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d1d5db; }
.btn { width: 100%; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; border: none; }
.btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.btn-secondary { background: rgba(255,255,255,0.1); color: white; }
</style>
