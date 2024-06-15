/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: "Jonas Schmedtmann",
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2,
    pin: 1111,
};

const account2 = {
    owner: "Jessica Davis",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
};

const account3 = {
    owner: "Steven Thomas Williams",
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
};

const account4 = {
    owner: "Sarah Smith",
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
    ["USD", "United States dollar"],
    ["EUR", "Euro"],
    ["GBP", "Pound sterling"],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// 1__Вывести все транзакции
const displayMovements = function (movements, sort = false) {
    containerMovements.innerHTML = "";

    const movs = sort
        ? movements.slice().sort(function (a, b) {
              return a - b;
          })
        : movements;

    movs.forEach(function (mov, index) {
        const type = mov > 0 ? "deposit" : "withdrawal";
        const html = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">
                    ${index + 1} ${type}</div>
                <div class="movements__value">${mov}€</div>
            </div>`;

        containerMovements.insertAdjacentHTML("afterBegin", html);
    });
};

// 3__Посчитать и вывести баланс из операций
const calcDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce(function (totalBalance, movement) {
        return totalBalance + movement;
    }, 0);

    labelBalance.textContent = `${acc.balance}€`;
};

// 4__Показать сумму по пополнениям\выводам
const calcDisplaySummary = function (acc) {
    const incomes = acc.movements
        .filter(function (movement) {
            if (movement > 0) return movement;
        })
        .reduce(function (total, movement) {
            return total + movement;
        }, 0);
    labelSumIn.textContent = `${incomes}€`;

    const outcomes = acc.movements
        .filter(function (movement) {
            if (movement < 0) return movement;
        })
        .reduce(function (total, movement) {
            return total + movement;
        }, 0);
    labelSumOut.textContent = `${Math.abs(outcomes)}€`;

    const interest = acc.movements
        .filter(function (movement) {
            if (movement > 0) return movement;
        })
        .map(function (deposit) {
            return (deposit * acc.interestRate) / 100;
        })
        .filter(function (interest) {
            return interest >= 1;
        })
        .reduce(function (total, interest) {
            return total + interest;
        }, 0);
    labelSumInterest.textContent = `${interest}€`;
};

// 2__Создать никнейм пользователя
// Берем массив объектов-аккаунтов (accs), и для каждого аккаунта добавляем ключ username,
// который равен Имени владельца аккаунта (accountObj.owner), но с изменениями на буквы
const createUsernames = function (accs) {
    accs.forEach(function (accountObj) {
        accountObj.username = accountObj.owner
            .toLowerCase()
            .split(" ")
            .map(function (name) {
                return name[0];
            })
            .join("");
    });
};

createUsernames(accounts);

// 6.1__Обновить интерфейс по транзакциям
const updateUI = function (acc) {
    // Отобразить транзакции
    displayMovements(acc.movements);

    // Отобразить баланс
    calcDisplayBalance(acc);

    // Отобразить суммы по пополнениям\выводам
    calcDisplaySummary(acc);
};

// 5__ЛОГИН
let currentUser;

btnLogin.addEventListener("click", function (e) {
    e.preventDefault();

    // Если никнейм есть в массиве, создается залогиненый пользователь
    currentUser = accounts.find(function (acc) {
        return acc.username === inputLoginUsername.value;
    });

    // Если пароль залог. пользователя равен введенному
    if (currentUser?.pin === Number(inputLoginPin.value)) {
        // Поменять приветствие
        labelWelcome.textContent = `Welcome back, ${currentUser.owner.split(" ")[0]}`;

        // Отобразить интерфейс
        containerApp.style.opacity = 100;

        // Очистить поля ввода
        inputLoginUsername.value = inputLoginPin.value = "";
        inputLoginPin.blur();

        // Обновить интерфейс
        updateUI(currentUser);
    }
});

// 6__Перевод денег другому пользователю
btnTransfer.addEventListener("click", function (e) {
    e.preventDefault();

    const amount = Number(inputTransferAmount.value);
    // Находим получателя
    const receiverAcc = accounts.find(function (acc) {
        return acc.username === inputTransferTo.value;
    });
    inputTransferAmount.value = inputTransferTo.value = "";

    if (amount > 0 && receiverAcc && currentUser.balance >= amount && receiverAcc?.username !== currentUser.username) {
        // Переводы
        currentUser.movements.push(-amount);
        receiverAcc.movements.push(amount);

        // Обновить интерфейс
        updateUI(currentUser);
    }
});

// 8__Запрос на кредит
// Работает, если есть хотя бы одно пополнение >= 10% от кредита.
btnLoan.addEventListener("click", function (e) {
    e.preventDefault();

    const amount = Number(inputLoanAmount.value);
    if (
        amount > 0 &&
        currentUser.movements.some(function (movement) {
            return movement >= amount * 0.1;
        })
    ) {
        // Добавление суммы кредита
        currentUser.movements.push(amount);

        // Обновление интерфейса
        updateUI(currentUser);
    }
    inputLoanAmount.value = "";
});

// 7__Удаление аккаунта (из массива)
btnClose.addEventListener("click", function (e) {
    e.preventDefault();

    if (currentUser.username === inputCloseUsername.value && currentUser.pin === Number(inputClosePin.value)) {
        const index = accounts.findIndex(function (acc) {
            return acc.username === currentUser.username;
        });

        // Удалить аккаунт
        accounts.splice(index, 1);

        // Скрыть интерфейс
        containerApp.style.opacity = 0;
    }
    // Сброс полей ввода
    inputCloseUsername.value = inputClosePin.value = "";
});

// 9__Сортировка переводов по возрастанию
let sorted = false;

btnSort.addEventListener("click", function (e) {
    e.preventDefault();
    displayMovements(currentUser.movements, !sorted);
    sorted = !sorted;
});
