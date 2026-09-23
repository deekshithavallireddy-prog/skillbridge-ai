// ============================================
// SKILLBRIDGE AI — Main JavaScript
// ============================================

console.log("🚀 SkillBridge AI loaded!");

document.addEventListener("DOMContentLoaded", function () {

    // ===========================
    // 1. NAVBAR SCROLL EFFECT
    // ===========================
    const navbar = document.getElementById("navbar");
    if (navbar) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        });
    }

    // ===========================
    // 2. SCROLL ANIMATIONS
    // ===========================
    const animElements = document.querySelectorAll(
        ".animate-fade-up, .animate-fade-left"
    );

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    animElements.forEach(function (el) {
        observer.observe(el);
    });

    // ===========================
    // 3. COUNTER ANIMATION
    // ===========================
    const counters = document.querySelectorAll(".count");

    const counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute("data-target"));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
        counterObserver.observe(counter);
    });

    function animateCounter(el, target) {
        let current = 0;
        const step = target / 60;
        const timer = setInterval(function () {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current).toLocaleString() + (target >= 100 ? "+" : "");
        }, 25);
    }

    // ===========================
    // 4. SKILL BAR ANIMATION
    // ===========================
    const skillFills = document.querySelectorAll(".hskill-fill");

    skillFills.forEach(function (fill) {
        const targetWidth = fill.style.width;
        fill.style.width = "0%";
        setTimeout(function () {
            fill.style.width = targetWidth;
        }, 500);
    });

    // ===========================
    // 5. SMOOTH SCROLL
    // ===========================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                const navHeight = 72;
                const top = target.offsetTop - navHeight;
                window.scrollTo({ top: top, behavior: "smooth" });
            }
        });
    });

    // ===========================
    // 6. HERO CARD FLOAT
    // ===========================
    const heroCard = document.querySelector(".hero-card");
    if (heroCard) {
        heroCard.classList.add("float-anim");
    }

    // ===========================
    // 7. ACTIVE NAV ON SCROLL
    // ===========================
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", function () {
        let current = "";
        sections.forEach(function (section) {
            if (window.scrollY >= section.offsetTop - 100) {
                current = section.getAttribute("id");
            }
        });
        navLinks.forEach(function (link) {
            link.classList.remove("active-link");
            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active-link");
            }
        });
    });

    console.log("✅ All animations initialized!");
});
