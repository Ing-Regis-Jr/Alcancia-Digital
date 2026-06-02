/* ================================= */
/* ELEMENTOS */
/* ================================= */

const amountInput =
    document.getElementById("amountInput");

const commentInput =
    document.getElementById("commentInput");

const saveContributionBtn =
    document.getElementById("saveContributionBtn");

const contributionsList =
    document.getElementById("contributionsList");

const editModal =
    document.getElementById("editModal");

const editAmount =
    document.getElementById("editAmount");

const editComment =
    document.getElementById("editComment");

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

        amount,

        comment:
            commentInput.value.trim()

    });

    amountInput.value = "";
    commentInput.value = "";

    renderContributions();

    if (
        typeof loadDashboard ===
        "function"
    ) {
        loadDashboard();
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
            </p>

            <p>
                ${item.comment || "-"}
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
                        typeof loadDashboard ===
                        "function"
                    ) {
                        loadDashboard();
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

    editComment.value =
        contribution.comment;

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

    if (amount <= 0) {

        alert(
            "Monto inválido"
        );

        return;
    }

    updateContribution(

        editingContributionId,

        amount,

        editComment.value.trim()

    );

    closeEditModal();

    renderContributions();

    if (
        typeof loadDashboard ===
        "function"
    ) {
        loadDashboard();
    }

}