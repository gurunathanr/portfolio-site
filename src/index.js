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

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".timeline",
    start: "top top",
    end: "+=6000",
    scrub: true,
    pin: true,
    anticipatePin: 1
  }
});

chapters.forEach((chapter, i) => {
  const fadeTime = 1;
  
  tl.set(chapter, {
    zIndex: i
  });
  tl.to(chapter, {
    opacity: 1,
    y: 0,
    duration: fadeTime,
    ease: "power2.out",
    zIndex: chapters.length + 1
  })
    .to(chapter, {
      opacity: 0,
      y: -40,
      duration: fadeTime,
      ease: "power2.in"
    }, "+=1");
});

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
