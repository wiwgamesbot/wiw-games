/* =========================================================
   WIW GAMES
   Rocket + Mines + Plinko
   Virtual points only
========================================================= */

const tg =
    window.Telegram && window.Telegram.WebApp
        ? window.Telegram.WebApp
        : null;

if (tg) {
    tg.ready();
    tg.expand();
}


/* =========================================================
   STATE
========================================================= */

const DEFAULT_BALANCE = 1000;

let balance = Number(
    localStorage.getItem("wiw_balance")
);

if (!Number.isFinite(balance)) {
    balance = DEFAULT_BALANCE;
}

let rocketGame = {
    active: false,
    multiplier: 1,
    crashPoint: 2,
    animation: null,
    elapsed: 0
};

let minesGame = {
    active: false,
    mines: [],
    opened: [],
    mineCount: 5
};

let plinkoGame = {
    active: false
};


/* =========================================================
   HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function saveBalance() {
    localStorage.setItem(
        "wiw_balance",
        String(Math.floor(balance))
    );
}


function updateBalance() {
    const elements =
        document.querySelectorAll("#balance");

    elements.forEach((el) => {
        el.textContent = Math.floor(balance);
    });
}


function addBalance(amount) {
    balance += Math.floor(amount);

    if (balance < 0) {
        balance = 0;
    }

    saveBalance();
    updateBalance();
}


function spendBalance(amount) {
    amount = Math.floor(Number(amount));

    if (!Number.isFinite(amount) || amount <= 0) {
        return false;
    }

    if (balance < amount) {
        return false;
    }

    balance -= amount;

    saveBalance();
    updateBalance();

    return true;
}


/* =========================================================
   NAVIGATION
========================================================= */

function hidePages() {
    document
        .querySelectorAll(".page")
        .forEach((page) => {
            page.classList.remove("active");
        });
}


function setActiveNav(index) {
    document
        .querySelectorAll(".nav-button")
        .forEach((button) => {
            button.classList.remove("active");
        });

    const buttons =
        document.querySelectorAll(".nav-button");

    if (buttons[index]) {
        buttons[index].classList.add("active");
    }
}


function goHome() {
    stopRocket();

    hidePages();

    const home = $("homePage");

    if (home) {
        home.classList.add("active");
    }

    setActiveNav(0);
}


function openGame(game) {
    hidePages();

    if (game === "rocket") {
        const page = $("rocketPage");

        if (page) {
            page.classList.add("active");
        }

        setActiveNav(1);
        resetRocket();
        return;
    }

    if (game === "mines") {
        const page = $("minesPage");

        if (page) {
            page.classList.add("active");
        }

        setActiveNav(2);
        startMines();
        return;
    }

    if (game === "plinko") {
        const page = $("plinkoPage");

        if (page) {
            page.classList.add("active");
        }

        setActiveNav(3);
        createPlinkoBoard();
        return;
    }
}


/* =========================================================
   ROCKET
========================================================= */

function randomCrashPoint() {
    const value =
        1.35 + Math.random() * 5.65;

    return Number(value.toFixed(2));
}


function updateRocketMultiplier() {
    const el = $("rocketMultiplier");

    if (!el) {
        return;
    }

    el.textContent =
        rocketGame.multiplier.toFixed(2) + "x";
}


function updateRocketStatus(text) {
    const el = $("rocketStatus");

    if (el) {
        el.textContent = text;
    }
}


function resetRocketVisual() {
    const ship = $("rocketShip");
    const trail = $("rocketTrail");

    if (ship) {
        ship.style.left = "28px";
        ship.style.bottom = "30px";

        /*
         * ВАЖНО:
         * Здесь специально НЕ меняем transform.
         * Наклон ракеты задаётся CSS:
         * transform: rotate(-45deg)
         */

        ship.classList.remove("flying");
    }

    if (trail) {
        trail.style.width = "220px";
    }
}


