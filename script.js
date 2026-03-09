document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    // Inputs
    const incomeInput = document.getElementById('income');
    const rentInput = document.getElementById('rent');
    const billsInput = document.getElementById('bills');
    const autoInput = document.getElementById('auto');
    const foodInput = document.getElementById('food');
    const extraInput = document.getElementById('extra');


    // Summary
    const summarySection = document.getElementById('summary-section');
    const summaryIncome = document.getElementById('summary-income');
    const summaryExpenses = document.getElementById('summary-expenses');
    const summaryRemaining = document.getElementById('summary-remaining');
    const adviceList = document.getElementById('advice-list');



    // Formatter per valuta
    const currency = new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    });

    function recalculateSummary() {
        const income = parseFloat(incomeInput.value) || 0;

        // Calcolo totale spese
        const rent = parseFloat(rentInput.value) || 0;
        const bills = parseFloat(billsInput.value) || 0;
        const auto = parseFloat(autoInput.value) || 0;
        const food = parseFloat(foodInput.value) || 0;
        const extra = parseFloat(extraInput.value) || 0;

        const totalExpenses = rent + bills + auto + food + extra;
        const remaining = income - totalExpenses;

        // Mostra risultati
        summaryIncome.textContent = currency.format(income);
        summaryExpenses.textContent = currency.format(totalExpenses);
        summaryRemaining.textContent = currency.format(remaining);

        // Aggiorna colore rimanenza in base al valore
        summaryRemaining.className = 'value'; // reseta classe
        if (remaining > 0) {
            summaryRemaining.classList.add('success');
        } else if (remaining < 0) {
            summaryRemaining.classList.add('danger');
        } else {
            summaryRemaining.classList.add('primary');
        }

        // Genera suggerimenti
        generateAdvice(income, rent, bills, auto, food, totalExpenses, remaining);

        // Mostra la sezione
        if (summarySection) summarySection.classList.remove('hidden');
    }



    function generateAdvice(income, rent, bills, auto, food, totalExpenses, remaining) {
        adviceList.innerHTML = ''; // Svuota lista

        const advices = [];

        if (income === 0) {
            advices.push("Inserisci il tuo reddito per ricevere consigli personalizzati.");
            renderAdvices(advices);
            return;
        }

        if (remaining < 0) {
            advices.push("<strong>Attenzione:</strong> Le tue spese superano le entrate. Rivedi immediatamente le spese non essenziali.");
        }

        // Regola 50/30/20 approssimata per fisse
        const fixedPercentage = (totalExpenses / income) * 100;
        if (fixedPercentage > 60) {
            advices.push(`Le tue spese fisse assorbono il <strong>${fixedPercentage.toFixed(1)}%</strong> del tuo reddito (si consiglia max 50%). Prova a rinegoziare bollette o affitto.`);
        }

        // Controllo Affitto
        if ((rent / income) > 0.35) {
            advices.push("L'affitto/mutuo supera il 35% del tuo stipendio. Potrebbe incidere sui tuoi risparmi a lungo termine.");
        }

        // Controllo Auto
        if ((auto / income) > 0.15) {
            advices.push("Spendi molto in trasporti. Valuta il car sharing, abbonamenti pubblici o usa l'auto solo quando strettamente necessario.");
        }

        // Suggerimento Risparmio se in positivo
        if (remaining > 0) {
            let suggestSave = remaining * 0.5; // Suggerisci di salvare metà della rimanenza
            advices.push(`Ti rimangono ${currency.format(remaining)}. Prova a mettere da parte <strong>${currency.format(suggestSave)}</strong> questo mese in un fondo di emergenza.`);
        }

        if (advices.length === 0) {
            advices.push("Le tue finanze sembrano bilanciate. Ottimo lavoro!");
        }

        renderAdvices(advices);
    }

    function renderAdvices(advices) {
        advices.forEach(advice => {
            const li = document.createElement('li');
            li.innerHTML = advice;
            adviceList.appendChild(li);
        });
    }

    // --- Calendar Logic ---
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarGrid = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // --- Event Modals Elements ---
    const dayDetailsModal = document.getElementById('day-details-modal');
    const closeDetailsModalBtn = document.getElementById('close-details-modal');
    const dayDetailsTitle = document.getElementById('day-details-title');
    const dayEventsList = document.getElementById('day-events-list');
    const openAddEventBtn = document.getElementById('open-add-event-btn');
    const deleteAllEventsBtn = document.getElementById('delete-all-events-btn');

    const eventModal = document.getElementById('event-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const saveEventBtn = document.getElementById('save-event-btn');
    const eventCategoryInput = document.getElementById('event-category');
    const eventAmountInput = document.getElementById('event-amount');

    let currentDate = new Date();
    let selectedDateInfo = null;

    // Carica budget mensili o array vuoto
    let monthlyBudgets = JSON.parse(localStorage.getItem('financeMonthlyBudgets')) || {};

    // Carica eventi o array vuoto
    let events = JSON.parse(localStorage.getItem('financeEvents')) || {};

    function saveCurrentMonthBudget() {
        if (!currentDate) return;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-11
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;

        monthlyBudgets[key] = {
            income: parseFloat(incomeInput.value) || 0,
            rent: parseFloat(rentInput.value) || 0,
            bills: parseFloat(billsInput.value) || 0,
            auto: parseFloat(autoInput.value) || 0,
            food: parseFloat(foodInput.value) || 0,
            extra: parseFloat(extraInput.value) || 0
        };

        localStorage.setItem('financeMonthlyBudgets', JSON.stringify(monthlyBudgets));
    }

    function loadCurrentMonthBudget() {
        if (!currentDate) return;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;

        const budget = monthlyBudgets[key] || { income: '', rent: '', bills: '', auto: '', food: '', extra: '' };

        // Se 0 nel salvataggio, lo mostriamo vuoto per pulizia a meno che non fosse intenzionale, ma lasciamo il fallback a stringa vuota per i mesi nuovi
        incomeInput.value = budget.income || '';
        rentInput.value = budget.rent || '';
        billsInput.value = budget.bills || '';
        autoInput.value = budget.auto || '';
        foodInput.value = budget.food || '';
        extraInput.value = budget.extra || '';

        // Mostra il summary se ci sono dati caricati
        recalculateSummary();
    }

    // Salva automaticamente input manuali
    const allBudgetInputs = [incomeInput, rentInput, billsInput, autoInput, foodInput, extraInput];
    allBudgetInputs.forEach(input => {
        if (input) {
            input.addEventListener('change', saveCurrentMonthBudget);
            input.addEventListener('input', recalculateSummary); // Calcolo in tempo reale
        }
    });



    const monthNames = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];

    // Mappa categorie per visualizzazione
    const categoryNames = {
        'income': 'Stipendio',
        'rent': 'Affitto / Mutuo',
        'bills': 'Bollette',
        'auto': 'Auto / Trasporti',
        'food': 'Spesa / Cibo',
        'extra': 'Spese Extra',
        'other': 'Altro'
    };

    // Mappa categorie in type (per il colore css: event-income, event-expense, event-other)
    const categoryToType = {
        'income': 'income',
        'rent': 'expense',
        'bills': 'expense',
        'auto': 'expense',
        'food': 'expense',
        'extra': 'expense',
        'other': 'other'
    };

    function renderCalendar() {
        if (!calendarGrid) {
            console.error("Calendar grid not found!");
            return;
        }
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        if (calendarMonthYear) calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Lunedì come primo giorno (0=Domenica -> diventa 6, altrimenti meno 1)
        const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        // Slot vuoti
        for (let i = 0; i < startingDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDiv);
        }

        const today = new Date();

        // Giorni
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';

            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                dayDiv.classList.add('today');
            }

            const dateNum = document.createElement('span');
            dateNum.className = 'date-num';
            dateNum.textContent = i;
            dayDiv.appendChild(dateNum);

            // Mostra eventi sulla griglia del calendario
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (events[dateStr]) {
                events[dateStr].forEach((evt, index) => {
                    const evtDiv = document.createElement('div');
                    evtDiv.className = `event-indicator event-${categoryToType[evt.category] || 'other'}`;

                    let amountStr = '';
                    if (evt.amount) {
                        const type = categoryToType[evt.category] || 'other';
                        const prefix = type === 'expense' ? '-' : (type === 'income' ? '+' : '');
                        amountStr = ` ${prefix}€${evt.amount}`;
                    }

                    const titleText = categoryNames[evt.category] || 'Altro';
                    evtDiv.textContent = `${titleText}${amountStr}`;

                    // Impediamo il click event bubble dalla griglia per far aprire sempre la Dettagli Modal per uniformità
                    evtDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openDayDetailsModal(dateStr, i, month, year);
                    });

                    dayDiv.appendChild(evtDiv);
                });
            }

            // Cliccando sul giorno intero si apre il riepilogo
            dayDiv.addEventListener('click', () => {
                openDayDetailsModal(dateStr, i, month, year);
            });

            calendarGrid.appendChild(dayDiv);
        }
    }

    function openDayDetailsModal(dateStr, day, month, year) {
        selectedDateInfo = dateStr;
        if (!dayDetailsModal) return;

        // Set title
        if (dayDetailsTitle) {
            dayDetailsTitle.textContent = `Eventi del ${day} ${monthNames[month]} ${year}`;
        }

        // Render Events
        if (dayEventsList) {
            dayEventsList.innerHTML = '';
            const dayEvents = events[dateStr] || [];

            if (dayEvents.length === 0) {
                dayEventsList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">Nessun evento registrato.</p>';
            } else {
                dayEvents.forEach((evt, index) => {
                    const evtItem = document.createElement('div');
                    evtItem.style.display = 'flex';
                    evtItem.style.justifyContent = 'space-between';
                    evtItem.style.alignItems = 'center';
                    evtItem.style.padding = '10px';
                    evtItem.style.borderBottom = '1px solid var(--panel-border)';
                    evtItem.style.marginBottom = '5px';

                    let amountStr = '';
                    if (evt.amount) {
                        const type = categoryToType[evt.category] || 'other';
                        const prefix = type === 'expense' ? '-' : (type === 'income' ? '+' : '');
                        amountStr = ` ${prefix}€${evt.amount}`;
                    }
                    const titleText = categoryNames[evt.category] || 'Altro';

                    evtItem.innerHTML = `
                        <div>
                            <span class="event-indicator event-${categoryToType[evt.category] || 'other'}" style="display:inline-block; margin-right: 10px;">${titleText}</span>
                            <span style="font-weight: 500;">${amountStr}</span>
                        </div>
                        <button class="icon-btn" aria-label="Elimina Evento" style="color: var(--danger);"><i class="fa-solid fa-trash"></i></button>
                    `;

                    // Eliminazione Singola
                    const deleteBtn = evtItem.querySelector('button');
                    deleteBtn.addEventListener('click', () => {
                        if (confirm(`Vuoi rimuovere l'evento "${titleText}"?`)) {
                            // Sincronizza con il budget: sottrai l'importo
                            if (evt.amount) {
                                const targetInput = document.getElementById(evt.category);
                                if (targetInput) {
                                    const currentVal = parseFloat(targetInput.value) || 0;
                                    targetInput.value = Math.max(0, currentVal - parseFloat(evt.amount));
                                    saveCurrentMonthBudget();
                                    recalculateSummary();
                                }
                            }

                            events[dateStr].splice(index, 1);
                            if (events[dateStr].length === 0) delete events[dateStr];
                            localStorage.setItem('financeEvents', JSON.stringify(events));
                            renderCalendar();
                            openDayDetailsModal(dateStr, day, month, year); // Refresh della vista
                        }
                    });

                    dayEventsList.appendChild(evtItem);
                });
            }
        }

        dayDetailsModal.classList.remove('hidden');
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            saveCurrentMonthBudget();
            currentDate.setMonth(currentDate.getMonth() - 1);
            loadCurrentMonthBudget();
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            saveCurrentMonthBudget();
            currentDate.setMonth(currentDate.getMonth() + 1);
            loadCurrentMonthBudget();
            renderCalendar();
        });
    }

    // --- Day Details Modal Actions ---
    if (closeDetailsModalBtn) {
        closeDetailsModalBtn.addEventListener('click', () => {
            if (dayDetailsModal) dayDetailsModal.classList.add('hidden');
        });
    }

    if (openAddEventBtn) {
        openAddEventBtn.addEventListener('click', () => {
            if (dayDetailsModal) dayDetailsModal.classList.add('hidden');
            if (eventModal) {
                eventModal.classList.remove('hidden');
                if (eventAmountInput) {
                    eventAmountInput.value = '';
                    eventAmountInput.focus();
                }
            }
        });
    }

    if (deleteAllEventsBtn) {
        deleteAllEventsBtn.addEventListener('click', () => {
            if (selectedDateInfo && events[selectedDateInfo]) {
                if (confirm(`Sei sicuro di voler eliminare TUTTI gli eventi di questa giornata?`)) {
                    // Sincronizza con il budget: sottrai tutti gli importi degli eventi del giorno
                    events[selectedDateInfo].forEach(evt => {
                        if (evt.amount) {
                            const targetInput = document.getElementById(evt.category);
                            if (targetInput) {
                                const currentVal = parseFloat(targetInput.value) || 0;
                                targetInput.value = Math.max(0, currentVal - parseFloat(evt.amount));
                            }
                        }
                    });
                    saveCurrentMonthBudget();
                    recalculateSummary();

                    // Svuota gli eventi di questa giornata in modo robusto
                    delete events[selectedDateInfo];
                    localStorage.setItem('financeEvents', JSON.stringify(events));

                    // Chiudi la modale dettaglio giorno dato che è vuota
                    if (dayDetailsModal) dayDetailsModal.classList.add('hidden');

                    // Aggiorna il calendario per rimuovere il badge
                    renderCalendar();
                }
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (eventModal) eventModal.classList.add('hidden');
        });
    }

    if (saveEventBtn) {
        saveEventBtn.addEventListener('click', () => {
            if (!eventCategoryInput) return;
            const category = eventCategoryInput.value;
            const amount = eventAmountInput ? parseFloat(eventAmountInput.value.trim()) : 0;

            if (selectedDateInfo) {
                if (!events[selectedDateInfo]) {
                    events[selectedDateInfo] = [];
                }
                const newEvent = { category };
                if (!isNaN(amount) && amount > 0) {
                    newEvent.amount = amount;

                    // Aggiorna campo corrispondente nel Budget
                    const targetInput = document.getElementById(category);
                    if (targetInput) {
                        const currentVal = parseFloat(targetInput.value) || 0;
                        targetInput.value = currentVal + amount;
                        // Rimosso il calcolo automatico su richiesta dell'utente
                        saveCurrentMonthBudget();
                        recalculateSummary();
                    }
                }

                events[selectedDateInfo].push(newEvent);
                localStorage.setItem('financeEvents', JSON.stringify(events));
                renderCalendar();
                if (eventModal) eventModal.classList.add('hidden');

                // Opzionale: riaprire il dettaglio giorno dopo aver salvato
                const [year, month, day] = selectedDateInfo.split('-');
                openDayDetailsModal(selectedDateInfo, parseInt(day), parseInt(month) - 1, parseInt(year));
            }
        });
    }

    // --- Tab Navigation Logic ---
    const navBtns = document.querySelectorAll('.app-nav .nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Rimuovi active da tutti i btn
            navBtns.forEach(b => b.classList.remove('active'));
            // Aggiungi active a questo btn
            btn.classList.add('active');

            // Nascondi tutte le tab
            tabPanes.forEach(pane => pane.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.add('hidden'));

            // Mostra tab selezionata
            const targetId = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.remove('hidden');
                targetPane.classList.add('active');

                // Se apriamo le statistiche, aggiorna il grafico
                if (targetId === 'tab-stats') {
                    renderYearlyChart();
                }
            }
        });
    });

    // --- Yearly Chart Logic ---
    let yearlyChartInstance = null;
    const yearlyTotalIncomeEl = document.getElementById('yearly-total-income');
    const statsYearTitle = document.getElementById('stats-year-title');
    const chartDetailsPanel = document.getElementById('chart-details');
    const noDataMsg = document.getElementById('no-data-msg');

    function renderYearlyChart() {
        const currentYear = currentDate.getFullYear();
        if (statsYearTitle) statsYearTitle.textContent = currentYear;

        let totalIncome = 0;
        const expensesByCategory = {
            'rent': 0,
            'bills': 0,
            'auto': 0,
            'food': 0,
            'extra': 0,
            'other': 0
        };

        let hasData = false;

        // 1. Aggrega dai budget mensili salvati (Valori base + eventi che hanno aggiornato i campi)
        for (let m = 1; m <= 12; m++) {
            const key = `${currentYear}-${String(m).padStart(2, '0')}`;
            const budget = monthlyBudgets[key];
            if (budget) {
                totalIncome += (parseFloat(budget.income) || 0);
                expensesByCategory['rent'] += (parseFloat(budget.rent) || 0);
                expensesByCategory['bills'] += (parseFloat(budget.bills) || 0);
                expensesByCategory['auto'] += (parseFloat(budget.auto) || 0);
                expensesByCategory['food'] += (parseFloat(budget.food) || 0);
                expensesByCategory['extra'] += (parseFloat(budget.extra) || 0);

                if (budget.income || budget.rent || budget.bills || budget.auto || budget.food || budget.extra) {
                    hasData = true;
                }
            }
        }

        // 2. Aggrega solo gli eventi "Altro" (quelli che non finiscono nei campi fissi)
        // Nota: Gli eventi come 'bollette' sono già inclusi nei campi sopra perché saveEventBtn aggiorna l'input e salva il budget.
        Object.keys(events).forEach(dateStr => {
            if (dateStr.startsWith(currentYear.toString())) {
                events[dateStr].forEach(evt => {
                    const amount = parseFloat(evt.amount) || 0;
                    if (amount > 0 && evt.category === 'other') {
                        expensesByCategory['other'] += amount;
                        hasData = true;
                    }
                });
            }
        });

        // Mostra stipendio totale anno
        if (yearlyTotalIncomeEl) {
            yearlyTotalIncomeEl.textContent = currency.format(totalIncome);
        }

        const ctx = document.getElementById('yearly-chart');
        if (!ctx) return;

        // Reset details panel
        if (chartDetailsPanel) {
            chartDetailsPanel.innerHTML = `
                <i class="fa-solid fa-hand-pointer" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-muted);">Clicca su una fetta del grafico a torta per visualizzare qui i dettagli della categoria di spesa.</p>
            `;
        }

        // Renderizza elenco risparmi mensili
        renderMonthlySavingsList(currentYear);

        const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);

        if (!hasData || totalExpenses === 0) {
            if (noDataMsg) noDataMsg.style.display = 'block';
            if (yearlyChartInstance) {
                yearlyChartInstance.destroy();
                yearlyChartInstance = null;
            }
            return;
        } else {
            if (noDataMsg) noDataMsg.style.display = 'none';
        }

        // Prepariamo i dati per Chart.js
        const labels = [];
        const data = [];
        const backgroundColors = [];
        const borderColors = [];

        // Mapping colori per categoria
        const colors = {
            'rent': { bg: 'rgba(239, 68, 68, 0.7)', border: '#ef4444' }, // Red
            'bills': { bg: 'rgba(245, 158, 11, 0.7)', border: '#f59e0b' }, // Orange/Warning
            'auto': { bg: 'rgba(56, 189, 248, 0.7)', border: '#38bdf8' }, // Sky Blue
            'food': { bg: 'rgba(16, 185, 129, 0.7)', border: '#10b981' }, // Emerald / Success
            'extra': { bg: 'rgba(168, 85, 247, 0.7)', border: '#a855f7' }, // Purple
            'other': { bg: 'rgba(148, 163, 184, 0.7)', border: '#94a3b8' } // Slate
        };

        const activeCategories = [];

        Object.keys(expensesByCategory).forEach(cat => {
            if (expensesByCategory[cat] > 0) {
                labels.push(categoryNames[cat]);
                data.push(expensesByCategory[cat]);
                backgroundColors.push(colors[cat].bg);
                borderColors.push(colors[cat].border);
                activeCategories.push(cat); // Teniamo traccia per il click
            }
        });

        if (yearlyChartInstance) {
            yearlyChartInstance.destroy();
        }

        yearlyChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Spese Annuali (€)',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                color: '#fff',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                family: "'Outfit', sans-serif",
                                size: 13
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += currency.format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const idx = elements[0].index;
                        const categoryName = labels[idx];
                        const amount = data[idx];

                        if (chartDetailsPanel) {
                            chartDetailsPanel.innerHTML = `
                                <h3 style="color: ${borderColors[idx]}; margin-bottom: 0.5rem; font-size: 1.4rem;">${categoryName}</h3>
                                <p style="font-size: 1.1rem;">Hai speso un totale di <strong style="color: white; font-size: 1.5rem;">${currency.format(amount)}</strong> in quest'anno per questa categoria.</p>
                                <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 10px;">Questa categoria rappresenta il <strong>${((amount / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%</strong> delle tue spese annuali tracciate.</p>
                            `;
                        }
                    }
                }
            }
        });
    }

    function renderMonthlySavingsList(year) {
        const savingsListEl = document.getElementById('monthly-savings-list');
        const yearlyTotalSavingsEl = document.getElementById('yearly-total-savings');
        if (!savingsListEl) return 0;

        savingsListEl.innerHTML = '';
        let totalYearlySavings = 0;

        for (let m = 0; m < 12; m++) {
            const key = `${year}-${String(m + 1).padStart(2, '0')}`;
            const budget = monthlyBudgets[key] || { income: 0, rent: 0, bills: 0, auto: 0, food: 0, extra: 0 };

            let monthIncome = parseFloat(budget.income) || 0;
            let monthExpenses = (parseFloat(budget.rent) || 0) +
                (parseFloat(budget.bills) || 0) +
                (parseFloat(budget.auto) || 0) +
                (parseFloat(budget.food) || 0) +
                (parseFloat(budget.extra) || 0);

            // Aggiungi solo eventi 'other' (gli altri sono già nel budget sopra)
            Object.keys(events).forEach(dateStr => {
                if (dateStr.startsWith(key)) {
                    events[dateStr].forEach(evt => {
                        const amount = parseFloat(evt.amount) || 0;
                        if (evt.category === 'other') {
                            monthExpenses += amount;
                        }
                    });
                }
            });

            const balance = monthIncome - monthExpenses;
            totalYearlySavings += balance;

            // Crea card per il mese
            const monthCard = document.createElement('div');
            monthCard.className = 'saving-card glass-panel';
            monthCard.style.padding = '1.2rem';
            monthCard.style.textAlign = 'center';
            monthCard.style.borderRadius = '16px';
            monthCard.style.border = '1px solid var(--panel-border)';

            const isPositive = balance >= 0;
            const statusClass = isPositive ? 'success' : 'danger';
            const icon = isPositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';

            monthCard.innerHTML = `
                <span class="month-name" style="display: block; font-weight: 500; margin-bottom: 0.5rem;">${monthNames[m]}</span>
                <div class="balance-value ${statusClass}" style="font-size: 1.3rem; font-weight: 700;">
                    ${currency.format(balance)}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
                    <i class="fa-solid ${icon}"></i> Rimanenza
                </div>
            `;

            savingsListEl.appendChild(monthCard);
        }

        // Mostra Risparmio Totale Annuo
        if (yearlyTotalSavingsEl) {
            yearlyTotalSavingsEl.textContent = currency.format(totalYearlySavings);
            yearlyTotalSavingsEl.className = totalYearlySavings >= 0 ? 'success' : 'danger';
        }
    }

    // Inizializza Calendario e Budget di questo mese
    loadCurrentMonthBudget();
    renderCalendar();
});
