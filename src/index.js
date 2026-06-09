gsap.registerPlugin(ScrollTrigger);

const heroImg = document.querySelector("#hero-img");
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const heroHeight = heroImg.offsetHeight;
const heroWeight = heroImg.offsetHeight;

gsap.fromTo(heroImg, 
  { 
    width: heroWeight,
    height: heroHeight,
    x: 0, 
    y: 0 
  }, 
  {
    width: 0.25 * heroWeight + 10, 
    height: 0.25 * heroHeight + 10,
    x: -0.46 * screenWidth,    
    y: 25,
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=250", // end: "center top",
      scrub: true,
      onLeave: () => heroImg.classList.add("in-header"),
      onEnterBack: () => heroImg.classList.remove("in-header")
    },
    ease: "none"
  }
);

heroImg.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

gsap.from(".hero-content > *", {
  opacity: 0,
  y: 40,
  duration: 1.2,
  stagger: 0.2,
  ease: "power2.out"
});

const chapters = gsap.utils.toArray(".chapter");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const timeline = document.querySelector(".timeline");
const currentYearDisplay = document.createElement("div");
currentYearDisplay.className = "timeline-current-year";
timeline.prepend(currentYearDisplay);

let activeYearLabel = "";
let activeChapterIndex = -1;

function getYearParts(rawYear) {
  const match = rawYear.trim().match(/^(\d{3})(\d)(.*)$/);

  if (!match) {
    return null;
  }

  const [, prefix, suffix, rest] = match;
  return { prefix, suffix, rest };
}

function renderYearLabel(rawYear, animate = true) {
  if (rawYear === activeYearLabel) {
    return;
  }

  const nextParts = getYearParts(rawYear);

  if (!nextParts) {
    currentYearDisplay.textContent = rawYear;
    activeYearLabel = rawYear;
    return;
  }

  const currentSuffixSlot = currentYearDisplay.querySelector(".year-suffix-slot");
  const currentSuffix = currentSuffixSlot?.querySelector(".year-suffix");
  const currentPrefix = currentYearDisplay.querySelector(".year-prefix");
  const currentRest = currentYearDisplay.querySelector(".year-rest");

  if (
    animate &&
    currentPrefix &&
    currentSuffix &&
    currentSuffixSlot &&
    currentRest &&
    currentPrefix.textContent === nextParts.prefix &&
    currentRest.textContent === nextParts.rest
  ) {
    const nextSuffix = document.createElement("span");
    nextSuffix.className = "year-suffix";
    nextSuffix.textContent = nextParts.suffix;
    nextSuffix.style.opacity = "0";
    nextSuffix.style.transform = "translateY(8px)";
    currentSuffixSlot.appendChild(nextSuffix);

    gsap.to(currentSuffix, {
      opacity: 0,
      y: -8,
      duration: 0.25,
      ease: "power1.in"
    });

    gsap.to(nextSuffix, {
      opacity: 1,
      y: 0,
      duration: 0.25,
      ease: "power1.out",
      onComplete: () => {
        currentSuffix.remove();
        activeYearLabel = rawYear;
      }
    });

    return;
  }

  currentYearDisplay.innerHTML = `
    <span class="year-prefix">${nextParts.prefix}</span>
    <span class="year-suffix-slot"><span class="year-suffix">${nextParts.suffix}</span></span>
    <span class="year-rest">${nextParts.rest}</span>
  `;
  activeYearLabel = rawYear;
}

function getChapterBody(chapter) {
  return chapter.querySelector(".experience-grid");
}

function getChapterYear(chapter) {
  return chapter.querySelector(".year")?.textContent.trim() || "";
}

function getTimelineScrollLength() {
  const perChapterScroll = Math.max(window.innerHeight * 0.85, 600);
  return chapters.length * perChapterScroll;
}

function syncYearToChapter(index, animate = true) {
  const clampedIndex = Math.max(0, Math.min(chapters.length - 1, index));

  if (clampedIndex === activeChapterIndex) {
    return;
  }

  activeChapterIndex = clampedIndex;
  renderYearLabel(getChapterYear(chapters[clampedIndex]), animate);
}

chapters.forEach(chapter => {
  const sourceYear = chapter.querySelector(".year");

  if (sourceYear) {
    sourceYear.classList.add("timeline-year-source");
  }
});

renderYearLabel(getChapterYear(chapters[0]), false);
activeChapterIndex = 0;

const monthNames = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
];

