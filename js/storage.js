/* ================================= */
/* CONSTANTES */
/* ================================= */

const STORAGE_KEY = "alcanciaDigital";

/* ================================= */
/* FECHAS */
/* ================================= */

function getCurrentMonthKey() {

    const now = new Date();

    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`;

}

function getDaysInCurrentMonth() {

    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
    ).getDate();

}

function getMonthName(date = new Date()) {

    const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];

    return `${meses[date.getMonth()]} ${date.getFullYear()}`;

}

/* ================================= */
/* BASE */
/* ================================= */

function getDatabase() {

    const data = localStorage.getItem(
        STORAGE_KEY
    );

    if (!data) {

        return {

            pin: null,

            currentMonth: null,

            months: {}

        };

    }

    return JSON.parse(data);

}

function saveDatabase(db) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(db)
    );

}

/* ================================= */
/* PIN */
/* ================================= */

function savePin(pin) {

    const db = getDatabase();

    db.pin = pin;

    saveDatabase(db);

}

function getPin() {

    return getDatabase().pin;

}

/* ================================= */
/* MIGRACIÓN Y METAS */
/* ================================= */

function migrateMonth(month) {

    if (!month.goals) {
        month.goals = [];
    }

    if (
        month.goals.length === 0 &&
        month.dailyAmount > 0
    ) {

        month.goals.push({

            id: Date.now(),

            name: "Ahorro general",

            dailyAmount: month.dailyAmount,

            coveredDays: []

        });

    }

    month.goals.forEach(goal => {

        if (!goal.coveredDays) {
            goal.coveredDays = [];
        }

    });

    month.contributions.forEach(c => {

        if (!c.goalId && month.goals.length > 0) {
            c.goalId = month.goals[0].id;
        }

    });

    recalculateAllGoalsCoveredDays(month);

}

function markDaysFromPool(
    pool,
    dailyAmount,
    covered,
    daysInMonth
) {

    let added = 0;

    while (
        pool >= dailyAmount &&
        covered.length < daysInMonth
    ) {

        pool -= dailyAmount;

        let day = 1;

        while (
            day <= daysInMonth &&
            covered.includes(day)
        ) {
            day++;
        }

        if (day <= daysInMonth) {
            covered.push(day);
            added++;
        }

    }

    return { pool, added };

}

function calculateGoalCoverage(
    month,
    goalId,
    monthKey
) {

    const goal = month.goals.find(
        g => g.id === goalId
    );

    if (!goal || goal.dailyAmount <= 0) {
        return {
            covered: [],
            pool: 0
        };
    }

    const daysInMonth =
        getDaysInMonthFromKey(
            monthKey ||
            getCurrentMonthKey()
        );

    const covered = [];

    let pool = 0;

    const contributions =
        month.contributions
        .filter(
            c =>
                c.goalId ===
                goalId
        )
        .sort(
            (a, b) => a.id - b.id
        );

    contributions.forEach(c => {

        pool += c.amount;

        const result =
            markDaysFromPool(
                pool,
                goal.dailyAmount,
                covered,
                daysInMonth
            );

        pool = result.pool;

        c.daysMarked = result.added;

    });

    return { covered, pool };

}

function recalculateGoalCoveredDays(
    month,
    goalId,
    monthKey
) {

    const goal = month.goals.find(
        g => g.id === goalId
    );

    if (!goal) {
        return;
    }

    if (goal.dailyAmount <= 0) {

        goal.coveredDays = [];
        goal.pendingPool = 0;

        return;

    }

    const result =
        calculateGoalCoverage(
            month,
            goalId,
            monthKey
        );

    goal.coveredDays =
        result.covered;

    goal.pendingPool =
        result.pool;

}

function recalculateAllGoalsCoveredDays(
    month,
    monthKey
) {

    month.goals.forEach(goal => {

        recalculateGoalCoveredDays(
            month,
            goal.id,
            monthKey
        );

    });

}

function getDaysInMonthFromKey(
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
/* CREAR MES */
/* ================================= */

function createMonthIfNeeded() {

    const db = getDatabase();

    const currentKey =
        getCurrentMonthKey();

    if (
        db.currentMonth ===
        currentKey
    ) {

        if (db.months[currentKey]) {
            migrateMonth(
                db.months[currentKey]
            );
            saveDatabase(db);
        }

        return;

    }

    db.currentMonth =
        currentKey;

    if (
        !db.months[currentKey]
    ) {

        const date =
            new Date();

        db.months[currentKey] = {

            monthName:
                getMonthName(
                    date
                ),

            dailyAmount: 0,

            goals: [],

            createdAt:
                date.toISOString(),

            people: [],

            contributions: []

        };

    } else {

        migrateMonth(
            db.months[currentKey]
        );

    }

    saveDatabase(db);

}

/* ================================= */
/* CONFIGURACIÓN */
/* ================================= */

function setDailyAmount(amount) {

    const db = getDatabase();

    createMonthIfNeeded();

    db.months[
        db.currentMonth
    ].dailyAmount = Number(amount);

    saveDatabase(db);

}

function getCurrentMonthData() {

    const db = getDatabase();

    createMonthIfNeeded();

    const month =
        db.months[
            db.currentMonth
        ];

    migrateMonth(month);

    return month;

}

function monthHasGoals() {

    const month =
        getCurrentMonthData();

    return (
        month.goals &&
        month.goals.length > 0 &&
        month.goals.some(
            g => g.dailyAmount > 0
        )
    );

}

/* ================================= */
/* METAS */
/* ================================= */

function addGoal(name, dailyAmount) {

    const db = getDatabase();

    createMonthIfNeeded();

    const month =
        db.months[db.currentMonth];

    migrateMonth(month);

    month.goals.push({

        id: Date.now(),

        name,

        dailyAmount: Number(dailyAmount),

        coveredDays: []

    });

    saveDatabase(db);

}

function removeGoal(id) {

    const db = getDatabase();

    const month =
        db.months[db.currentMonth];

    month.goals =
        month.goals.filter(
            g => g.id !== id
        );

    month.contributions =
        month.contributions.filter(
            c => c.goalId !== id
        );

    recalculateAllGoalsCoveredDays(
        month
    );

    saveDatabase(db);

}

function getGoals() {

    return getCurrentMonthData().goals || [];

}

function getGoalById(id) {

    return getGoals().find(
        g =>
            g.id ===
            Number(id)
    );

}

/* ================================= */
/* PERSONAS */
/* ================================= */

function addPerson(name) {

    const db = getDatabase();

    const month =
        db.months[db.currentMonth];

    month.people.push({

        id: Date.now(),

        name

    });

    saveDatabase(db);

}

function removePerson(id) {

    const db = getDatabase();

    const month =
        db.months[
            db.currentMonth
        ];

    month.people =
        month.people.filter(
            p => p.id !== id
        );

    month.contributions =
        month.contributions.filter(
            c => c.personId !== id
        );

    recalculateAllGoalsCoveredDays(
        month
    );

    saveDatabase(db);

}

function getPeople() {

    return getCurrentMonthData()
        .people;

}

/* ================================= */
/* APORTES */
/* ================================= */

function addContribution(data) {

    createMonthIfNeeded();

    const db = getDatabase();

    const month =
        db.months[
            db.currentMonth
        ];

    migrateMonth(month);

    const goal =
        month.goals.find(
            g =>
                g.id ===
                Number(data.goalId)
        );

    month.contributions.push({

        id: Date.now(),

        personId: data.personId,

        personName: data.personName,

        goalId: data.goalId,

        goalName: goal
            ? goal.name
            : "",

        amount: Number(data.amount),

        daysMarked: 0,

        date:
            new Date().toLocaleString(
                "es-BO",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )

    });

    recalculateAllGoalsCoveredDays(
        month
    );

    saveDatabase(db);

}

function updateContribution(
    id,
    amount,
    goalId
) {

    const db = getDatabase();

    const month =
        db.months[db.currentMonth];

    const item =
        month.contributions.find(
            c => c.id === id
        );

    if (!item) return;

    item.amount = Number(amount);

    const goal =
        month.goals.find(
            g =>
                g.id ===
                Number(goalId)
        );

    item.goalId = Number(goalId);

    item.goalName = goal
        ? goal.name
        : "";

    recalculateAllGoalsCoveredDays(
        month
    );

    saveDatabase(db);

}

function deleteContribution(id) {

    const db = getDatabase();

    const month =
        db.months[db.currentMonth];

    month.contributions =
        month.contributions.filter(
            c => c.id !== id
        );

    recalculateAllGoalsCoveredDays(
        month
    );

    saveDatabase(db);

}

function getContributions() {

    return getCurrentMonthData()
        .contributions;

}

function getDaysMarkedForAmount(
    amount,
    goalId,
    excludeContributionId = null
) {

    const month =
        getCurrentMonthData();

    const gid =
        Number(goalId);

    const goal =
        month.goals.find(
            g => g.id === gid
        );

    const value =
        Number(amount);

    if (
        !goal ||
        goal.dailyAmount <= 0 ||
        value <= 0
    ) {
        return 0;
    }

    const daysInMonth =
        getDaysInCurrentMonth();

    const covered = [];

    let pool = 0;

    const contributions =
        month.contributions
        .filter(
            c =>
                c.goalId === gid &&
                c.id !==
                excludeContributionId
        )
        .sort(
            (a, b) => a.id - b.id
        );

    contributions.forEach(c => {

        pool += c.amount;

        const result =
            markDaysFromPool(
                pool,
                goal.dailyAmount,
                covered,
                daysInMonth
            );

        pool = result.pool;

    });

    const before =
        covered.length;

    pool += value;

    markDaysFromPool(
        pool,
        goal.dailyAmount,
        covered,
        daysInMonth
    );

    return (
        covered.length - before
    );

}

function getPoolRemainderForGoal(
    goalId,
    extraAmount = 0,
    excludeContributionId = null
) {

    const month =
        getCurrentMonthData();

    const gid =
        Number(goalId);

    const goal =
        month.goals.find(
            g => g.id === gid
        );

    if (
        !goal ||
        goal.dailyAmount <= 0
    ) {
        return 0;
    }

    let pool = 0;

    month.contributions
        .filter(
            c =>
                c.goalId === gid &&
                c.id !==
                excludeContributionId
        )
        .sort(
            (a, b) => a.id - b.id
        )
        .forEach(c => {

            pool += c.amount;

            while (
                pool >=
                goal.dailyAmount
            ) {
                pool -=
                    goal.dailyAmount;
            }

        });

    pool += Number(extraAmount) || 0;

    while (
        pool >= goal.dailyAmount
    ) {
        pool -= goal.dailyAmount;
    }

    return pool;

}

function getPendingForNextDay(
    goalId,
    extraAmount = 0,
    excludeContributionId = null
) {

    const goal =
        getGoalById(
            Number(goalId)
        );

    if (
        !goal ||
        goal.dailyAmount <= 0
    ) {
        return 0;
    }

    const remainder =
        getPoolRemainderForGoal(
            goalId,
            extraAmount,
            excludeContributionId
        );

    if (remainder <= 0) {
        return goal.dailyAmount;
    }

    return (
        goal.dailyAmount -
        remainder
    );

}

/* ================================= */
/* MÉTRICAS */
/* ================================= */

function getTotalSaved() {

    return getContributions()
        .reduce(
            (sum, item) =>
                sum + item.amount,
            0
        );

}

function getTotalSavedForGoal(
    goalId
) {

    return getContributions()
        .filter(
            c => c.goalId === goalId
        )
        .reduce(
            (sum, item) =>
                sum + item.amount,
            0
        );

}

function getMonthlyGoal() {

    const goals = getGoals();

    const days =
        getDaysInCurrentMonth();

    return goals.reduce(
        (sum, goal) =>
            sum +
            goal.dailyAmount * days,
        0
    );

}

function getCoveredDays() {

    const goals = getGoals();

    if (goals.length === 0) {
        return 0;
    }

    return goals.reduce(
        (sum, goal) =>
            sum +
            (goal.coveredDays || [])
            .length,
        0
    );

}

function getCoveredDaysForGoal(
    goalId
) {

    const goal =
        getGoalById(goalId);

    if (!goal) {
        return 0;
    }

    return (
        goal.coveredDays || []
    ).length;

}

function getProgressPercent() {

    const goal =
        getMonthlyGoal();

    if (goal <= 0) {
        return 0;
    }

    return Math.min(
        100,
        (
            getTotalSaved() /
            goal
        ) * 100
    );

}

function getProgressPercentForGoal(
    goalId
) {

    const goal =
        getGoalById(goalId);

    if (!goal) {
        return 0;
    }

    const target =
        goal.dailyAmount *
        getDaysInCurrentMonth();

    if (target <= 0) {
        return 0;
    }

    return Math.min(
        100,
        (
            getTotalSavedForGoal(
                goalId
            ) /
            target
        ) * 100
    );

}

/* ================================= */
/* HISTORIAL */
/* ================================= */

function getAllMonths() {

    const db = getDatabase();

    return Object.entries(
        db.months
    ).reverse();

}
