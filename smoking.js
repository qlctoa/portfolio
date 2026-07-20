const chartLightbox = document.querySelector(".chart-lightbox");

if (chartLightbox) {
    const charts = [
        {
            src: "smoking01.png",
            alt: "상관관계 히트맵",
            title: "🔥 변수 간 상관관계"
        },
        {
            src: "smoking02.png",
            alt: "흡연 여부에 따른 변수 분포 비교",
            title: "📊 변수 분포 비교"
        },
        {
            src: "smoking03.png",
            alt: "효과 크기 분석",
            title: "📈 효과 크기 분석"
        }
    ];

    const lightboxImage = chartLightbox.querySelector(".lightbox-image");
    const lightboxTitle = chartLightbox.querySelector(".lightbox-title");
    const closeButton = chartLightbox.querySelector(".lightbox-close");
    let currentIndex = 0;
    let pointerStart = null;
    let lastTrigger = null;

    const showChart = (index) => {
        currentIndex = (index + charts.length) % charts.length;
        const chart = charts[currentIndex];

        lightboxImage.src = chart.src;
        lightboxImage.alt = chart.alt;
        lightboxTitle.textContent = `${chart.title} · ${currentIndex + 1} / ${charts.length}`;
    };

    const openLightbox = (index, trigger) => {
        lastTrigger = trigger;
        showChart(index);
        chartLightbox.classList.add("is-open");
        chartLightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
        closeButton.focus();
    };

    const closeLightbox = () => {
        chartLightbox.classList.remove("is-open");
        chartLightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
        if (lastTrigger) lastTrigger.focus();
    };

    document.querySelectorAll(".lightbox-trigger").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            openLightbox(Number(trigger.dataset.index), trigger);
        });
    });

    chartLightbox.querySelector(".lightbox-prev").addEventListener("click", () => {
        showChart(currentIndex - 1);
    });

    chartLightbox.querySelector(".lightbox-next").addEventListener("click", () => {
        showChart(currentIndex + 1);
    });

    closeButton.addEventListener("click", closeLightbox);

    chartLightbox.addEventListener("click", (event) => {
        if (event.target === chartLightbox) closeLightbox();
    });

    chartLightbox.addEventListener("pointerdown", (event) => {
        pointerStart = event.clientX;
    });

    chartLightbox.addEventListener("pointerup", (event) => {
        if (pointerStart === null) return;
        const distance = event.clientX - pointerStart;

        if (Math.abs(distance) > 55) {
            showChart(currentIndex + (distance < 0 ? 1 : -1));
        }

        pointerStart = null;
    });

    document.addEventListener("keydown", (event) => {
        if (!chartLightbox.classList.contains("is-open")) return;
        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") showChart(currentIndex - 1);
        if (event.key === "ArrowRight") showChart(currentIndex + 1);
    });
}