function resetRocket() {
    stopRocket();

    rocketGame.active = false;
    rocketGame.multiplier = 1;
    rocketGame.crashPoint =
        randomCrashPoint();
    rocketGame.elapsed = 0;

    resetRocketVisual();
    updateRocketMultiplier();
    updateRocketStatus("Готово");

    const button = $("rocketButton");

    if (button) {
        button.disabled = false;
        button.textContent = "ЗАПУСТИТЬ";
    }
}


function startRocket() {
    if (rocketGame.active) {
        return;
    }

    const cost = 10;

    if (!spendBalance(cost)) {
        updateRocketStatus(
            "Недостаточно ⭐"
        );
        return;
    }

    rocketGame.active = true;
    rocketGame.multiplier = 1;
    rocketGame.crashPoint =
        randomCrashPoint();
    rocketGame.elapsed = 0;

    resetRocketVisual();

    updateRocketMultiplier();
    updateRocketStatus("Полет!");

    const button = $("rocketButton");

    if (button) {
        button.textContent = "ЗАБРАТЬ";
    }

    animateRocket();
}


function animateRocket() {
    const ship = $("rocketShip");
    const trail = $("rocketTrail");

    if (!ship) {
        return;
    }

    const area = ship.parentElement;

    if (!area) {
        return;
    }

    const startTime = performance.now();

    function frame(now) {
        if (!rocketGame.active) {
            return;
        }

        const elapsed =
            (now - startTime) / 1000;

        rocketGame.elapsed = elapsed;

        /*
         * Плавный постоянный рост.
         */
        rocketGame.multiplier =
            1 + elapsed * 0.65;

        if (
            rocketGame.multiplier >=
            rocketGame.crashPoint
        ) {
            rocketGame.multiplier =
                rocketGame.crashPoint;

            updateRocketMultiplier();
            crashRocket();

            return;
        }

        updateRocketMultiplier();

        const areaWidth =
            area.clientWidth;

        const areaHeight =
            area.clientHeight;

        const shipWidth =
            ship.offsetWidth || 64;

        const shipHeight =
            ship.offsetHeight || 64;

        const maxLeft =
            Math.max(
                28,
                areaWidth -
                shipWidth -
                20
            );

        const maxBottom =
            Math.max(
                30,
                areaHeight -
                shipHeight -
                20
            );

        /*
         * Плавное движение
         * снизу-слева → вверх-вправо.
         */
        const progress =
            Math.min(
                1,
                elapsed / 12
            );

        const left =
            28 +
            progress *
            (maxLeft - 28);

        const bottom =
            30 +
            progress *
            (maxBottom - 30);

        ship.style.left =
            left + "px";

        ship.style.bottom =
            bottom + "px";

        if (trail) {
            trail.style.width =
                (180 +
                progress * 80) +
                "px";
        }

        rocketGame.animation =
            requestAnimationFrame(frame);
    }

    /*
     * Добавляем класс, но сам угол
     * НЕ меняем через JS.
     */
    ship.classList.add("flying");

    rocketGame.animation =
        requestAnimationFrame(frame);
}


function stopRocket() {
    if (rocketGame.animation) {
        cancelAnimationFrame(
            rocketGame.animation
        );

        rocketGame.animation = null;
    }

    rocketGame.active = false;
}


function crashRocket() {
    rocketGame.active = false;

    if (rocketGame.animation) {
        cancelAnimationFrame(
            rocketGame.animation
        );

        rocketGame.animation = null;
    }

    updateRocketStatus(
        "💥 Ракета взорвалась"
    );

    const ship = $("rocketShip");

    if (ship) {
        ship.classList.remove("flying");

        ship.animate(
            [
                {
                    transform:
                        "rotate(-45deg) scale(1)"
                },
                {
                    transform:
                        "rotate(-45deg) scale(1.3)"
                },
                {
                    transform:
                        "rotate(-45deg) scale(.75)"
                },
                {
                    transform:
                        "rotate(-45deg) scale(1)"
                }
            ],
            {
                duration: 420,
                easing: "ease-out"
            }
        );
    }

    const button = $("rocketButton");

    if (button) {
        button.textContent =
            "НОВЫЙ ЗАПУСК";
    }
}


