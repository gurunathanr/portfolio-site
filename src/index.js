gsap.registerPlugin(ScrollTrigger);

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

// subtle background color shift through scroll
gsap.to("body", {
  backgroundColor: "#050505",
  scrollTrigger: {
    trigger: ".timeline",
    start: "top top",
    end: "bottom bottom",
    scrub: true
  }
});
