// src/utils/metallicPaintHelper.js

export function parseLogoImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 1. Настройка размеров (ограничиваем, чтобы не тормозило)
      const MAX_SIZE = 512; // Уменьшил для стабильности
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      const aspectRatio = width / height;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          width = MAX_SIZE;
          height = Math.round(MAX_SIZE / aspectRatio);
        } else {
          height = MAX_SIZE;
          width = Math.round(MAX_SIZE * aspectRatio);
        }
      }

      // 2. Рисуем SVG на Canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // Важно: очищаем канвас перед рисованием
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // 3. Анализируем пиксели для создания маски
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // shapeMask: true, если пиксель принадлежит логотипу
      const shapeMask = new Uint8Array(width * height);

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        // Если пиксель хоть немного виден (alpha > 10), считаем его частью формы
        shapeMask[i / 4] = alpha > 10 ? 1 : 0;
      }

      // 4. Генерация поля расстояний (упрощенная симуляция для React Bits)
      // Создаем текстуру, где яркость зависит от удаленности от края
      const floatBuffer = new Float32Array(width * height).fill(0);

      // Простой блюр для создания "объема"
      // Проходимся несколько раз чтобы размыть маску внутрь
      const iterations = 40;
      // Инициализация буфера маской
      for(let i=0; i< width*height; i++) {
        floatBuffer[i] = shapeMask[i] ? 1.0 : 0.0;
      }

      // Простейшее размытие (Box Blur)
      const tempBuffer = new Float32Array(width * height);
      for(let k=0; k<iterations; k++) {
        for(let y=1; y<height-1; y++) {
          for(let x=1; x<width-1; x++) {
            const idx = y*width + x;
            if(shapeMask[idx] === 0) continue; // Не размываем наружу

            const sum = floatBuffer[idx-1] + floatBuffer[idx+1] +
              floatBuffer[idx-width] + floatBuffer[idx+width];
            tempBuffer[idx] = (floatBuffer[idx] + sum) * 0.2;
          }
        }
        // Копируем обратно, сохраняя границы 0
        for(let i=0; i<width*height; i++) {
          if(shapeMask[i]) floatBuffer[i] = tempBuffer[i] + 0.01; // +0.01 чтобы не затухало совсем
        }
      }

      // Нормализация
      let maxVal = 0;
      for(let i=0; i<floatBuffer.length; i++) maxVal = Math.max(maxVal, floatBuffer[i]);

      // Записываем результат в ImageData для WebGL
      const outData = ctx.createImageData(width, height);
      for (let i = 0; i < width * height; i++) {
        const idx = i * 4;
        const val = floatBuffer[i] / (maxVal || 1); // Нормализуем 0..1

        // R канал используется шейдером как карта высот
        const gray = Math.floor(val * 255);

        if (shapeMask[i]) {
          outData.data[idx] = gray;     // R
          outData.data[idx + 1] = gray; // G
          outData.data[idx + 2] = gray; // B
          outData.data[idx + 3] = 255;  // Alpha (полная, т.к. прозрачность контролирует шейдер)
        } else {
          outData.data[idx + 3] = 0;    // Полная прозрачность фона
        }
      }

      resolve({ imageData: outData });
    };

    img.onerror = (e) => reject(e);

    if (file instanceof File || file instanceof Blob) {
      img.src = URL.createObjectURL(file);
    } else {
      reject(new Error("Invalid file type"));
    }
  });
}