/* =========================================================
   ROCKET CASH OUT
========================================================= */

function cashOutRocket() {
    if (!rocketGame.active) {
        startRocket();
        return;
    }

    const multiplier =
        rocketGame.multiplier;

    const reward =
        Math.max(
            1,
            Math.floor(
                10 * multiplier
            )
        );

    stopRocket();

    addBalance(reward);

    updateRocketStatus(
        "Забрано +" +
        reward +
        " ⭐"
    );

    const button = $("rocketButton");

    if (button) {
        button.textContent =
            "НОВЫЙ ЗАПУСК";
    }
}


/*
 * Кнопка Rocket должна:
 * если полёт идёт → забрать,
 * если нет → запустить.
 */
document.addEventListener(
    "click",
    function(event) {
        const button =
            event.target.closest(
                "#rocketButton"
            );

        if (!button) {
            return;
        }

        if (rocketGame.active) {
            cashOutRocket();
        }
    }
);


/* =========================================================
   MINES
========================================================= */

function startMines() {
    const grid = $("minesGrid");

    if (!grid) {
        return;
    }

    minesGame.active = true;
    minesGame.mines = [];
    minesGame.opened = [];

    grid.innerHTML = "";

    /*
     * 25 клеток.
     */
    const totalCells = 25;

    while (
        minesGame.mines.length <
        minesGame.mineCount
    ) {
        const index =
            Math.floor(
                Math.random() *
                totalCells
            );

        if (
            !minesGame.mines.includes(
                index
            )
        ) {
            minesGame.mines.push(
                index
            );
        }
    }

    for (
        let i = 0;
        i < totalCells;
        i++
    ) {
        const cell =
            document.createElement(
                "button"
            );

        cell.className =
            "mine-cell";

        cell.dataset.index = i;

        cell.textContent = "·";

        cell.addEventListener(
            "click",
            function() {
                openMineCell(
                    i,
                    cell
                );
            }
        );

        grid.appendChild(cell);
    }

    const status =
        $("minesStatus");

    if (status) {
        status.textContent =
            "Найди безопасные клетки";
    }
}


function openMineCell(index, cell) {
    if (!minesGame.active) {
        return;
    }

    if (
        minesGame.opened.includes(
            index
        )
    ) {
        return;
    }

    minesGame.opened.push(index);

    if (
        minesGame.mines.includes(
            index
        )
    ) {
        cell.classList.add("mine");
        cell.textContent = "💥";

        revealAllMines();

        minesGame.active = false;

        const status =
            $("minesStatus");

        if (status) {
            status.textContent =
                "💥 Ты попал на мину";
        }

        return;
    }

    cell.classList.add("safe");
    cell.textContent = "✓";

    /*
     * Небольшая награда
     * за безопасную клетку.
     */
    addBalance(2);

    const safeCount =
        minesGame.opened.length;

    const status =
        $("minesStatus");

    if (status) {
        status.textContent =
            "Безопасно! +" +
            "2 ⭐ • " +
            safeCount +
            " открыто";
    }
}


function revealAllMines() {
    const cells =
        document.querySelectorAll(
            ".mine-cell"
        );

    cells.forEach(
        (cell) => {
            const index =
                Number(
                    cell.dataset.index
                );

            if (
                minesGame.mines.includes(
                    index
                )
            ) {
                cell.classList.add(
                    "mine"
                );

                cell.textContent =
                    "💣";
            }
        }
    );
}


/* =========================================================
   PLINKO
========================================================= */

