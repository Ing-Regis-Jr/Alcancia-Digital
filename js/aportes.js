/* ================================= */
/* ELEMENTOS */
/* ================================= */

const amountInput =
    document.getElementById("amountInput");

const goalSelect =
    document.getElementById("goalSelect");

const daysPreview =
    document.getElementById("daysPreview");

const saveContributionBtn =
    document.getElementById("saveContributionBtn");

const contributionsList =
    document.getElementById("contributionsList");

const editModal =
    document.getElementById("editModal");

const editAmount =
    document.getElementById("editAmount");

const editGoalSelect =
    document.getElementById("editGoalSelect");

const editDaysPreview =
    document.getElementById("editDaysPreview");

const updateContributionBtn =
    document.getElementById("updateContributionBtn");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

/* ================================= */
/* ESTADO */
/* ================================= */

let editingContributionId = null;

/* ================================= */
/* EVENTOS */
/* ================================= */

saveContributionBtn.addEventListener(
    "click",
    saveContribution
);

updateContributionBtn.addEventListener(
    "click",
    updateCurrentContribution
);

cancelEditBtn.addEventListener(
    "click",
    closeEditModal
);

amountInput.addEventListener(
    "input",
    updateDaysPreview
);

goalSelect.addEventListener(
    "change",
    updateDaysPreview
);

editAmount.addEventListener(
    "input",
    updateEditDaysPreview
);

editGoalSelect.addEventListener(
    "change",
    updateEditDaysPreview
);

/* ================================= */
/* VISTA PREVIA DÍAS */
/* ================================= */

function updateDaysPreview() {

    const amount =
        Number(amountInput.value);

    const goalId =
        goalSelect.value;

    if (
        amount <= 0 ||
        !goalId
    ) {

        daysPreview.classList.add(
            "hidden"
        );

        return;

    }

    const days =
        getDaysMarkedForAmount(
            amount,
            goalId
        );

    daysPreview.classList.remove(
        "hidden"
    );

    if (days > 0) {

        daysPreview.innerHTML =
            `Este aporte marcará <strong>${days}</strong> día${days !== 1 ? "s" : ""} (se suma con aportes de otras personas)`;

        return;

    }

    const pending =
        getPendingForNextDay(
            goalId,
            amount
        );

    daysPreview.innerHTML =
        `Suma al día de la meta. Faltan <strong>${pending} Bs</strong> entre todos para marcar el siguiente día`;

}

function updateEditDaysPreview() {

    const amount =
        Number(editAmount.value);

    const goalId =
        editGoalSelect.value;

    if (
        amount <= 0 ||
        !goalId
    ) {

        editDaysPreview.classList.add(
            "hidden"
        );

        return;

    }

    const days =
        getDaysMarkedForAmount(
            amount,
            goalId,
            editingContributionId
        );

    editDaysPreview.classList.remove(
        "hidden"
    );

    if (days > 0) {

        editDaysPreview.innerHTML =
            `Marcará <strong>${days}</strong> día${days !== 1 ? "s" : ""} (sumando con otros aportes)`;

        return;

    }

    const pending =
        getPendingForNextDay(
            goalId,
            amount,
            editingContributionId
        );

    editDaysPreview.innerHTML =
        `Suma a la meta. Faltan <strong>${pending} Bs</strong> para el siguiente día`;

}

/* ================================= */
/* GUARDAR APORTE */
/* ================================= */

function saveContribution() {

    const personId =
        Number(personSelect.value);

    const person =
        getPeople().find(
            p => p.id === personId
        );

    if (!person) {

        alert(
            "Selecciona una persona"
        );

        return;
    }

    const goalId =
        Number(goalSelect.value);

    const goal =
        getGoalById(goalId);

    if (!goal) {

        alert(
            "Selecciona una meta"
        );

        return;
    }

    const amount =
        Number(amountInput.value);

    if (amount <= 0) {

        alert(
            "Ingresa un monto válido"
        );

        return;
    }

    addContribution({

        personId:
            person.id,

        personName:
            person.name,

        goalId:
            goal.id,

        amount

    });

    amountInput.value = "";
    goalSelect.value = "";

    daysPreview.classList.add(
        "hidden"
    );

    renderContributions();

    if (
        typeof refreshAfterContributionChange ===
        "function"
    ) {
        refreshAfterContributionChange();
    }

}

