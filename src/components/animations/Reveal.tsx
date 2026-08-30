import { useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'section' | 'li' | 'span';
}

// 通用入场动画：淡入 + 上移
export function Reveal({ children, className, delay = 0, y = 24, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(ref.current, {
      autoAlpha: 0,
      y,
      duration: 0.6,
      delay,
      ease: 'power3.out',
    });
  }, { scope: ref });

  const Tag = as as any;
  return (
    <Tag ref={ref} className={className} style={{ visibility: 'hidden' }}>
      {children}
    </Tag>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  selector?: string;
  stagger?: number;
}

// 子元素依次入场（需配合 selector）
export function StaggerReveal({ children, className, selector = '.reveal-item', stagger = 0.08 }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(`${selector}`, {
      autoAlpha: 0,
      y: 20,
      duration: 0.5,
      stagger,
      ease: 'power2.out',
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// 数字滚动动画
export function CountUp({ value, duration = 1.2, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(obj.val).toLocaleString('zh-CN');
        }
      },
    });
  }, { dependencies: [value], scope: ref });

  return <span ref={ref} className={className}>0</span>;
}