function buildMonthRail() {
  const rail = document.createElement('aside');
  rail.className = 'timeline-month-rail';

  const title = document.createElement('div');
  title.className = 'timeline-month-rail-title';
  title.textContent = 'Months';
  rail.appendChild(title);

  const list = document.createElement('div');
  list.className = 'timeline-month-list';

  monthNames.forEach((m, idx) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'timeline-month-chip neutral';
    chip.dataset.monthIndex = String(idx);
    chip.textContent = m;
    list.appendChild(chip);
  });

  rail.appendChild(list);
  timeline.appendChild(rail);
}

function parseDurationMonths(durationText, chapterYear) {
  if (!durationText) return new Set();
  const text = durationText.replace(/\s+/, ' ');
  const monthMap = {
    january:0, february:1, march:2, april:3, may:4, june:5,
    july:6, august:7, september:8, october:9, november:10, december:11,
    jan:0, feb:1, mar:2, apr:3, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11
  };

  const years = Array.from(text.matchAll(/(\d{4})/g)).map(m=>parseInt(m[1],10));
  const monthsFound = Array.from(text.matchAll(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)/ig)).map(m=>m[0].toLowerCase());

  const result = new Set();
  if (years.length === 0 && monthsFound.length === 0) return result;

  let startMonth = null, endMonth = null, startYear = null, endYear = null;
  if (monthsFound.length) startMonth = monthMap[monthsFound[0]] ?? null;
  if (monthsFound.length > 1) endMonth = monthMap[monthsFound[1]] ?? null;
  if (years.length) startYear = years[0];
  if (years.length > 1) endYear = years[1];

  const isNow = /\b(now|present|current)\b/i.test(text);
  const now = new Date();

  if (!startYear && startMonth !== null) startYear = chapterYear;
  if (!endYear) endYear = isNow ? now.getFullYear() : startYear || chapterYear;
  if (startMonth === null) startMonth = 0;
  if (endMonth === null) endMonth = isNow && endYear === now.getFullYear() ? now.getMonth() : 11;

  if (startYear > chapterYear || endYear < chapterYear) return result;

  const effectiveStart = startYear < chapterYear ? 0 : startMonth;
  const effectiveEnd = endYear > chapterYear ? 11 : endMonth;

  for (let m = effectiveStart; m <= effectiveEnd; m++) result.add(m);
  return result;
}

function getChapterMonthSet(chapter) {
  const year = parseInt(getChapterYear(chapter).slice(0,4),10) || new Date().getFullYear();
  const durations = Array.from(chapter.querySelectorAll('.duration')).map(d=>d.textContent || '');
  const set = new Set();
  durations.forEach(d => {
    const s = parseDurationMonths(d, year);
    s.forEach(x => set.add(x));
  });
  return { set, year };
}

function syncMonthRailToChapter(index) {
  const clamped = Math.max(0, Math.min(chapters.length - 1, index));
  const railChips = Array.from(document.querySelectorAll('.timeline-month-chip'));
  if (!railChips.length) return;

  const { set: monthSet, year } = getChapterMonthSet(chapters[clamped]);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  railChips.forEach(chip => {
    const idx = parseInt(chip.dataset.monthIndex,10);
    chip.classList.remove('active','ranging','neutral');

    if (year > currentYear) {
      chip.classList.add('neutral');
    } else if (year === currentYear && idx === currentMonth) {
      chip.classList.add('active');
    } else if (monthSet.has(idx)) {
      chip.classList.add('ranging');
    } else {
      chip.classList.add('neutral');
    }
  });
}

buildMonthRail();
syncMonthRailToChapter(0);