function createPlinkoBoard() {
    const board =
        $("plinkoBoard");

    if (!board) {
        return;
    }

    board.innerHTML = "";

    const rows = 8;
    const columns = 9;

    /*
     * Создаём штырьки.
     */
    for (
        let row = 0;
        row < rows;
        row++
    ) {
        const count =
            row % 2 === 0
                ? columns
                : columns - 1;

        for (
            let col = 0;
            col < count;
            col++
        ) {
            const pin =
                document.createElement(
                    "div"
                );

            pin.className =
                "plinko-pin";

            const offset =
                row % 2 === 0
                    ? 8
                    : 14;

            const gap =
                (78 / (count - 1));

            pin.style.left =
                (
                    offset +
                    col * gap
                ) + "%";

            pin.style.top =
                (
                    10 +
                    row * 10.5
                ) + "%";

            board.appendChild(pin);
        }
    }

    /*
     * Нижние множители.
     */
    const values =
        [
            "0.5x",
            "0.8x",
            "1x",
            "1.5x",
            "2x",
            "1.5x",
            "1x",
            "0.8x",
            "0.5x"
        ];

    values.forEach(
        (value, index) => {
            const slot =
                document.createElement(
                    "div"
                );

            slot.textContent = value;

            slot.style.position =
                "absolute";

            slot.style.bottom =
                "8px";

            slot.style.left =
                (
                    3 +
                    index * 11.2
                ) + "%";

            slot.style.width =
                "10%";

            slot.style.textAlign =
                "center";

            slot.style.fontSize =
                "10px";

            slot.style.fontWeight =
                "800";

            slot.style.color =
                "#969aab";

            board.appendChild(slot);
        }
    );
}


function dropPlinko() {
    if (plinkoGame.active) {
        return;
    }

    const board =
        $("plinkoBoard");

    if (!board) {
        return;
    }

    plinkoGame.active = true;

    const result =
        $("plinkoResult");

    if (result) {
        result.textContent =
            "•••";
    }

    const ball =
        document.createElement(
            "div"
        );

    ball.className =
        "plinko-ball";

    board.appendChild(ball);

    const boardWidth =
        board.clientWidth;

    const maxX =
        Math.max(
            20,
            boardWidth - 30
        );

    let x =
        boardWidth / 2;

    let y = 8;

    let step = 0;

    const timer =
        setInterval(
            function() {
                step++;

                /*
                 * Случайные небольшие
                 * отклонения после каждого
                 * столкновения.
                 */
                x +=
                    (
                        Math.random() -
                        0.5
                    ) * 55;

                x =
                    Math.max(
                        15,
                        Math.min(
                            maxX,
                            x
                        )
                    );

                y += 35;

                ball.style.left =
                    x + "px";

                ball.style.top =
                    y + "px";

                if (step >= 8) {
                    clearInterval(
                        timer
                    );

                    finishPlinko(
                        x,
                        boardWidth,
                        ball
                    );
                }
            },
            130
        );
}


function finishPlinko(
    x,
    boardWidth,
    ball
) {
    const normalized =
        x / boardWidth;

    let multiplier;

    if (normalized < 0.12) {
        multiplier = 0.5;
    } else if (normalized < 0.25) {
        multiplier = 0.8;
    } else if (normalized < 0.39) {
        multiplier = 1;
    } else if (normalized < 0.50) {
        multiplier = 1.5;
    } else if (normalized < 0.61) {
        multiplier = 2;
    } else if (normalized < 0.75) {
        multiplier = 1.5;
    } else if (normalized < 0.88) {
        multiplier = 1;
    } else {
        multiplier = 0.5;
    }

    /*
     * Виртуальная награда
     * от условных 10 очков.
     */
    const reward =
        Math.floor(
            10 * multiplier
        );

    addBalance(reward);

    const result =
        $("plinkoResult");

    if (result) {
        result.textContent =
            multiplier +
            "x  +" +
            reward +
            " ⭐";
    }

    setTimeout(
        function() {
            if (ball) {
                ball.remove();
            }

            plinkoGame.active = false;
        },
        500
    );
}


/* =========================================================
   INIT
========================================================= */

function init() {
    updateBalance();

    resetRocket();

    createPlinkoBoard();

    /*
     * Telegram theme.
     */
    if (tg) {
        document.documentElement.style.setProperty(
            "--tg-bg",
            tg.backgroundColor ||
            "#08090f"
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    init
);
