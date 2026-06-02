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

            createdAt:
                date.toISOString(),

            people: [],

            contributions: []

        };

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

    return db.months[
        db.currentMonth
    ];

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

    month.contributions.push({

        id: Date.now(),

        personId: data.personId,

        personName: data.personName,

        amount: Number(data.amount),

        comment: data.comment,

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

    saveDatabase(db);

}
function updateContribution(
    id,
    amount,
    comment
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

    item.comment = comment;

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

    saveDatabase(db);

}

function getContributions() {

    return getCurrentMonthData()
        .contributions;

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

function getMonthlyGoal() {

    const month =
        getCurrentMonthData();

    return (
        month.dailyAmount *
        getDaysInCurrentMonth()
    );

}

function getCoveredDays() {

    const month =
        getCurrentMonthData();

    if (
        month.dailyAmount <= 0
    ) {
        return 0;
    }

    return Math.floor(
        getTotalSaved() /
        month.dailyAmount
    );

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

/* ================================= */
/* HISTORIAL */
/* ================================= */

function getAllMonths() {

    const db = getDatabase();

    return Object.entries(
        db.months
    ).reverse();

}