<template>
  <div class="calendar">
    <div class="calendar-header">
      <button type="button" @click="prevMonth" class="nav-btn">&lt;</button> <span class="month-year">{{ monthName }} {{ viewYear }}</span>
      <button type="button" @click="nextMonth" class="nav-btn">&gt;</button> </div>
    <div class="calendar-grid weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
    </div>
    <div class="calendar-grid days">
      <div
        v-for="(day, index) in days"
        :key="index"
        :class="dayClasses(day)"
        @click="selectDate(day)"
      >
        <span class="day-number">{{ day.date.getDate() }}</span>
      </div>
    </div>
    <button type="button" class="btn btn-secondary btn-clear" @click="clearDate"> Clear Date
    </button>
  </div>
</template>

<script setup>
// ... (весь <script setup> остается без изменений) ...
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: String, // YYYY-MM-DD
})
const emit = defineEmits(['update:modelValue'])

const today = new Date()
today.setHours(0, 0, 0, 0)

// 'viewDate' - это месяц/год, который мы сейчас просматриваем
const viewDate = ref(new Date(props.modelValue || Date.now()))
viewDate.value.setDate(1) // Всегда начинаем с 1го числа

const viewMonth = computed(() => viewDate.value.getMonth())
const viewYear = computed(() => viewDate.value.getFullYear())

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const selectedDate = computed(() => {
  if (!props.modelValue) return null
  const [y, m, d] = props.modelValue.split('-').map(Number)
  return new Date(y, m - 1, d)
})

// Главная магия - генерация сетки дней
const days = computed(() => {
  const dateArray = []
  const month = viewMonth.value
  const year = viewYear.value

  // 1. Первый день месяца
  const firstDayOfMonth = new Date(year, month, 1)
  // 2. День недели (0=Вс, 1=Пн). Нам нужен 0=Пн.
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7

  // 3. Последний день месяца
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const lastDate = lastDayOfMonth.getDate()

  // 4. Дни из прошлого месяца (padding)
  for (let i = firstDayWeekday; i > 0; i--) {
    const date = new Date(year, month, 0) // 0 = последний день прошлого месяца
    date.setDate(date.getDate() - i + 1)
    dateArray.push({ date: date, isCurrentMonth: false })
  }

  // 5. Дни текущего месяца
  for (let i = 1; i <= lastDate; i++) {
    const date = new Date(year, month, i)
    dateArray.push({ date: date, isCurrentMonth: true })
  }

  // 6. Дни из следующего месяца (padding)
  const remainingCells = 42 - dateArray.length // 6 недель * 7 дней
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i)
    dateArray.push({ date: date, isCurrentMonth: false })
  }
  return dateArray
})

// Навигация
const prevMonth = () => {
  viewDate.value = new Date(viewYear.value, viewMonth.value - 1, 1)
}
const nextMonth = () => {
  viewDate.value = new Date(viewYear.value, viewMonth.value + 1, 1)
}

// Форматирование YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0]
}

// Выбор даты
const selectDate = (day) => {
  if (!day.isCurrentMonth) return
  emit('update:modelValue', formatDate(day.date))
}

const clearDate = () => {
  emit('update:modelValue', '')
}

// Расчет классов для подсветки
const dayClasses = (day) => {
  const classes = ['day']
  if (!day.isCurrentMonth) classes.push('other-month')

  if (day.date.getTime() === today.getTime()) classes.push('today')

  if (selectedDate.value && day.date.getTime() === selectedDate.value.getTime()) {
    classes.push('selected')
  }

  // "Линия" (делаем ее в виде 'range')
  if (selectedDate.value) {
    const start = Math.min(today.getTime(), selectedDate.value.getTime())
    const end = Math.max(today.getTime(), selectedDate.value.getTime())
    if (day.date.getTime() > start && day.date.getTime() < end) {
      classes.push('range-between')
    }
  }
  return classes
}

// Название месяца на русском
const monthName = computed(() => {
  return viewDate.value.toLocaleString('en-EN', { month: 'long' })
})
</script>

<style scoped>
/* Стили остаются без изменений */
.calendar {
  border-radius: 200px;
  width: 100%;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.month-year {
  font-weight: 600;
  color: var(--secondary-color);
  text-transform: capitalize;
}
.nav-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}
.nav-btn:hover {
  transition: all 0.3s ease ;
  background-color: var(--bg-color);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.weekdays {
  margin-bottom: 0.5rem;
}
.weekday {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-light);
  text-align: center;
}

.day {
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25rem 0;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}
.day:not(.other-month):hover {
  background-color: #f1f5f9;
}
.day-number {
  z-index: 2;
  position: relative;
  font-size: 0.9rem;
}

.other-month {
  color: var(--border-color);
  cursor: default;
}

.today .day-number {
  font-weight: 700;
  color: var(--primary-color);
}

/* "Линия" / Рендж */
.range-between {
  background-color: #eff6ff;
  color: #1a0f1f/* Светло-голубой */
}
.range-between.today, .range-between.selected {
  background-color: #dbeafe; /* Темнее голубой */
}

.selected {
  background-color: var(--primary-color) !important;
  color: white;
}
.selected .day-number {
  color: white !important;
  font-weight: 700;
}

.btn-clear {
  width: 100%;
  margin-top: 1rem;
  padding: 0.5em;
  font-size: 0.9rem;
}
</style>
