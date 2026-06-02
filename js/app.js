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

            if (
                targetView ===
                "historyView" &&
                typeof renderHistory ===
                "function"
            ) {
                renderHistory();
            }

        }
    );

});

/* ================================= */
/* TRAS CAMBIOS EN APORTES */
/* ================================= */

function refreshAfterContributionChange() {

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
        typeof renderHistory ===
        "function"
    ) {
        renderHistory();
    }

}

/* ================================= */
/* DASHBOARD */
/* ================================= */

function loadDashboard() {

    const totalSaved =
        getTotalSaved();

    const goal =
        getMonthlyGoal();

    const coveredDays =
        getCoveredDays();

    const percent =
        getProgressPercent();

    const daysInMonth =
        getDaysInCurrentMonth();

    const goals = getGoals();

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

    const dailySummary =
        goals.length === 1
            ? `${goals[0].dailyAmount} Bs`
            : `${goals.length} metas`;

    document
        .getElementById(
            "dailyValue"
        )
        .textContent =
        dailySummary;

    document
        .getElementById(
            "coveredDays"
        )
        .textContent =
        `${coveredDays} días marcados`;

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

    renderGoalsDashboard(
        goals,
        daysInMonth
    );

}

function renderGoalsDashboard(
    goals,
    daysInMonth
) {

    const container =
        document.getElementById(
            "goalsDashboard"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (goals.length === 0) {
        return;
    }

    goals.forEach(goal => {

        const saved =
            getTotalSavedForGoal(
                goal.id
            );

        const target =
            goal.dailyAmount *
            daysInMonth;

        const percent =
            getProgressPercentForGoal(
                goal.id
            );

        const covered =
            goal.coveredDays || [];

        const section =
            document.createElement(
                "div"
            );

        section.className =
            "goal-dashboard-card";

        section.innerHTML = `
            <h3>🎯 ${goal.name}</h3>
            <p>${goal.dailyAmount} Bs/día · ${saved} / ${target} Bs (${percent.toFixed(0)}%)</p>
            <p class="goal-days-count">${covered.length} / ${daysInMonth} días</p>
            <div class="calendar-grid" data-goal-id="${goal.id}"></div>
        `;

        container.appendChild(
            section
        );

        const grid =
            section.querySelector(
                ".calendar-grid"
            );

        renderCalendarGrid(
            grid,
            daysInMonth,
            covered
        );

    });

}

function renderCalendarGrid(
    container,
    daysInMonth,
    coveredDays
) {

    container.innerHTML = "";

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement(
                "div"
            );

        cell.className =
            "calendar-day";

        if (
            coveredDays.includes(
                day
            )
        ) {
            cell.classList.add(
                "covered"
            );
        }

        cell.textContent = day;

        container.appendChild(
            cell
        );

    }

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

            migrateMonth(data);

            const total =
                data.contributions
                .reduce(
                    (sum, item) =>
                        sum +
                        item.amount,
                    0
                );

            const days =
                getDaysInMonthKey(
                    monthKey
                );

            const goalTotal =
                (data.goals || [])
                .reduce(
                    (sum, g) =>
                        sum +
                        g.dailyAmount *
                        days,
                    0
                );

            const legacyGoal =
                data.dailyAmount *
                days;

            const goal =
                goalTotal > 0
                    ? goalTotal
                    : legacyGoal;

            const percent =
                goal > 0
                    ? (
                        total /
                        goal
                    ) * 100
                    : 0;

            const goalsText =
                (data.goals || [])
                .map(
                    g => g.name
                )
                .join(", ") ||
                "—";

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
                    Metas:
                    ${goalsText}
                </p>

                <p>
                    Meta total:
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
