<template>
  <span ref="el" :class="className">
    {{ formattedValue }}
  </span>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTransition, useElementVisibility, TransitionPresets } from '@vueuse/core';

const props = defineProps({
  to: { type: Number, required: true },
  from: { type: Number, default: 0 },
  direction: { type: String, default: 'up' }, // 'up' | 'down'
  delay: { type: Number, default: 0 },
  duration: { type: Number, default: 2 }, // в секундах
  className: { type: String, default: '' },
  startWhen: { type: Boolean, default: true },
  separator: { type: String, default: '' },
  decimals: { type: Number, default: null }
});

const emit = defineEmits(['onStart', 'onEnd']);
const el = ref(null);

// 1. Начальное значение
const initialValue = props.direction === 'down' ? props.to : props.from;
const source = ref(initialValue);

// 2. Отслеживаем, когда элемент попадает во viewport
const isVisible = useElementVisibility(el);

// 3. Настраиваем физику перехода (как spring в React)
const output = useTransition(source, {
  duration: props.duration * 1000,
  transition: TransitionPresets.easeOutCubic, // Плавное замедление в конце
  delay: props.delay * 1000,
  onStarted: () => emit('onStart'),
  onFinished: () => emit('onEnd'),
});

// 4. Форматирование (запятые, точки)
const formattedValue = computed(() => {
  const val = output.value;

  // Считаем знаки после запятой
  let decimalPlaces = 0;
  if (props.decimals !== null) {
    decimalPlaces = props.decimals;
  } else {
    const getDecimals = (num) => {
      const str = num.toString();
      if (str.includes('.')) return str.split('.')[1].length;
      return 0;
    };
    decimalPlaces = Math.max(getDecimals(props.from), getDecimals(props.to));
  }

  const options = {
    useGrouping: !!props.separator,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  };

  // Intl - самый быстрый нативный способ форматирования
  const formatted = new Intl.NumberFormat('en-US', options).format(val);

  return props.separator
    ? formatted.replace(/,/g, props.separator)
    : formatted;
});

// 5. Запуск анимации
const hasAnimated = ref(false);

watch(
  [isVisible, () => props.startWhen],
  ([visible, start]) => {
    if (visible && start && !hasAnimated.value) {
      hasAnimated.value = true;
      // Меняем значение source, useTransition сам сделает анимацию к этому числу
      source.value = props.direction === 'down' ? props.from : props.to;
    }
  }
);
</script>
