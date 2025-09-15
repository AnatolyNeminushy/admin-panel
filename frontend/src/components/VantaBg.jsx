import { useEffect, useRef } from "react";

export default function VantaBG({
  // цвета как ЧИСЛА 0xRRGGBB
  backgroundColor = 0x13214c, // фон
  color = 0x17e1b1,           // цвет линий/точек 1
  color2 = 0x17e1b1,          // цвет точек 2 (градиент)
  showLines = true,           // показывать ли линии между точками
  size = 2,                   // размер точек
  spacing = 15,               // расстояние между точками
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!window.VANTA || !window.VANTA.DOTS) return;
    const v = window.VANTA.DOTS({
      el: ref.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      // параметры внешнего вида
      backgroundColor,
      color,
      color2,
      showLines,
      size,
      spacing,
    });
    return () => v?.destroy();
  }, [backgroundColor, color, color2, showLines, size, spacing]);

  // слой на всю страницу, за контентом
  return <div ref={ref} className="fixed inset-0 -z-10" />;
}
