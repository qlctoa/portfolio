const copyEmailButton = document.querySelector(".copy-email");

if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async () => {
        const email = copyEmailButton.dataset.email;
        const originalText = copyEmailButton.textContent;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(email);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = email;
                textArea.style.position = "fixed";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                textArea.remove();
            }
            copyEmailButton.textContent = "복사되었습니다!";
        } catch {
            window.prompt("이메일 주소를 복사해 주세요.", email);
        }

        window.setTimeout(() => {
            copyEmailButton.textContent = originalText;
        }, 1800);
    });
}

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
        menuToggle.textContent = isOpen ? "×" : "☰";
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "메뉴 열기");
            menuToggle.textContent = "☰";
        });
    });
}

const sections = document.querySelectorAll("section[id]");

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            navLinks.forEach((link) => {
                link.classList.toggle(
                    "is-active",
                    link.getAttribute("href") === `#${entry.target.id}`
                );
            });
        });
    }, {
        rootMargin: "-35% 0px -55% 0px"
    });

    sections.forEach((section) => sectionObserver.observe(section));
}

const revealElements = document.querySelectorAll(
    ".section-title, .about-text, .about-card, .project-card, .skill-card, .contact-content"
);

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12
    });

    revealElements.forEach((element, index) => {
        element.classList.add("reveal");
        element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
}

const backToTopButton = document.querySelector(".back-to-top");
const navbar = document.querySelector(".navbar");

const updateNavbar = () => {
    if (!navbar) return;
    navbar.classList.toggle("is-scrolled", window.scrollY > 40);
};

window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();

if (backToTopButton) {
    const updateBackToTop = () => {
        backToTopButton.classList.toggle("is-visible", window.scrollY > 500);
    };

    window.addEventListener("scroll", updateBackToTop, { passive: true });
    updateBackToTop();

    backToTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
