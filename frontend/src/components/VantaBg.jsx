// src/components/VantaBG.jsx
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Фон с анимацией Vanta.js (модель DOTS).
 * Рисуется через глобальный window.VANTA.DOTS поверх контейнера <div ref>.
 * Компонент занимает весь экран и рендерится за контентом (-z-10).
 */
export default function VantaBG({
  // Цвета в формате чисел 0xRRGGBB (ожидаемый формат Vanta)
  backgroundColor = 0x13214c, // цвет фона
  color = 0x17e1b1, // основной цвет точек/линий
  color2 = 0x17e1b1, // дополнительный цвет точек (градиент)
  showLines = true, // показывать соединяющие линии
  size = 2, // размер точек
  spacing = 15, // шаг сетки (расстояние между точками)
}) {
  const ref = useRef(null);

  useEffect(() => {
    // Глобальный объект VANTA может отсутствовать (SSR/ленивая загрузка)
    if (!window.VANTA || !window.VANTA.DOTS) return undefined;

    // Инициализация анимации на указанном элементе
    const v = window.VANTA.DOTS({
      el: ref.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      // Параметры внешнего вида
      backgroundColor,
      color,
      color2,
      showLines,
      size,
      spacing,
    });

    // Чистка: корректно останавливаем анимацию
    return () => v?.destroy();
  }, [backgroundColor, color, color2, showLines, size, spacing]);

  // Фиксированный слой на весь экран за контентом
  return <div ref={ref} className="fixed inset-0 -z-10" />;
}

VantaBG.propTypes = {
  /** Цвет фона как число 0xRRGGBB (например, 0x13214c) */
  backgroundColor: PropTypes.number,
  /** Основной цвет точек/линий 0xRRGGBB */
  color: PropTypes.number,
  /** Второй цвет точек (градиент) 0xRRGGBB */
  color2: PropTypes.number,
  /** Отрисовывать ли линии между точками */
  showLines: PropTypes.bool,
  /** Размер точек */
  size: PropTypes.number,
  /** Расстояние между точками */
  spacing: PropTypes.number,
};