if (prefersReducedMotion) {
  chapters.forEach(chapter => {
    const chapterBody = getChapterBody(chapter);
    const chapterYear = getChapterYear(chapter);

    renderYearLabel(chapterYear, false);

    gsap.fromTo(
      chapterBody,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power1.out",
        scrollTrigger: {
          trigger: chapter,
          start: "top 75%",
          toggleActions: "play none none none"
        }
      }
    );
  });
} else {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".timeline",
      start: "top top",
      end: () => `+=${getTimelineScrollLength()}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: self => {
        const nextIndex = Math.min(
          chapters.length - 1,
          Math.floor(self.progress * chapters.length)
        );

        syncYearToChapter(nextIndex);
        syncMonthRailToChapter(nextIndex);
      },
      onRefresh: self => {
        const nextIndex = Math.min(
          chapters.length - 1,
          Math.floor(self.progress * chapters.length)
        );

        syncYearToChapter(nextIndex, false);
        syncMonthRailToChapter(nextIndex);
      },
      onLeaveBack: () => { syncYearToChapter(0, false); syncMonthRailToChapter(0); },
      onLeave: () => { syncYearToChapter(chapters.length - 1, false); syncMonthRailToChapter(chapters.length - 1); }
    }
  });

  chapters.forEach((chapter, i) => {
    const fadeTime = 1;
    const chapterBody = getChapterBody(chapter);

    tl.set(chapter, {
      zIndex: i + 1
    });
    tl.fromTo(chapterBody, {
      opacity: 0,
      y: 20
    }, {
      opacity: 1,
      y: 0,
      duration: fadeTime,
      ease: "power2.out",
      zIndex: chapters.length + 1
    }, "<");

    tl.to(chapterBody, {
      opacity: 0,
      y: -40,
      duration: fadeTime,
      ease: "power2.in"
    }, "+=1");
  });
}

const form = document.querySelector("#contactForm");
const button = document.querySelector("#sendBtn");
const buttonText = document.querySelector(".btn-text");
const statusMsg = document.querySelector("#statusMsg");

function checkForm() {
  button.disabled = !(
    form.name.value.trim() &&
    form.email.value.trim() &&
    form.message.value.trim()
  );
}

form.name.addEventListener("input", checkForm);
form.email.addEventListener("input", checkForm);
form.message.addEventListener("input", checkForm);

checkForm();

try {
  const url = "/api/contact";
}
catch {
  button.disabled = true;
  form.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      node.disabled = true;
    }
  });
  statusMsg.textContent = "⚠️ Contact form is not configured.";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (form.website.value) {
    statusMsg.textContent = "❌ Bot detected. Submission blocked.";
    return;
  }
  const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value
  };

  button.classList.add("loading");
  button.disabled = true;
  buttonText.textContent = "";
  statusMsg.textContent = "";

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (result.success) {
      statusMsg.textContent = "✅ Message sent successfully!";
      form.reset();
    } else {
      statusMsg.textContent = "❌ Failed to send message.";
    }
  } catch {
    statusMsg.textContent = "⚠️ Network error. Try again later.";
  } finally {
    button.classList.remove("loading");
    button.disabled = false;
    buttonText.textContent = "Send Message";
    form.name.value = '';
    form.email.value = '';
    form.message.value = '';
  }
});

const toggleBtn = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(mode) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(mode);
  toggleBtn.textContent = mode !== 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', mode);
}

  setTheme(prefersDark.matches ? 'dark' : 'light');

toggleBtn.addEventListener('click', () => {
  const current = document.body.classList.contains('dark') ? 'dark' : 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
});

prefersDark.addEventListener('change', e => {
    setTheme(e.matches ? 'dark' : 'light');
});

gsap.from(".navbar", { y: -50, opacity: 0, duration: 1, ease: "power3.out" });
gsap.from(".hero-content h1", { x: -100, opacity: 0, duration: 1 });
gsap.from(".btn", { scale: 0, duration: 0.8, delay: 0.6, clearProps: "transform" });

gsap.utils.toArray(".section").forEach(section => {
  gsap.from(section, {
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 80,
    duration: 1,
    ease: "power2.out"
  });
});

const navbar = document.querySelector(".navbar");
const links = document.querySelectorAll(".navbar a");

const highlight = document.createElement("span");
highlight.classList.add("liquid-highlight");
navbar.appendChild(highlight);

function moveHighlight(target) {
  const targetRect = target.getBoundingClientRect();
  const navbarRect = navbar.getBoundingClientRect();

  highlight.style.width = `${targetRect.width}px`;
  highlight.style.left = `${targetRect.left - navbarRect.left}px`;

  highlight.style.animation = "none";
  highlight.offsetHeight;
  highlight.style.animation = "liquidExpand 0.5s ease-in-out forwards";
}

function scrollToSection(hash) {
  const target = document.querySelector(hash);
  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    links.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    moveHighlight(link);

    const hash = link.getAttribute("href");
    scrollToSection(hash);

    history.pushState(null, "", hash);
  });
});

window.addEventListener("load", () => {
  const currentHash = window.location.hash || links[0].getAttribute("href");
  const activeLink = Array.from(links).find(
    link => link.getAttribute("href") === currentHash
  );
  if (activeLink) {
    links.forEach(l => l.classList.remove("active"));
    activeLink.classList.add("active");
    moveHighlight(activeLink);
  }
});

const sections = Array.from(links)
  .map(link => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

window.addEventListener("scroll", () => {
  let currentSection = sections[0];

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.35 && rect.bottom > 120) {
      currentSection = section;
      break;
    }
  }

  const hash = `#${currentSection.id}`;
  const activeLink = Array.from(links).find(
    link => link.getAttribute("href") === hash
  );

  if (!activeLink || activeLink.classList.contains("active")) return;

  links.forEach(l => l.classList.remove("active"));
  activeLink.classList.add("active");
  moveHighlight(activeLink);

  history.replaceState(null, "", hash);
});
