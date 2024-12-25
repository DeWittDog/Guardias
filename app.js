document.addEventListener("DOMContentLoaded", function () {
    const calendarContainer = document.querySelector(".calendar-container");
    const calendar = document.getElementById("calendar");
    const startButton = document.getElementById("start");
    const usernameInput = document.getElementById("username");
    const welcomeMessage = document.getElementById("welcome-message");
    const submitButton = document.getElementById("submit");

    const maxDaysPerPerson = 4;
    const maxQuotaPerDay = 5;

    let daysState = Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        quota: 0,
        selectedBy: [],
    }));

    let selectedDays = [];
    let currentUser = "";
    const currentMonth = new Date().getMonth() + 1;

    // Cargar usuarios registrados desde localStorage
    function loadRegisteredUsers() {
        const data = JSON.parse(localStorage.getItem("registeredUsers")) || {};
        const storedMonth = data.month || null;
        const days = data.days || daysState;

        // Si el mes almacenado no coincide con el mes actual, reiniciar
        if (storedMonth !== currentMonth) {
            saveRegisteredUsers([]); // Reiniciar los datos
            return { month: currentMonth, days: daysState };
        }

        daysState = days; // Actualizar el estado de los días
        return { month: storedMonth, days };
    }

    // Guardar usuarios registrados en localStorage
    function saveRegisteredUsers(updatedDays) {
        const data = {
            month: currentMonth,
            days: updatedDays || daysState,
        };
        localStorage.setItem("registeredUsers", JSON.stringify(data));
    }

    // Manejo del botón "Iniciar"
    startButton.addEventListener("click", function () {
        const username = usernameInput.value.trim();
        if (!username) {
            alert("Por favor, ingrese su nombre.");
            return;
        }

        // Verificar si el usuario ya seleccionó días
        const userAlreadyRegistered = daysState.some((day) =>
            day.selectedBy.includes(username)
        );

        if (userAlreadyRegistered) {
            alert(`El usuario "${username}" ya seleccionó días este mes.`);
            return;
        }

        currentUser = username;
        welcomeMessage.textContent = `Hola, ${currentUser}. Selecciona tus días:`;
        calendarContainer.style.display = "block"; // Mostrar calendario
        generateCalendar(); // Generar el calendario
    });

    // Generar el calendario
    function generateCalendar() {
        calendar.innerHTML = ""; // Limpiar el calendario existente
        daysState.forEach((dayState) => {
            const dayElement = document.createElement("div");
            dayElement.className = "day";
            dayElement.textContent = dayState.day;
            dayElement.dataset.day = dayState.day;

            const quotaElement = document.createElement("span");
            quotaElement.className = "quota";
            quotaElement.textContent = `(${dayState.quota}/${maxQuotaPerDay})`;
            dayElement.appendChild(quotaElement);

            if (dayState.quota >= maxQuotaPerDay) {
                dayElement.classList.add("disabled");
            }

            dayElement.addEventListener("click", function () {
                handleDaySelection(dayState, dayElement);
            });

            calendar.appendChild(dayElement);
        });
    }

    // Manejar la selección de días
    function handleDaySelection(dayState, dayElement) {
        if (dayState.quota >= maxQuotaPerDay) {
            alert("Este día ya alcanzó el cupo máximo.");
            return;
        }

        if (selectedDays.includes(dayState.day)) {
            // Deseleccionar
            selectedDays = selectedDays.filter((day) => day !== dayState.day);
            dayState.quota -= 1;
            dayState.selectedBy = dayState.selectedBy.filter(
                (user) => user !== currentUser
            );
            dayElement.classList.remove("selected");
        } else {
            if (selectedDays.length >= maxDaysPerPerson) {
                alert(`Solo puedes seleccionar hasta ${maxDaysPerPerson} días.`);
                return;
            }

            // Seleccionar
            selectedDays.push(dayState.day);
            dayState.quota += 1;
            dayState.selectedBy.push(currentUser);
            dayElement.classList.add("selected");
        }

        // Actualizar la cuota visualmente
        dayElement.querySelector(".quota").textContent = `(${dayState.quota}/${maxQuotaPerDay})`;
    }

    // Manejar el envío del formulario
    submitButton.addEventListener("click", function () {
        if (selectedDays.length === 0) {
            alert("Debe seleccionar al menos un día.");
            return;
        }

        alert(`Usuario: ${currentUser}\nDías seleccionados: ${selectedDays.join(", ")}`);

        saveRegisteredUsers(daysState); // Guardar la selección en localStorage

        // Reiniciar para el siguiente usuario
        currentUser = "";
        selectedDays = [];
        usernameInput.value = "";
        calendarContainer.style.display = "none";
    });

    // Cargar datos al iniciar
    loadRegisteredUsers();
});
