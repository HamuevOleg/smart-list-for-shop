<template>
  <aside class="how-it-works-sidebar">
    <h3>🚀 How SmartList Works</h3>
    <p class="subtitle">Watch the AI magic happen in real-time</p>

    <div class="workflow-container">
      <div class="step user-action">
        <div class="step-icon">🧑‍💻</div>
        <div class="step-content">
          <span class="step-title">1. You add an item</span>
          <div class="mock-input">
            <span class="typed-text">"Avocados"</span>
            <span class="cursor">|</span>
          </div>
        </div>
      </div>

      <div class="connector-flow">
        <div class="data-packet"></div>
        <div class="data-packet delay-1"></div>
      </div>

      <div class="step ai-processing">
        <div class="ai-core-container">
          <div class="ai-core-glow"></div>
          <div class="step-icon ai-brain">🧠</div>
        </div>
        <div class="step-content">
          <span class="step-title">2. Gemini AI analyzes</span>
          <ul class="processing-tasks">
            <li class="task doing">Understanding text...</li>
            <li class="task doing delay-1">Predicting category...</li>
            <li class="task doing delay-2">Finding images...</li>
          </ul>
        </div>
      </div>

      <div class="connector-flow down">
        <div class="data-packet processed"></div>
      </div>

      <div class="step final-result">
        <div class="step-icon">✨</div>
        <div class="step-content">
          <span class="step-title">3. Smart Item Created!</span>
          <div class="mock-item-card">
            <span class="item-emoji">🥑</span>
            <div class="item-details">
              <span class="item-name">Avocados</span>
              <span class="item-badge">Fruits & Veg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.how-it-works-sidebar {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color, rgba(255,255,255,0.1));
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 1.5rem;
  color: #fff;
  height: fit-content;
  position: sticky;
  top: 20px; /* Чтобы при скролле инструкция оставалась видна */
}

h3 {
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #fff, var(--primary-color, #60a5fa));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.3rem;
}
.subtitle {
  color: var(--text-light, #aaa);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

/* WORKFLOW CONTAINER */
.workflow-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* COMMON STEP STYLES */
.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.8rem;
  background: rgba(0,0,0,0.2);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  transition: transform 0.3s ease;
}
.step:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.2);
}

.step-icon {
  font-size: 1.8rem;
  background: rgba(255,255,255,0.1);
  width: 45px; height: 45px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.step-title {
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

/* === STEP 1 SPECIFIC === */
.mock-input {
  background: rgba(0,0,0,0.3);
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-family: monospace;
  border: 1px solid rgba(var(--primary-rgb, 96, 165, 250), 0.3);
  display: flex;
  align-items: center;
}
.typed-text { color: var(--primary-color, #60a5fa); }
.cursor {
  animation: blink 1s step-end infinite;
  color: var(--text-light, #aaa);
}

/* === STEP 2: AI BRAIN ANIMATION === */
.ai-core-container {
  position: relative;
  width: 45px; height: 45px;
  flex-shrink: 0;
}
.ai-brain {
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, #2a2a72, var(--primary-color, #009ffd));
  animation: brain-pulse 2s ease-in-out infinite;
}
.ai-core-glow {
  position: absolute;
  top: 50%; left: 50%;
  width: 100%; height: 100%;
  transform: translate(-50%, -50%);
  background: var(--primary-color, #60a5fa);
  filter: blur(20px);
  opacity: 0.4;
  animation: core-glow-pulse 2s ease-in-out infinite alternate;
  z-index: 1;
}

.processing-tasks {
  list-style: none; padding: 0; margin: 0;
  font-size: 0.85rem; color: var(--text-light, #aaa);
}
.task {
  display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;
}
.task.doing::before {
  content: '';
  display: block; width: 8px; height: 8px;
  border: 2px solid var(--primary-color, #60a5fa);
  border-top-color: transparent; border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* === STEP 3: FINAL RESULT === */
.mock-item-card {
  background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  padding: 0.5rem; border-radius: 10px;
  display: flex; align-items: center; gap: 0.8rem;
  border-left: 3px solid #10b981; /* Green success border */
  animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: 2.5s; /* Ждем пока "пройдут" данные */
}
.item-emoji { font-size: 1.4rem; }
.item-details { display: flex; flex-direction: column; }
.item-name { font-weight: 600; }
.item-badge { font-size: 0.7rem; background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 6px; border-radius: 4px; width: fit-content; margin-top: 2px;}


/* === CONNECTORS & DATA FLOW ANIMATIONS === */
.connector-flow {
  height: 40px;
  margin-left: 22px; /* Centers with icons */
  border-left: 2px dashed rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}
.data-packet {
  position: absolute;
  top: 0; left: -6px;
  width: 10px; height: 10px;
  background: var(--primary-color, #60a5fa);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--primary-color, #60a5fa);
  animation: flow-down 1.5s linear infinite;
}
.data-packet.processed { background: #10b981; box-shadow: 0 0 10px #10b981; }
.delay-1 { animation-delay: 0.75s; }
.delay-2 { animation-delay: 1.5s; }


/* === KEYFRAMES === */
@keyframes blink { 50% { opacity: 0; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes flow-down {
  0% { top: -10px; opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
@keyframes brain-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(var(--primary-rgb), 0); }
  50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(96, 165, 250, 0.5); }
}
@keyframes core-glow-pulse { 0% { opacity: 0.3; scale: 0.8; } 100% { opacity: 0.6; scale: 1.2; } }
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.8) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
