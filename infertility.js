const serviceSlider = document.querySelector(".service-slider");

if (serviceSlider) {
    const slides = [
        {
            src: "../images/infertility_img/1.png",
            alt: "메인 화면",
            title: "🏠 메인 화면",
            description: "서비스의 목적과 주요 기능을 한눈에 이해할 수 있도록 구성했습니다."
        },
        {
            src: "../images/infertility_img/2.png",
            alt: "데이터 입력 화면",
            title: "📝 데이터 입력 화면",
            description: "환자와 시술 정보를 입력하여 예측에 활용할 수 있도록 설계했습니다."
        },
        {
            src: "../images/infertility_img/3.png",
            alt: "예측 결과 화면",
            title: "📈 예측 결과 화면",
            description: "임신 성공 가능성과 케어 단계를 직관적으로 확인할 수 있도록 기획했습니다."
        }
    ];

    const image = serviceSlider.querySelector(".slider-image");
    const title = serviceSlider.querySelector(".slider-title");
    const description = serviceSlider.querySelector(".slider-description");
    const count = serviceSlider.querySelector(".slider-count");
    const dots = serviceSlider.querySelectorAll(".slider-dot");
    const phoneSlider = serviceSlider.querySelector(".phone-slider");
    let currentIndex = 0;
    let pointerStart = null;

    const showSlide = (index) => {
        currentIndex = (index + slides.length) % slides.length;
        const slide = slides[currentIndex];

        image.src = slide.src;
        image.alt = slide.alt;
        title.textContent = slide.title;
        description.textContent = slide.description;
        count.textContent = `${currentIndex + 1} / ${slides.length}`;

        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === currentIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-pressed", String(isActive));
        });
    };

    serviceSlider.querySelector(".prev-btn").addEventListener("click", () => {
        showSlide(currentIndex - 1);
    });

    serviceSlider.querySelector(".next-btn").addEventListener("click", () => {
        showSlide(currentIndex + 1);
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => showSlide(Number(dot.dataset.index)));
    });

    phoneSlider.addEventListener("pointerdown", (event) => {
        pointerStart = event.clientX;
        phoneSlider.setPointerCapture(event.pointerId);
    });

    phoneSlider.addEventListener("pointerup", (event) => {
        if (pointerStart === null) return;
        const distance = event.clientX - pointerStart;

        if (Math.abs(distance) > 45) {
            showSlide(currentIndex + (distance < 0 ? 1 : -1));
        }

        pointerStart = null;
    });

    serviceSlider.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") showSlide(currentIndex - 1);
        if (event.key === "ArrowRight") showSlide(currentIndex + 1);
    });
}
