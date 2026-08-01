(() => {
  "use strict";

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const menuButton = document.querySelector("[data-menu-open]");
  const menu = document.querySelector("[data-menu]");
  const siteLayer = document.querySelector(".site-layer");
  let returnFocus = null;

  const menuFocusable = () => menu
    ? [...menu.querySelectorAll("a[href], button:not([disabled])")].filter((element) => !element.hidden)
    : [];

  const closeMenu = () => {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
    if (siteLayer) siteLayer.inert = false;
    returnFocus?.focus();
  };

  const openMenu = () => {
    if (!menu || !menu.hidden) return;
    returnFocus = document.activeElement;
    menu.hidden = false;
    document.body.classList.add("menu-open");
    menuButton?.setAttribute("aria-expanded", "true");
    if (siteLayer) siteLayer.inert = true;
    requestAnimationFrame(() => menu.querySelector("[data-menu-close]")?.focus());
  };

  menuButton?.addEventListener("click", openMenu);
  menu?.querySelector("[data-menu-close]")?.addEventListener("click", closeMenu);
  menu?.querySelectorAll("a[href]").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (!menu || menu.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = menuFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
  const sharpWord = document.querySelector("[data-sharp]");
  let mouseX = 0;
  let mouseY = 0;
  let parallaxFrame = 0;

  const applyParallax = () => {
    parallaxFrame = 0;
    const enabled = !reduceMotion.matches;
    const scrollShift = enabled ? Math.min(scrollY || 0, 1100) : 0;
    parallaxItems.forEach((item) => {
      const x = Number(item.dataset.parallaxX || 0);
      const y = Number(item.dataset.parallaxY || 0);
      const rotation = Number(item.dataset.parallaxRotate || 0);
      const scroll = Number(item.dataset.parallaxScroll || 0);
      const translateX = enabled ? mouseX * x : 0;
      const translateY = enabled ? mouseY * y + scrollShift * scroll : 0;
      item.style.transform = `perspective(900px) translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0) rotateX(${(-mouseY * rotation).toFixed(2)}deg) rotateY(${(mouseX * rotation).toFixed(2)}deg)`;
    });
    if (sharpWord) {
      sharpWord.style.transform = enabled
        ? `perspective(600px) rotate(-2deg) rotateY(${(mouseX * 16).toFixed(2)}deg) rotateX(${(-mouseY * 10).toFixed(2)}deg)`
        : "rotate(-2deg)";
    }
  };

  const queueParallax = () => {
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(applyParallax);
  };

  addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / innerWidth - 0.5) * 2;
    mouseY = (event.clientY / innerHeight - 0.5) * 2;
    queueParallax();
  }, { passive: true });
  addEventListener("scroll", queueParallax, { passive: true });
  reduceMotion.addEventListener?.("change", queueParallax);
  queueParallax();

  class ScrollDoodle {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.strips = new Map();
      this.animationFrame = 0;
      this.paintFrame = 0;
      this.colors = null;
      this.onViewportChange = () => {
        if (this.paintFrame) return;
        this.paintFrame = requestAnimationFrame(() => {
          this.paintFrame = 0;
          this.paint();
        });
      };
      addEventListener("scroll", this.onViewportChange, { passive: true });
      addEventListener("resize", this.onViewportChange, { passive: true });
      reduceMotion.addEventListener?.("change", () => this.restart());
      this.restart();
    }

    field(x, y) {
      const u = x / 300;
      const v = y / 300;
      return 1.00 * Math.sin(1.00 * u + 0.62 * v + 0.6)
        + 0.80 * Math.sin(-0.72 * u + 1.34 * v + 1.7)
        + 0.50 * Math.sin(1.95 * u - 1.08 * v + 4.1)
        + 0.30 * Math.sin(2.70 * u + 2.30 * v + 2.2)
        + 0.17 * Math.sin(4.30 * u + 3.70 * v + 0.5);
    }

    strip(stripIndex) {
      const cached = this.strips.get(stripIndex);
      if (cached) return cached;
      const worldWidth = 1600;
      const stripHeight = 1100;
      const columns = 112;
      const rows = 80;
      const levels = 76;
      const low = -2.85;
      const high = 2.85;
      const gridX = worldWidth / columns;
      const gridY = stripHeight / rows;
      const top = stripIndex * stripHeight;
      const grid = [];
      for (let j = 0; j <= rows; j += 1) {
        const row = [];
        for (let i = 0; i <= columns; i += 1) row.push(this.field(i * gridX, top + j * gridY));
        grid.push(row);
      }
      const key = (point) => `${Math.round(point[0] * 2)},${Math.round(point[1] * 2)}`;
      const output = [];
      for (let levelIndex = 0; levelIndex < levels; levelIndex += 1) {
        const level = low + (high - low) * ((levelIndex + 0.5) / levels);
        const segments = [];
        const interpolate = (x1, y1, value1, x2, y2, value2) => {
          const fraction = (level - value1) / (value2 - value1);
          return [x1 + (x2 - x1) * fraction, y1 + (y2 - y1) * fraction];
        };
        for (let j = 0; j < rows; j += 1) {
          for (let i = 0; i < columns; i += 1) {
            const x0 = i * gridX;
            const y0 = top + j * gridY;
            const x1 = x0 + gridX;
            const y1 = y0 + gridY;
            const a = grid[j][i];
            const b = grid[j][i + 1];
            const c = grid[j + 1][i + 1];
            const d = grid[j + 1][i];
            const mask = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
            if (mask === 0 || mask === 15) continue;
            const topPoint = () => interpolate(x0, y0, a, x1, y0, b);
            const rightPoint = () => interpolate(x1, y0, b, x1, y1, c);
            const bottomPoint = () => interpolate(x1, y1, c, x0, y1, d);
            const leftPoint = () => interpolate(x0, y1, d, x0, y0, a);
            if (mask === 1 || mask === 14) segments.push([leftPoint(), bottomPoint()]);
            else if (mask === 2 || mask === 13) segments.push([bottomPoint(), rightPoint()]);
            else if (mask === 3 || mask === 12) segments.push([leftPoint(), rightPoint()]);
            else if (mask === 4 || mask === 11) segments.push([topPoint(), rightPoint()]);
            else if (mask === 6 || mask === 9) segments.push([topPoint(), bottomPoint()]);
            else if (mask === 7 || mask === 8) segments.push([leftPoint(), topPoint()]);
            else if (mask === 5) segments.push([leftPoint(), topPoint()], [bottomPoint(), rightPoint()]);
            else segments.push([leftPoint(), bottomPoint()], [topPoint(), rightPoint()]);
          }
        }
        const segmentMap = new Map();
        for (let i = 0; i < segments.length; i += 1) {
          for (const end of [0, 1]) {
            const segmentKey = key(segments[i][end]);
            let matches = segmentMap.get(segmentKey);
            if (!matches) {
              matches = [];
              segmentMap.set(segmentKey, matches);
            }
            matches.push(i);
          }
        }
        const used = new Uint8Array(segments.length);
        for (let i = 0; i < segments.length; i += 1) {
          if (used[i]) continue;
          used[i] = 1;
          const line = [segments[i][0], segments[i][1]];
          for (let direction = 0; direction < 2; direction += 1) {
            for (;;) {
              const end = direction ? line[0] : line[line.length - 1];
              const candidates = segmentMap.get(key(end));
              let nextIndex = -1;
              if (candidates) {
                for (const candidate of candidates) {
                  if (!used[candidate]) {
                    nextIndex = candidate;
                    break;
                  }
                }
              }
              if (nextIndex < 0) break;
              used[nextIndex] = 1;
              const segment = segments[nextIndex];
              const nextPoint = key(segment[0]) === key(end) ? segment[1] : segment[0];
              if (direction) line.unshift(nextPoint);
              else line.push(nextPoint);
            }
          }
          if (line.length < 5) continue;
          const points = [line[0]];
          for (let pointIndex = 1; pointIndex < line.length; pointIndex += 1) {
            const previous = points[points.length - 1];
            const point = line[pointIndex];
            if (Math.abs(point[0] - previous[0]) + Math.abs(point[1] - previous[1]) > 9) points.push(point);
          }
          if (points.length < 4) continue;
          const count = points.length;
          const flat = new Float32Array(count * 2);
          const cumulative = new Float32Array(count);
          let total = 0;
          let ySum = 0;
          for (let pointIndex = 0; pointIndex < count; pointIndex += 1) {
            flat[pointIndex * 2] = points[pointIndex][0];
            flat[pointIndex * 2 + 1] = points[pointIndex][1];
            if (pointIndex) total += Math.hypot(points[pointIndex][0] - points[pointIndex - 1][0], points[pointIndex][1] - points[pointIndex - 1][1]);
            cumulative[pointIndex] = total;
            ySum += points[pointIndex][1];
          }
          if (total < 40) continue;
          const elevation = (levelIndex + 0.5) / levels;
          const indexLine = levelIndex % 9 === 0;
          const redLine = !indexLine && levelIndex % 11 === 5;
          output.push({
            points: flat,
            cumulative,
            total,
            middleY: ySum / count,
            elevation,
            color: redLine ? 2 : (indexLine ? 1 : 0),
            width: indexLine ? 1.9 : 1.05,
            alpha: (indexLine ? 0.4 : redLine ? 0.26 : 0.3) * (0.6 + 0.55 * elevation),
            reveal: 0
          });
        }
      }
      this.strips.set(stripIndex, output);
      return output;
    }

    colorsNow() {
      const styles = getComputedStyle(document.documentElement);
      const value = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
      this.colors = [
        value("--color-text", "#f4ebe2"),
        value("--color-accent-500", "#f0705a"),
        value("--color-accent-2-400", "#7d1416")
      ];
      return this.colors;
    }

    drawPart(context, line, reveal, offsetX, offsetY, scaleX) {
      const points = line.points;
      const cumulative = line.cumulative;
      const count = points.length / 2;
      const target = reveal >= 1 ? line.total : line.total * reveal;
      context.beginPath();
      context.moveTo(points[0] * scaleX + offsetX, points[1] + offsetY);
      for (let i = 1; i < count; i += 1) {
        if (cumulative[i] <= target) {
          context.lineTo(points[i * 2] * scaleX + offsetX, points[i * 2 + 1] + offsetY);
          continue;
        }
        const previous = cumulative[i - 1];
        const fraction = (target - previous) / ((cumulative[i] - previous) || 1);
        context.lineTo(
          (points[(i - 1) * 2] + (points[i * 2] - points[(i - 1) * 2]) * fraction) * scaleX + offsetX,
          points[(i - 1) * 2 + 1] + (points[i * 2 + 1] - points[(i - 1) * 2 + 1]) * fraction + offsetY
        );
        break;
      }
      context.stroke();
    }

    paint() {
      const canvas = this.canvas;
      const context = this.context;
      if (!canvas || !context) return;
      const density = Math.min(2, devicePixelRatio || 1);
      const width = innerWidth;
      const height = innerHeight;
      if (canvas._width !== width || canvas._height !== height || canvas._density !== density) {
        canvas.width = Math.round(width * density);
        canvas.height = Math.round(height * density);
        canvas._width = width;
        canvas._height = height;
        canvas._density = density;
      }
      context.setTransform(density, 0, 0, density, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";
      const motion = !reduceMotion.matches;
      const time = motion ? performance.now() / 1000 : 0;
      const colors = this.colors || this.colorsNow();
      const scaleX = width / 1600;
      const stripHeight = 1100;
      const worldTop = (scrollY || 0) * 0.62;
      const first = Math.max(0, Math.floor(worldTop / stripHeight) - 1);
      const last = Math.floor((worldTop + height) / stripHeight) + 1;
      for (let stripIndex = first; stripIndex <= last; stripIndex += 1) {
        const lines = this.strip(stripIndex);
        for (const line of lines) {
          const offsetY = -worldTop + Math.sin(time * 0.19 + line.middleY * 0.0025) * 3 * (0.4 + line.elevation);
          const y = line.middleY + offsetY;
          const target = (height + 40 - y - line.elevation * 26) / 470;
          if (target > line.reveal) line.reveal = target > 1 ? 1 : target;
          if (line.reveal <= 0.002 || y < -420 || y > height + 420) continue;
          const offsetX = Math.sin(time * 0.24 + line.middleY * 0.0032) * 4 * (0.5 + line.elevation)
            + Math.sin(time * 0.11 + line.middleY * 0.0011) * 3;
          context.globalAlpha = line.alpha * (0.35 + 0.65 * line.reveal);
          context.strokeStyle = colors[line.color];
          context.lineWidth = line.width;
          this.drawPart(context, line, line.reveal, offsetX, offsetY, scaleX);
        }
      }
      context.globalAlpha = 1;
    }

    animate() {
      this.paint();
      if (!reduceMotion.matches) {
        this.animationFrame = requestAnimationFrame(() => this.animate());
      }
    }

    restart() {
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
      this.animate();
    }
  }

  const canvas = document.querySelector("[data-doodle]");
  if (canvas && canvas.getContext) {
    new ScrollDoodle(canvas);
  }
})();
