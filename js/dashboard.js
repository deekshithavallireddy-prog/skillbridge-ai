// ============================================
// SKILLBRIDGE AI — Dashboard JS
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    // ===========================
    // 1. GREETING BY TIME
    // ===========================
    const hour = new Date().getHours();
    const greetEl = document.getElementById("greeting-text");
    if (greetEl) {
        let g = "Good Morning";
        if (hour >= 12 && hour < 17) g = "Good Afternoon";
        else if (hour >= 17) g = "Good Evening";
        greetEl.textContent = g + ", Deeksha! 👋";
    }

    // ===========================
    // 2. ANIMATE STAT COUNTERS
    // ===========================
    const counters = document.querySelectorAll(".dash-count");

    const cObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute("data-target"));
                countUp(entry.target, target);
                cObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { cObserver.observe(c); });

    function countUp(el, target) {
        let n = 0;
        const step = Math.max(1, target / 50);
        const timer = setInterval(function () {
            n += step;
            if (n >= target) {
                n = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(n);
        }, 30);
    }

    // ===========================
    // 3. ANIMATE SKILL BARS
    // ===========================
    const fills = document.querySelectorAll(".dskill-fill");

    const sObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const el = entry.target;
                const w = el.style.width;
                el.style.width = "0%";
                setTimeout(function () {
                    el.style.width = w;
                }, 200);
                sObserver.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    fills.forEach(function (f) { sObserver.observe(f); });

    // ===========================
    // 4. PROGRESS RING
    // ===========================
    const ringFill = document.querySelector(".ring-fill");
    if (ringFill) {
        // 75% readiness = dashoffset = 326.7 * (1 - 0.75) = 81.675
        const rObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    setTimeout(function () {
                        ringFill.style.strokeDashoffset = "81.7";
                    }, 300);
                    rObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        rObserver.observe(ringFill);
    }

    // ===========================
    // 5. SCROLL ANIMATIONS
    // ===========================
    const animEls = document.querySelectorAll(".animate-fade-up");
    const aObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.1 });

    animEls.forEach(function (el) { aObserver.observe(el); });

    // Trigger immediately visible ones
    setTimeout(function () {
        animEls.forEach(function (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add("visible");
            }
        });
    }, 100);

    console.log("✅ Dashboard ready!");
});