/* ================================= */
/* LISTADO */
/* ================================= */

function renderContributions() {

    contributionsList.innerHTML =
        "";

    const contributions =
        [...getContributions()]
        .reverse();

    if (
        contributions.length === 0
    ) {

        contributionsList.innerHTML =
            `
            <p>
                No hay aportes registrados.
            </p>
            `;

        return;
    }

    contributions.forEach(item => {

        const days =
            item.daysMarked || 0;

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "contribution-item";

        div.innerHTML = `
            <div class="contribution-header">

                <strong>
                    ${item.personName}
                </strong>

                <div class="contribution-actions">

                    <button
                        class="edit-btn"
                        data-id="${item.id}">
                        ✏️
                    </button>

                    <button
                        class="delete-btn"
                        data-id="${item.id}">
                        🗑️
                    </button>

                </div>

            </div>

            <p>
                <strong>
                    ${item.amount} Bs
                </strong>
                · 🎯 ${item.goalName || "Sin meta"}
            </p>

            <p class="days-badge">
                ${days > 0
                    ? `✅ ${days} día${days !== 1 ? "s" : ""} marcado${days !== 1 ? "s" : ""} por este aporte`
                    : "➕ Suma al día de la meta (con otros aportes)"}
            </p>

            <small>
                ${item.date}
            </small>
        `;

        contributionsList.appendChild(
            div
        );

    });

    attachContributionEvents();

}

/* ================================= */
/* EVENTOS DINÁMICOS */
/* ================================= */

function attachContributionEvents() {

    document
        .querySelectorAll(
            ".edit-btn"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            btn.dataset.id
                        );

                    openEditModal(
                        id
                    );

                }
            );

        });

    document
        .querySelectorAll(
            ".delete-btn"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            btn.dataset.id
                        );

                    const confirmDelete =
                        confirm(
                            "¿Eliminar aporte?"
                        );

                    if (
                        !confirmDelete
                    ) {
                        return;
                    }

                    deleteContribution(
                        id
                    );

                    renderContributions();

                    if (
                        typeof refreshAfterContributionChange ===
                        "function"
                    ) {
                        refreshAfterContributionChange();
                    }

                }
            );

        });

}

/* ================================= */
/* EDITAR */
/* ================================= */

function openEditModal(id) {

    const contribution =
        getContributions()
        .find(
            c => c.id === id
        );

    if (!contribution) {
        return;
    }

    editingContributionId =
        contribution.id;

    editAmount.value =
        contribution.amount;

    if (
        typeof refreshGoalSelects ===
        "function"
    ) {
        refreshGoalSelects();
    }

    editGoalSelect.value =
        contribution.goalId;

    updateEditDaysPreview();

    editModal.classList.remove(
        "hidden"
    );

}

function closeEditModal() {

    editingContributionId =
        null;

    editModal.classList.add(
        "hidden"
    );

}

/* ================================= */
/* ACTUALIZAR */
/* ================================= */

function updateCurrentContribution() {

    if (
        editingContributionId ===
        null
    ) {
        return;
    }

    const amount =
        Number(
            editAmount.value
        );

    const goalId =
        Number(
            editGoalSelect.value
        );

    if (amount <= 0) {

        alert(
            "Monto inválido"
        );

        return;
    }

    if (!getGoalById(goalId)) {

        alert(
            "Selecciona una meta"
        );

        return;
    }

    updateContribution(

        editingContributionId,

        amount,

        goalId

    );

    closeEditModal();

    renderContributions();

    if (
        typeof refreshAfterContributionChange ===
        "function"
    ) {
        refreshAfterContributionChange();
    }

}
