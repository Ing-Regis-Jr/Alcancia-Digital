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

    if (
        typeof resetPendingSetupGoals ===
        "function"
    ) {
        resetPendingSetupGoals();
    }

    if (
        typeof renderPendingSetupGoals ===
        "function"
    ) {
        renderPendingSetupGoals();
    }

}

/* ================================= */
/* GUARDAR CONFIGURACIÓN */
/* ================================= */

saveMonthBtn.addEventListener(
    "click",
    saveMonthConfiguration
);

function saveMonthConfiguration() {

    if (
        typeof pendingSetupGoals !==
        "undefined" &&
        pendingSetupGoals.length > 0
    ) {

        savePendingGoalsToMonth();

        enterApplication();

        return;

    }

    if (monthHasGoals()) {

        enterApplication();

        return;

    }

    alert(
        "Agrega al menos una meta con monto diario"
    );

}

/* ================================= */
/* ENTRAR APP */
/* ================================= */

function enterApplication() {

    createMonthIfNeeded();

    const month =
        getCurrentMonthData();

    if (!monthHasGoals()) {

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

    if (
        typeof loadDashboard ===
        "function"
    ) {
        loadDashboard();
    }

    if (
        typeof renderGoals ===
        "function"
    ) {
        renderGoals();
    }

    if (
        typeof refreshGoalSelects ===
        "function"
    ) {
        refreshGoalSelects();
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
