import { createHTMLElement } from "@utilities/createElement";

function getOpacityEndpoints() {
  const o1 = String(1);
  const o2 = String(Math.random() * 0.25 + 0.1);
  return Math.floor(Math.random() * 2) === 0 ? { o1, o2 } : { o2, o1 };
}

function createFlickeringTextEl(text: string) {
  let isContinue = true;
  const pEL = createHTMLElement<HTMLParagraphElement>({ tag: "p" });

  for (let i = 0; i < text.length; i++) {
    const animationLength = Math.random() * 1.5 + 1;
    const { o1, o2 } = getOpacityEndpoints();
    const el = createHTMLElement<HTMLSpanElement>({
      tag: "span",
      modifier: (el) => {
        el.textContent = text[i];
        Object.assign(el.style, {
          transition: `opacity ${animationLength}s`,
          opacity: o1,
        });
      },
    });

    const start = () => {
      el.style.opacity = el.style.opacity === o1 ? o2 : o1;
      if (!isContinue) return;
      window.setTimeout(start, Math.random() * 1000 + animationLength * 1000);
    };
    pEL.appendChild(el);
    window.setTimeout(() => window.requestAnimationFrame(start), 100);
  }

  return {
    cleanup: () => {
      isContinue = false;
    },
    element: pEL,
  };
}

export default createFlickeringTextEl;
