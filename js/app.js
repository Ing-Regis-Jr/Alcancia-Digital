/* ================================= */
/* NAVEGACIÓN */
/* ================================= */

const navButtons =
    document.querySelectorAll(
        ".nav-btn"
    );

const views =
    document.querySelectorAll(
        ".view"
    );

navButtons.forEach(btn => {

    btn.addEventListener(
        "click",
        () => {

            const targetView =
                btn.dataset.view;

            views.forEach(view => {

                view.classList.add(
                    "hidden"
                );

            });

            document
                .getElementById(
                    targetView
                )
                .classList.remove(
                    "hidden"
                );

            navButtons.forEach(
                b =>
                    b.classList.remove(
                        "active"
                    )
            );

            btn.classList.add(
                "active"
            );

        }
    );

});

/* ================================= */
/* DASHBOARD */
/* ================================= */

function loadDashboard() {

    const month =
        getCurrentMonthData();

    const totalSaved =
        getTotalSaved();

    const goal =
        getMonthlyGoal();

    const coveredDays =
        getCoveredDays();

    const percent =
        getProgressPercent();

    document
        .getElementById(
            "goalValue"
        )
        .textContent =
        `${goal} Bs`;

    document
        .getElementById(
            "savedValue"
        )
        .textContent =
        `${totalSaved} Bs`;

    document
        .getElementById(
            "dailyValue"
        )
        .textContent =
        `${month.dailyAmount} Bs`;

    document
        .getElementById(
            "coveredDays"
        )
        .textContent =
        `${coveredDays} / ${getDaysInCurrentMonth()}`;

    document
        .getElementById(
            "progressText"
        )
        .textContent =
        `${percent.toFixed(1)}% completado`;

    document
        .getElementById(
            "progressFill"
        )
        .style.width =
        `${percent}%`;

}

/* ================================= */
/* HISTORIAL */
/* ================================= */

function renderHistory() {

    const historyContainer =
        document.getElementById(
            "monthsHistory"
        );

    historyContainer.innerHTML =
        "";

    const months =
        getAllMonths();

    if (
        months.length === 0
    ) {

        historyContainer.innerHTML =
            `
            <p>
                No hay historial.
            </p>
            `;

        return;
    }

    months.forEach(
        ([monthKey, data]) => {

            const total =
                data.contributions
                .reduce(
                    (sum, item) =>
                        sum +
                        item.amount,
                    0
                );

            const goal =
                data.dailyAmount *
                getDaysInMonthKey(
                    monthKey
                );

            const percent =
                goal > 0
                    ? (
                        total /
                        goal
                    ) * 100
                    : 0;

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "history-item";

            div.innerHTML = `
                <h3>
                    ${data.monthName}
                </h3>

                <p>
                    Meta:
                    ${goal} Bs
                </p>

                <p>
                    Ahorrado:
                    ${total} Bs
                </p>

                <p>
                    ${percent.toFixed(0)}%
                </p>
            `;

            historyContainer.appendChild(
                div
            );

        }
    );

}

/* ================================= */
/* SOPORTE HISTORIAL */
/* ================================= */

function getDaysInMonthKey(
    monthKey
) {

    const parts =
        monthKey.split("-");

    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    return new Date(
        year,
        month,
        0
    ).getDate();

}

/* ================================= */
/* ACTUALIZAR */
/* ================================= */

function refreshAll() {

    loadDashboard();

    renderPeople();

    renderContributions();

    renderHistory();

}

/* ================================= */
/* INICIO */
/* ================================= */

window.addEventListener(
    "load",
    () => {

        createMonthIfNeeded();

    }
);