const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}


/* =========================
   GAME DATA
========================= */

let balance = 1000;
let taps = 0;

let currentPage = "homePage";


/* =========================
   TELEGRAM USER
========================= */

function setupUser() {

    const user = tg?.initDataUnsafe?.user;

    if (!user) {
        return;
    }

    const name =
        user.first_name ||
        user.username ||
        "Игрок";

    const profileName =
        document.querySelector(".profile-name");

    if (profileName) {
        profileName.textContent = name;
    }

    const playerId =
        document.getElementById("playerId");

    if (playerId) {
        playerId.textContent = user.id;
    }

    const avatar =
        document.querySelector(".profile-avatar");

    if (avatar) {
        avatar.textContent =
            name.charAt(0).toUpperCase();
    }
}


/* =========================
   BALANCE
========================= */

function updateBalance() {

    const balanceElement =
        document.getElementById("balance");

    const profileBalance =
        document.getElementById("profileBalance");

    const tapBalance =
        document.getElementById("tapBalance");


    if (balanceElement) {
        balanceElement.textContent = balance;
    }

    if (profileBalance) {
        profileBalance.textContent = balance;
    }

    if (tapBalance) {
        tapBalance.textContent = balance;
    }
}


/* =========================
   PAGE NAVIGATION
========================= */

function openPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });


    const target =
        document.getElementById(pageId);

    if (target) {
        target.classList.add("active");
    }


    currentPage = pageId;

    updateNavigation(pageId);

    window.scrollTo(0, 0);
}


/* =========================
   HOME
========================= */

function goHome() {
    openPage("homePage");
}


/* =========================
   BOTTOM NAV
========================= */

function updateNavigation(pageId) {

    const buttons =
        document.querySelectorAll(".nav-item");

    buttons.forEach(button => {
        button.classList.remove("active");
    });


    if (pageId === "homePage") {

        buttons[0]?.classList.add("active");

    } else if (pageId === "leaderboardPage") {

        buttons[1]?.classList.add("active");

    } else if (pageId === "tapPage") {

        buttons[2]?.classList.add("active");

    } else if (pageId === "profilePage") {

        buttons[3]?.classList.add("active");

    }
}


/* =========================
   TAPPER
========================= */

function tap() {

    balance += 1;
    taps += 1;


    updateBalance();


    const tapCount =
        document.getElementById("tapCount");

    if (tapCount) {
        tapCount.textContent = taps;
    }


    if (tg?.HapticFeedback) {

        tg.HapticFeedback.impactOccurred(
            "light"
        );

    }
}


/* =========================
   START
========================= */

function init() {

    setupUser();

    updateBalance();

    updateNavigation("homePage");

}


/* =========================
   RUN
========================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);