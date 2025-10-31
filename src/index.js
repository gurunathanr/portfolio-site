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

// Intro hero animation
gsap.from(".hero-content > *", {
  opacity: 0,
  y: 40,
  duration: 1.2,
  stagger: 0.2,
  ease: "power2.out"
});

// Cinematic chapter reveal sequence
const chapters = gsap.utils.toArray(".chapter");

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".timeline",
    start: "top top",
    end: "+=6000", // adjust for scroll length
    scrub: true,
    pin: true,
    anticipatePin: 1
  }
});

// fade in/out each chapter
chapters.forEach((chapter, i) => {
  const fadeTime = 1;
  tl.to(chapter, {
    opacity: 1,
    y: 0,
    duration: fadeTime,
    ease: "power2.out"
  })
    .to(chapter, {
      opacity: 0,
      y: -40,
      duration: fadeTime,
      ease: "power2.in"
    }, "+=1"); // pause before fading out
});

// // subtle background color shift through scroll
// gsap.to("body", {
//   backgroundColor: "#050505",
//   scrollTrigger: {
//     trigger: ".timeline",
//     start: "top top",
//     end: "bottom bottom",
//     scrub: true
//   }
// });

// // document.querySelector("#contactForm").addEventListener("submit", async (e) => {
// //   e.preventDefault();
// //   const form = e.target;
// //   const data = {
// //     name: form.name.value,
// //     email: form.email.value,
// //     message: form.message.value
// //   };

// //   const statusMsg = document.querySelector("#statusMsg");
// //   statusMsg.textContent = "Sending...";

// //   try {
// //     const res = await fetch("https://your-api-url.com/api/send", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify(data)
// //     });

// //     const result = await res.json();
// //     if (result.success) {
// //       statusMsg.textContent = "✅ Message sent successfully!";
// //       form.reset();
// //     } else {
// //       statusMsg.textContent = "❌ Failed to send message.";
// //     }
// //   } catch (err) {
// //     statusMsg.textContent = "⚠️ Network error. Try again later.";
// //   }
// // });

const form = document.querySelector("#contactForm");
const button = document.querySelector("#sendBtn");
const statusMsg = document.querySelector("#statusMsg");

try {
  const url = CONFIG.url;
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
  const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value
  };

  // Start loader
  button.classList.add("loading");
  button.disabled = true;
  statusMsg.textContent = "";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.API_KEY}`
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
    // Stop loader
    button.classList.remove("loading");
    button.disabled = false;
  }
});

// ========== THEME HANDLER ==========
const toggleBtn = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const storedTheme = localStorage.getItem('theme');

function setTheme(mode) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(mode);
  toggleBtn.textContent = mode === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', mode);
}

// Load theme (stored or system)
if (storedTheme) {
  setTheme(storedTheme);
} else {
  setTheme(prefersDark.matches ? 'dark' : 'light');
}

toggleBtn.addEventListener('click', () => {
  const current = document.body.classList.contains('dark') ? 'dark' : 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
});

prefersDark.addEventListener('change', e => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});

// ========== GSAP ANIMATIONS ==========
gsap.from(".navbar", { y: -50, opacity: 0, duration: 1, ease: "power3.out" });
gsap.from(".hero-content h1", { x: -100, opacity: 0, duration: 1 });
// gsap.from(".hero-content h2", { x: 100, opacity: 0, duration: 1, delay: 0.3 });
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

// Create the liquid highlight
const highlight = document.createElement("span");
highlight.classList.add("liquid-highlight");
navbar.appendChild(highlight);

function moveHighlight(target) {
  const targetRect = target.getBoundingClientRect();
  const navbarRect = navbar.getBoundingClientRect();

  highlight.style.width = `${targetRect.width}px`;
  highlight.style.left = `${targetRect.left - navbarRect.left}px`;

  // Animate liquid expansion
  highlight.style.animation = "none";
  highlight.offsetHeight; // force reflow
  highlight.style.animation = "liquidExpand 0.5s ease-in-out forwards";
}

// Smooth scroll function
function scrollToSection(hash) {
  const target = document.querySelector(hash);
  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

// --- Handle clicks ---
links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    // Remove active from all
    links.forEach(l => l.classList.remove("active"));
    // Set clicked as active
    link.classList.add("active");

    // Move highlight
    moveHighlight(link);

    // Smooth scroll to section
    const hash = link.getAttribute("href");
    scrollToSection(hash);

    // Update URL hash without reloading
    history.pushState(null, "", hash);
  });
});

// --- On load: set active based on URL hash ---
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

// --- On scroll: update active based on visible section ---
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

  // Update active state
  links.forEach(l => l.classList.remove("active"));
  activeLink.classList.add("active");
  moveHighlight(activeLink);

  // Update URL without reloading
  history.replaceState(null, "", hash);
});
