(() => {
  "use strict";

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const menuButton = document.querySelector("[data-menu-open]");
  const menu = document.querySelector("[data-menu]");
  let returnFocus = null;

  const menuFocusable = () => menu
    ? [...menu.querySelectorAll("a[href], button:not([disabled])")].filter((element) => !element.hidden)
    : [];

  const closeMenu = () => {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
    returnFocus?.focus();
  };

  const openMenu = () => {
    if (!menu || !menu.hidden) return;
    returnFocus = document.activeElement;
    menu.hidden = false;
    document.body.classList.add("menu-open");
    menuButton?.setAttribute("aria-expanded", "true");
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

  const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  const typeHero = async () => {
    const lines = [...document.querySelectorAll("[data-hero-line]")];
    if (!lines.length || reduceMotion.matches) return;
    const speed = () => 25 + Math.round(Math.random() * 10);
    for (const line of lines) line.textContent = "";
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const text = line.dataset.heroLine || "";
      const accent = line.dataset.heroAccent;
      if (!accent) {
        for (const character of text) {
          line.append(character);
          await wait(speed());
        }
      } else {
        const accentIndex = text.indexOf(accent);
        const before = text.slice(0, accentIndex);
        for (const character of before) {
          line.append(character);
          await wait(speed());
        }
        const accentElement = document.createElement("em");
        line.append(accentElement);
        for (const character of "SleekDee") {
          accentElement.append(character);
          await wait(44);
        }
        await wait(620);
        while (accentElement.textContent) {
          accentElement.textContent = accentElement.textContent.slice(0, -1);
          await wait(24);
        }
        for (const character of accent) {
          accentElement.append(character);
          await wait(speed());
        }
      }
      await wait(120);
    }
  };
  typeHero();

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = entry.target.dataset.delay || "0";
        entry.target.style.setProperty("--reveal-delay", `${delay}ms`);
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const words = [...document.querySelectorAll("[data-words]")];
  if (!reduceMotion.matches) {
    words.forEach((element) => {
      const fragment = document.createDocumentFragment();
      element.textContent.trim().split(/\s+/).forEach((word, index) => {
        const span = document.createElement("span");
        span.textContent = `${word}${index === element.textContent.length - 1 ? "" : " "}`;
        fragment.append(span);
      });
      element.textContent = "";
      element.append(fragment);
    });
  }

  const videos = [...document.querySelectorAll("[data-autoplay-video]")];
  if ("IntersectionObserver" in window && !reduceMotion.matches && !navigator.connection?.saveData) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, { rootMargin: "200px 0px" });
    videos.forEach((video) => videoObserver.observe(video));
  }

  let syncReelVisibility = () => {};
  const reelStage = document.querySelector("[data-reelstage]");
  if (reelStage) {
    const reelCards = [...reelStage.querySelectorAll("[data-reel]")];
    const reelDots = [...document.querySelectorAll("[data-reeldot]")];
    const previousButton = document.querySelector("[data-reelprev]");
    const nextButton = document.querySelector("[data-reelnext]");
    let reelIndex = 0;
    let reelVisible = false;
    let reelHovered = false;
    let reelDragging = false;
    let dragStart = 0;
    let dragDelta = 0;
    let lastAdvance = performance.now();
    let soundWanted = true;
    const previousOffsets = new WeakMap();
    const limit = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const mutedPath = "M11 5 6.5 9H3.5v6h3L11 19zM16.4 9.6 21 14.4M21 9.6l-4.6 4.8";
    const audiblePath = "M11 5 6.5 9H3.5v6h3L11 19zM15 9.2a4 4 0 0 1 0 5.6M17.8 6.6a7.6 7.6 0 0 1 0 10.8";

    const reelOffset = (index) => {
      const count = reelCards.length;
      let offset = index - reelIndex;
      if (offset > count / 2) offset -= count;
      if (offset < -count / 2) offset += count;
      return offset;
    };

    const syncSoundButton = (card, muted) => {
      const button = card.querySelector("[data-reelsnd]");
      const icon = button?.querySelector("[data-sound-icon]");
      if (!button || !icon) return;
      button.setAttribute("aria-label", muted ? `Play ${card.getAttribute("aria-label")} with sound` : `Mute ${card.getAttribute("aria-label")}`);
      button.setAttribute("aria-pressed", muted ? "false" : "true");
      icon.setAttribute("d", muted ? mutedPath : audiblePath);
    };

    const updateReelVideos = () => {
      reelCards.forEach((card, index) => {
        const video = card.querySelector("video");
        const sound = card.querySelector("[data-reelsnd]");
        const active = index === reelIndex;
        const near = Math.abs(reelOffset(index)) <= 1;
        const shouldPlay = near && reelVisible && !reduceMotion.matches && !navigator.connection?.saveData;
        const shouldSound = active && reelVisible && soundWanted;
        video.defaultMuted = !shouldSound;
        video.muted = !shouldSound;
        video.volume = 1;
        if (shouldSound) video.removeAttribute("muted");
        else video.setAttribute("muted", "");
        if (shouldPlay) {
          video.play().catch(() => {
            video.defaultMuted = true;
            video.muted = true;
            video.setAttribute("muted", "");
            syncSoundButton(card, true);
            video.play().catch(() => {});
          });
        } else {
          video.pause();
          video.muted = true;
        }
        if (sound) sound.tabIndex = active ? 0 : -1;
        syncSoundButton(card, video.muted);
      });
    };

    const setReelVisibility = (visibleNow) => {
      if (visibleNow === reelVisible) return;
      if (visibleNow) lastAdvance = performance.now();
      reelVisible = visibleNow;
      updateReelVideos();
    };

    syncReelVisibility = () => {
      const rect = reelStage.getBoundingClientRect();
      const visibleHeight = Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
      const visibleNow = rect.height > 0 && visibleHeight / rect.height >= .18;
      setReelVisibility(visibleNow);
    };

    const layoutReels = () => {
      const cardWidth = reelCards[0]?.getBoundingClientRect().width || 260;
      const step = cardWidth * .94;
      reelCards.forEach((card, index) => {
        const offset = reelOffset(index);
        const distance = Math.abs(offset);
        const x = -offset * step + (reelDragging ? dragDelta : 0);
        const previousOffset = previousOffsets.get(card);
        const wrapped = !reelDragging && previousOffset !== undefined && Math.abs(offset - previousOffset) > 1.5;
        if (wrapped) card.style.transition = "none";
        card.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${distance * 13}px) scale(${distance ? Math.max(.74, 1 - distance * .11) : 1}) rotate(${offset * 2.4}deg)`;
        card.style.zIndex = String(50 - distance * 6);
        card.style.opacity = distance > 1.5 ? "0" : "1";
        card.style.filter = distance ? `brightness(${1 - .22 * distance}) saturate(${1 - .12 * distance})` : "none";
        card.style.pointerEvents = distance > 1.5 ? "none" : "auto";
        card.setAttribute("aria-hidden", distance > 1.5 ? "true" : "false");
        card.toggleAttribute("data-active", index === reelIndex);
        previousOffsets.set(card, offset);
        if (wrapped) requestAnimationFrame(() => card.style.removeProperty("transition"));
      });
      reelDots.forEach((dot, index) => {
        if (index === reelIndex) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      updateReelVideos();
    };

    const selectReel = (index) => {
      reelIndex = (index + reelCards.length) % reelCards.length;
      lastAdvance = performance.now();
      layoutReels();
    };

    reelCards.forEach((card, index) => {
      card.addEventListener("click", (event) => {
        if (Math.abs(dragDelta) > 14 || event.target.closest("[data-reelsnd]")) return;
        if (index !== reelIndex) selectReel(index);
      });
      const sound = card.querySelector("[data-reelsnd]");
      sound?.addEventListener("click", (event) => {
        event.stopPropagation();
        if (index !== reelIndex) selectReel(index);
        const video = card.querySelector("video");
        soundWanted = !(!video.muted && reelVisible);
        updateReelVideos();
      });
    });
    previousButton?.addEventListener("click", () => selectReel(reelIndex - 1));
    nextButton?.addEventListener("click", () => selectReel(reelIndex + 1));
    reelDots.forEach((dot, index) => dot.addEventListener("click", () => selectReel(index)));
    reelStage.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        selectReel(reelIndex + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
    reelStage.addEventListener("pointerdown", (event) => {
      if (event.target instanceof Element && event.target.closest("button")) return;
      reelDragging = true;
      dragStart = event.clientX;
      dragDelta = 0;
      reelStage.classList.add("is-dragging");
      reelStage.setPointerCapture(event.pointerId);
      reelCards.forEach((card) => { card.style.transition = "none"; });
    });
    reelStage.addEventListener("pointermove", (event) => {
      if (!reelDragging) return;
      dragDelta = limit(event.clientX - dragStart, -280, 280);
      layoutReels();
    });
    const finishDrag = () => {
      if (!reelDragging) return;
      reelDragging = false;
      reelStage.classList.remove("is-dragging");
      reelCards.forEach((card) => { card.style.removeProperty("transition"); });
      const direction = dragDelta > 46 ? 1 : dragDelta < -46 ? -1 : 0;
      dragDelta = 0;
      selectReel(reelIndex + direction);
    };
    reelStage.addEventListener("pointerup", finishDrag);
    reelStage.addEventListener("pointercancel", finishDrag);
    reelStage.addEventListener("mouseenter", () => { reelHovered = true; });
    reelStage.addEventListener("mouseleave", () => { reelHovered = false; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        setReelVisibility(entry.isIntersecting && entry.intersectionRatio >= .18);
      }, { threshold: [.18, .45] }).observe(reelStage);
    }
    setInterval(() => {
      if (!reelVisible || reelHovered || reelDragging || reduceMotion.matches) return;
      if (performance.now() - lastAdvance >= 4600) selectReel(reelIndex + 1);
    }, 180);
    const updateProgress = () => {
      reelCards.forEach((card) => {
        const video = card.querySelector("video");
        const bar = card.querySelector("[data-reelbar]");
        bar.style.width = video.duration ? `${limit(video.currentTime / video.duration, 0, 1) * 100}%` : "0%";
      });
      requestAnimationFrame(updateProgress);
    };
    reduceMotion.addEventListener?.("change", updateReelVideos);
    const unlockAudio = (event) => {
      if (event.target instanceof Element && event.target.closest("[data-reelsnd]")) return;
      if (reelVisible && soundWanted) updateReelVideos();
    };
    addEventListener("pointerdown", unlockAudio, { capture: true, passive: true });
    addEventListener("keydown", unlockAudio, { capture: true });
    addEventListener("resize", layoutReels, { passive: true });
    layoutReels();
    syncReelVisibility();
    updateProgress();
  }

  const blurLines = [...document.querySelectorAll("[data-blurline]")];
  const stacks = [...document.querySelectorAll("[data-stack]")];
  const brightItems = [...document.querySelectorAll("[data-bright]")];
  const services = [...document.querySelectorAll("[data-svc]")];
  const rails = [...document.querySelectorAll("[data-rail]")];
  let frame = 0;

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const smoothstep = (value) => value * value * (3 - 2 * value);

  const tick = () => {
    frame = 0;
    const viewport = innerHeight || 1;
    const disableDeck = reduceMotion.matches || innerWidth <= 640;

    blurLines.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const p = smoothstep(clamp((150 + index * 34 - rect.top) / 180, 0, 1));
      element.style.filter = `blur(${(p * 2.2).toFixed(2)}px)`;
      element.style.opacity = String(1 - p * .34);
    });

    stacks.forEach((card, index) => {
      if (disableDeck || index === stacks.length - 1) {
        card.style.removeProperty("transform");
        card.style.removeProperty("filter");
        return;
      }
      const current = card.getBoundingClientRect();
      const next = stacks[index + 1].getBoundingClientRect();
      const start = current.top + current.height * .62;
      const end = current.top + 10;
      const progress = clamp((start - next.top) / Math.max(1, start - end), 0, 1);
      card.style.transform = `scale(${(1 - .038 * progress).toFixed(4)}) translateY(${(-5 * progress).toFixed(2)}px)`;
      card.style.filter = `brightness(${(1 - .32 * progress).toFixed(3)})`;
    });

    brightItems.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const lit = rect.top < viewport * .62 && rect.bottom > viewport * .12;
      element.style.setProperty("--nm", lit ? "var(--color-text)" : "var(--color-neutral-500)");
    });

    services.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const progress = clamp((viewport * .86 - rect.top) / (viewport * .3), 0, 1);
      element.style.clipPath = `inset(0 ${(1 - progress) * 100}% 0 0)`;
    });

    rails.forEach((rail) => {
      const parent = rail.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const progress = clamp((viewport * .78 - rect.top) / Math.max(1, rect.height), 0, 1);
      rail.style.transform = `scaleY(${progress.toFixed(3)})`;
    });

    words.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const progress = clamp((viewport * .84 - rect.top) / Math.max(1, rect.height + viewport * .3), 0, 1);
      const spans = [...element.querySelectorAll("span")];
      const softHead = progress * (spans.length + Math.max(2.5, spans.length * .28));
      spans.forEach((span, index) => {
        span.style.opacity = String(clamp((softHead - index) / 3, .2, 1));
      });
    });
    syncReelVisibility();
  };

  const queueTick = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  addEventListener("scroll", queueTick, { passive: true });
  addEventListener("resize", queueTick, { passive: true });
  reduceMotion.addEventListener?.("change", queueTick);
  setInterval(queueTick, 500);
  queueTick();
})();
