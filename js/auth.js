/* ================================= */
/* ELEMENTOS LOGIN */
/* ================================= */

const authScreen =
    document.getElementById("authScreen");

const setupScreen =
    document.getElementById("setupScreen");

const appScreen =
    document.getElementById("appScreen");

const authMessage =
    document.getElementById("authMessage");

const pinInput =
    document.getElementById("pin");

const confirmPinInput =
    document.getElementById("confirmPin");

const btnAuth =
    document.getElementById("btnAuth");

/* ================================= */
/* ELEMENTOS SETUP */
/* ================================= */

const setupMonth =
    document.getElementById("setupMonth");

const dailyAmountInput =
    document.getElementById("dailyAmount");

const monthlyGoalLabel =
    document.getElementById("monthlyGoal");

const saveMonthBtn =
    document.getElementById("saveMonthBtn");

/* ================================= */
/* INICIALIZAR */
/* ================================= */

initializeAuth();

/* ================================= */
/* AUTH */
/* ================================= */

function initializeAuth() {

    createMonthIfNeeded();

    const pin = getPin();

    if (!pin) {

        authMessage.textContent =
            "Crea un PIN de administrador";

        btnAuth.textContent =
            "Crear PIN";

        confirmPinInput.classList.remove(
            "hidden"
        );

    } else {

        authMessage.textContent =
            "Ingresa tu PIN";

        btnAuth.textContent =
            "Entrar";

        confirmPinInput.classList.add(
            "hidden"
        );

    }

}

/* ================================= */
/* CREAR / LOGIN */
/* ================================= */

btnAuth.addEventListener(
    "click",
    handleAuth
);

function handleAuth() {

    const pin =
        pinInput.value.trim();

    if (pin.length !== 4) {

        alert(
            "El PIN debe tener 4 dígitos"
        );

        return;
    }

    const savedPin =
        getPin();

    /* CREAR PIN */

    if (!savedPin) {

        const confirmPin =
            confirmPinInput.value.trim();

        if (pin !== confirmPin) {

            alert(
                "Los PIN no coinciden"
            );

            return;
        }

        savePin(pin);

        openSetup();

        return;
    }

    /* LOGIN */

    if (pin !== savedPin) {

        alert(
            "PIN incorrecto"
        );

        return;
    }

    enterApplication();

}

/* ================================= */
/* CONFIGURACIÓN MES */
/* ================================= */

function openSetup() {

    authScreen.classList.add(
        "hidden"
    );

    setupScreen.classList.remove(
        "hidden"
    );

    setupMonth.textContent =
        getMonthName();

}

/* ================================= */
/* PREVIEW META */
/* ================================= */

dailyAmountInput.addEventListener(
    "input",
    updateGoalPreview
);

function updateGoalPreview() {

    const amount =
        Number(
            dailyAmountInput.value
        ) || 0;

    const goal =
        amount *
        getDaysInCurrentMonth();

    monthlyGoalLabel.textContent =
        `${goal} Bs`;

}

/* ================================= */
/* GUARDAR CONFIGURACIÓN */
/* ================================= */

saveMonthBtn.addEventListener(
    "click",
    saveMonthConfiguration
);

function saveMonthConfiguration() {

    const amount =
        Number(
            dailyAmountInput.value
        );

    if (amount <= 0) {

        alert(
            "Ingresa un monto válido"
        );

        return;
    }

    setDailyAmount(amount);

    enterApplication();

}

/* ================================= */
/* ENTRAR APP */
/* ================================= */

function enterApplication() {

    createMonthIfNeeded();

    const month =
        getCurrentMonthData();

    /* Si el mes existe pero no tiene ahorro diario */

    if (
        !month.dailyAmount ||
        month.dailyAmount <= 0
    ) {

        openSetup();
        return;
    }

    authScreen.classList.add(
        "hidden"
    );

    setupScreen.classList.add(
        "hidden"
    );

    appScreen.classList.remove(
        "hidden"
    );

    document
        .getElementById("currentMonth")
        .textContent =
        month.monthName;

    /* Estas funciones existirán
       en app.js */

    if (
        typeof loadDashboard ===
        "function"
    ) {
        loadDashboard();
    }

    if (
        typeof renderPeople ===
        "function"
    ) {
        renderPeople();
    }

    if (
        typeof renderContributions ===
        "function"
    ) {
        renderContributions();
    }

    if (
        typeof renderHistory ===
        "function"
    ) {
        renderHistory();
    }

}