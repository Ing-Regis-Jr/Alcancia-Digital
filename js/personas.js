/* ================================= */
/* ELEMENTOS */
/* ================================= */

const personNameInput =
    document.getElementById("personName");

const addPersonBtn =
    document.getElementById("addPersonBtn");

const peopleList =
    document.getElementById("peopleList");

const personSelect =
    document.getElementById("personSelect");

/* ================================= */
/* EVENTOS */
/* ================================= */

addPersonBtn.addEventListener(
    "click",
    createPerson
);

/* ================================= */
/* AGREGAR PERSONA */
/* ================================= */

function createPerson() {

    const name =
        personNameInput.value.trim();

    if (!name) {

        alert(
            "Ingresa un nombre"
        );

        return;
    }

    const exists =
        getPeople().some(
            p =>
                p.name
                .toLowerCase()
                ===
                name.toLowerCase()
        );

    if (exists) {

        alert(
            "La persona ya existe"
        );

        return;
    }

    addPerson(name);

    personNameInput.value = "";

    renderPeople();

}

/* ================================= */
/* RENDER PERSONAS */
/* ================================= */

function renderPeople() {

    const people =
        getPeople();

    peopleList.innerHTML = "";

    personSelect.innerHTML =
        "";

    /* opción por defecto */

    const defaultOption =
        document.createElement(
            "option"
        );

    defaultOption.value = "";

    defaultOption.textContent =
        "Seleccionar persona";

    personSelect.appendChild(
        defaultOption
    );

    if (people.length === 0) {

        const li =
            document.createElement(
                "li"
            );

        li.textContent =
            "No hay personas registradas";

        peopleList.appendChild(
            li
        );

        return;
    }

    people.forEach(person => {

        /* LISTA */

        const li =
            document.createElement(
                "li"
            );

        const nameSpan =
            document.createElement(
                "span"
            );

        nameSpan.textContent =
            person.name;

        const deleteBtn =
            document.createElement(
                "button"
            );

        deleteBtn.textContent =
            "🗑️";

        deleteBtn.classList.add(
            "delete-btn"
        );

        deleteBtn.addEventListener(
            "click",
            () => {

                const confirmDelete =
                    confirm(
                        `¿Eliminar a ${person.name}?`
                    );

                if (
                    !confirmDelete
                ) {
                    return;
                }

                removePerson(
                    person.id
                );

                renderPeople();

                if (
                    typeof refreshGoalSelects ===
                    "function"
                ) {
                    refreshGoalSelects();
                }

            }
        );

        li.appendChild(
            nameSpan
        );

        li.appendChild(
            deleteBtn
        );

        peopleList.appendChild(
            li
        );

        /* SELECT */

        const option =
            document.createElement(
                "option"
            );

        option.value =
            person.id;

        option.textContent =
            person.name;

        personSelect.appendChild(
            option
        );

    });

}