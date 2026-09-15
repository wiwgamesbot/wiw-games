const tg = window.Telegram?.WebApp;


/* ================= TELEGRAM ================= */

if (tg) {

    tg.ready();

    tg.expand();

    tg.setHeaderColor("#020604");

    tg.setBackgroundColor("#020604");

}



/* ================= STATE ================= */

let balance = 1000;

let taps = 0;

let currentPage = "homePage";



/* ================= HELPERS ================= */

function $(id) {
    return document.getElementById(id);
}



/* ================= USER ================= */

function setupUser() {

    const user =
        tg?.initDataUnsafe?.user;


    if (!user) {

        $("profileName").textContent =
            "Игрок";

        $("profileId").textContent =
            "ID: —";

        $("profileAvatar").textContent =
            "W";

        return;
    }


    const firstName =
        user.first_name || "Игрок";

    const lastName =
        user.last_name || "";


    $("profileName").textContent =
        `${firstName} ${lastName}`.trim();


    $("profileId").textContent =
        `ID: ${user.id}`;


    $("profileAvatar").textContent =
        firstName.charAt(0).toUpperCase();

}



/* ================= BALANCE ================= */

function updateBalance() {

    const balanceText =
        balance.toLocaleString("ru-RU");


    $("balance").textContent =
        balanceText;


    $("profileBalance").textContent =
        balanceText;


    $("tapPageBalance").textContent =
        balanceText;


    $("tapCount").textContent =
        taps.toLocaleString("ru-RU");

}



/* ================= NAVIGATION ================= */

function openPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const page =
        $(pageId);


    if (!page) {
        return;
    }


    page.classList.add("active");


    currentPage =
        pageId;


    updateNavigation(pageId);


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    haptic("light");

}



/* ================= GAME OPEN ================= */

function openGame(pageId) {

    openPage(pageId);

}



/* ================= HOME ================= */

function goHome() {

    openPage("homePage");

}



/* ================= NAV ACTIVE ================= */

function updateNavigation(pageId) {

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(item => {

        item.classList.remove("active");


        if (
            item.dataset.page === pageId
        ) {

            item.classList.add("active");

        }

    });


    /*
        Если открыт сам экран игры,
        подсвечиваем "Игры".
    */

    if (
        pageId === "rocketPage" ||
        pageId === "minesPage" ||
        pageId === "plinkoPage"
    ) {

        const home =
            document.querySelector(
                '[data-page="homePage"]'
            );

        if (home) {
            home.classList.add("active");
        }

    }

}



/* ================= TAP ================= */

function tap() {

    balance += 100;

    taps += 1;


    updateBalance();


    haptic("medium");


    createTapEffect();

}



/* ================= TAP EFFECT ================= */

function createTapEffect() {

    const button =
        document.querySelector(
            ".big-tap"
        );


    if (!button) {
        return;
    }


    const plus =
        document.createElement("div");


    plus.textContent =
        "+100";


    plus.style.position =
        "absolute";


    plus.style.left =
        "50%";


    plus.style.top =
        "45%";


    plus.style.transform =
        "translate(-50%, -50%)";


    plus.style.pointerEvents =
        "none";


    plus.style.fontSize =
        "22px";


    plus.style.fontWeight =
        "900";


    plus.style.color =
        "#aaffbd";


    plus.style.textShadow =
        "0 0 12px #00ff55";


    plus.style.animation =
        "tapFloat .7s ease-out forwards";


    button.style.position =
        "relative";


    button.appendChild(plus);


    setTimeout(() => {

        plus.remove();

    }, 750);

}



/* ================= HAPTIC ================= */

function haptic(type) {

    try {

        if (
            tg &&
            tg.HapticFeedback
        ) {

            tg.HapticFeedback.impactOccurred(
                type
            );

        }

    } catch (error) {

        console.log(
            "Haptic unavailable"
        );

    }

}



/* ================= START ================= */

function init() {

    setupUser();

    updateBalance();

    updateNavigation(
        "homePage"
    );

}



/* ================= START APP ================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);