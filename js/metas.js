/* ================================= */
/* ELEMENTOS */
/* ================================= */

const goalNameInput =
    document.getElementById("goalName");

const goalDailyInput =
    document.getElementById("goalDaily");

const addGoalBtn =
    document.getElementById("addGoalBtn");

const goalsList =
    document.getElementById("goalsList");

const setupGoalsList =
    document.getElementById("setupGoalsList");

const addSetupGoalBtn =
    document.getElementById("addSetupGoalBtn");

const setupGoalName =
    document.getElementById("setupGoalName");

const setupGoalDaily =
    document.getElementById("setupGoalDaily");

/* ================================= */
/* SETUP (antes de comenzar mes) */
/* ================================= */

let pendingSetupGoals = [];

if (addSetupGoalBtn) {

    addSetupGoalBtn.addEventListener(
        "click",
        addPendingSetupGoal
    );

}

function addPendingSetupGoal() {

    const name =
        setupGoalName.value.trim();

    const daily =
        Number(setupGoalDaily.value);

    if (!name) {

        alert("Escribe el nombre de la meta");

        return;
    }

    if (daily <= 0) {

        alert("Ingresa un monto diario válido");

        return;
    }

    pendingSetupGoals.push({

        id: Date.now(),

        name,

        dailyAmount: daily

    });

    setupGoalName.value = "";
    setupGoalDaily.value = "";

    renderPendingSetupGoals();

    updateSetupGoalsPreview();

}

function renderPendingSetupGoals() {

    if (!setupGoalsList) {
        return;
    }

    setupGoalsList.innerHTML = "";

    if (
        pendingSetupGoals.length === 0
    ) {

        setupGoalsList.innerHTML =
            "<p class='hint'>Agrega al menos una meta (ej: Mamá, Viaje)</p>";

        return;
    }

    pendingSetupGoals.forEach(goal => {

        const div =
            document.createElement("div");

        div.className = "goal-item";

        div.innerHTML = `
            <span>
                <strong>${goal.name}</strong>
                — ${goal.dailyAmount} Bs/día
            </span>
            <button
                type="button"
                class="delete-btn small-delete"
                data-id="${goal.id}">
                🗑️
            </button>
        `;

        setupGoalsList.appendChild(div);

    });

    setupGoalsList
        .querySelectorAll(".small-delete")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    const id =
                        Number(btn.dataset.id);

                    pendingSetupGoals =
                        pendingSetupGoals.filter(
                            g => g.id !== id
                        );

                    renderPendingSetupGoals();

                    updateSetupGoalsPreview();

                }
            );

        });

}

function updateSetupGoalsPreview() {

    const label =
        document.getElementById(
            "monthlyGoal"
        );

    if (!label) {
        return;
    }

    const total =
        pendingSetupGoals.reduce(
            (sum, g) =>
                sum +
                g.dailyAmount *
                getDaysInCurrentMonth(),
            0
        );

    label.textContent =
        `${total} Bs`;

}

function savePendingGoalsToMonth() {

    pendingSetupGoals.forEach(goal => {

        addGoal(
            goal.name,
            goal.dailyAmount
        );

    });

    pendingSetupGoals = [];

}

function resetPendingSetupGoals() {

    pendingSetupGoals = [];

    renderPendingSetupGoals();

}

/* ================================= */
/* METAS EN LA APP */
/* ================================= */

if (addGoalBtn) {

    addGoalBtn.addEventListener(
        "click",
        createGoal
    );

}

function createGoal() {

    const name =
        goalNameInput.value.trim();

    const daily =
        Number(goalDailyInput.value);

    if (!name) {

        alert("Escribe el nombre de la meta");

        return;
    }

    if (daily <= 0) {

        alert("Ingresa un monto diario válido");

        return;
    }

    addGoal(name, daily);

    goalNameInput.value = "";
    goalDailyInput.value = "";

    renderGoals();

    refreshGoalSelects();

    if (
        typeof loadDashboard ===
        "function"
    ) {
        loadDashboard();
    }

}

function renderGoals() {

    if (!goalsList) {
        return;
    }

    const goals = getGoals();

    goalsList.innerHTML = "";

    if (goals.length === 0) {

        goalsList.innerHTML =
            "<p>No hay metas. Agrega una arriba.</p>";

        return;
    }

    const days =
        getDaysInCurrentMonth();

    goals.forEach(goal => {

        const saved =
            getTotalSavedForGoal(
                goal.id
            );

        const goalTarget =
            goal.dailyAmount * days;

        const covered =
            (goal.coveredDays || []).length;

        const div =
            document.createElement("div");

        div.className = "goal-item";

        div.innerHTML = `
            <div class="goal-item-info">
                <strong>${goal.name}</strong>
                <span>${goal.dailyAmount} Bs/día · Meta ${goalTarget} Bs</span>
                <span>Ahorrado: ${saved} Bs · ${covered}/${days} días</span>
            </div>
            <button
                type="button"
                class="delete-btn small-delete"
                data-id="${goal.id}">
                🗑️
            </button>
        `;

        goalsList.appendChild(div);

    });

    goalsList
        .querySelectorAll(".small-delete")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    const id =
                        Number(btn.dataset.id);

                    const goal =
                        getGoals().find(
                            g => g.id === id
                        );

                    if (
                        !confirm(
                            `¿Eliminar la meta "${goal?.name}"? Se borran sus aportes.`
                        )
                    ) {
                        return;
                    }

                    removeGoal(id);

                    renderGoals();

                    refreshGoalSelects();

                    if (
                        typeof renderContributions ===
                        "function"
                    ) {
                        renderContributions();
                    }

                    if (
                        typeof loadDashboard ===
                        "function"
                    ) {
                        loadDashboard();
                    }

                }
            );

        });

}

function refreshGoalSelects() {

    const goals = getGoals();

    const selects = [
        document.getElementById("goalSelect"),
        document.getElementById("editGoalSelect")
    ].filter(Boolean);

    selects.forEach(select => {

        const current =
            select.value;

        select.innerHTML = "";

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =
            "Seleccionar meta";

        select.appendChild(defaultOption);

        goals.forEach(goal => {

            const option =
                document.createElement("option");

            option.value = goal.id;

            option.textContent =
                `${goal.name} (${goal.dailyAmount} Bs/día)`;

            select.appendChild(option);

        });

        if (
            current &&
            goals.some(
                g =>
                    String(g.id) ===
                    current
            )
        ) {
            select.value = current;
        }

    });

}
