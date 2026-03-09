document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    // Inputs
    const incomeInput = document.getElementById('income');
    const rentInput = document.getElementById('rent');
    const billsInput = document.getElementById('bills');
    const autoInput = document.getElementById('auto');
    const foodInput = document.getElementById('food');
    const extraInput = document.getElementById('extra');
    const calcBtn = document.getElementById('calculate-btn');

    // Summary
    const summarySection = document.getElementById('summary-section');
    const summaryIncome = document.getElementById('summary-income');
    const summaryExpenses = document.getElementById('summary-expenses');
    const summaryRemaining = document.getElementById('summary-remaining');
    const adviceList = document.getElementById('advice-list');

    // Chat
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Formatter per valuta
    const currency = new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    });

    // --- Logic: Calcolo Resoconto ---
    calcBtn.addEventListener('click', () => {
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

        // Mostra la sezione con un'animazione
        summarySection.classList.remove('hidden');

        // Scroll verso la sezione sui dispositivi mobili
        if (window.innerWidth <= 900) {
            summarySection.scrollIntoView({ behavior: 'smooth' });
        }

        // Invia messaggio automatico all'AI
        if (income > 0) {
            addAIMessage(`Ho analizzato il tuo bilancio. Hai una rimanenza di ${currency.format(remaining)}. Posso darti consigli su come gestirla al meglio!`);
        }
    });

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


    // --- Logic: AI Chat ---

    // Possibili risposte dell'AI mock
    const aiResponses = [
        "Un ottimo modo per investire è iniziare con gli ETF (Exchange Traded Funds) per diversificare i rischi. Ma dipende dal tuo orizzonte temporale.",
        "Per risparmiare sulle bollette, controlla se hai elettrodomestici che consumano anche in standby o cambia fornitore energetico.",
        "La regola d'oro del risparmio è la 50/30/20: 50% spese essenziali, 30% svago, 20% risparmi e investimenti.",
        "Prima di investire, assicurati di avere un \"fondo di emergenza\" che copra almeno 3-6 mesi delle tue spese fisse.",
        "Tagliare le piccole spese quotidiane (come il caffè al bar o gli innumerevoli abbonamenti) può farti risparmiare centinaia di euro all'anno.",
        "Ti consiglio di automatizzare i tuoi risparmi: imposta un bonifico automatico verso il tuo conto risparmio il giorno dopo che ricevi lo stipendio."
    ];

    async function handleChatSubmit() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Mostra messaggio utente
        addUserMessage(text);
        chatInput.value = '';

        // 2. Mostra typing indicator
        showTypingIndicator();

        try {
            // Chiamata all'API (come da file originale utente)
            let risposta = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer AIzaSyAZdPiRm8jOqknwW54ENGui7YgPkFDFiF8"
                },
                body: JSON.stringify({
                    model: "gemini-2.5-flash",
                    messages: [
                        { role: "system", content: "Sei un assistente finanziario personale che dà consigli molto utili, concisi e professionali. Rispondi usando formattazione semplice leggibile." },
                        { role: "user", content: text }
                    ]
                })
            });

            removeTypingIndicator();

            if (risposta.ok) {
                let data = await risposta.json();
                let aiText = data.choices[0].message.content;
                // Gestione semplice della formattazione markdown
                aiText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                aiText = aiText.replace(/\n/g, '<br>');
                addAIMessage(aiText);
            } else {
                addAIMessage("Mi dispiace, si è verificato un errore nel contattare l'intelligenza artificiale.");
                console.error("API Error Response:", await risposta.text());
            }
        } catch (error) {
            removeTypingIndicator();
            console.error(error);
            addAIMessage("Errore di rete. Controlla la tua connessione.");
        }
    }

    sendBtn.addEventListener('click', handleChatSubmit);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChatSubmit();
        }
    });

    function addUserMessage(text) {
        const msgHTML = `
            <div class="message user-message">
                <div class="avatar"><i class="fa-solid fa-user"></i></div>
                <div class="content">${text}</div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', msgHTML);
        scrollToBottom();
    }

    function addAIMessage(text) {
        const msgHTML = `
            <div class="message ai-message">
                <div class="avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="content">${text}</div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', msgHTML);
        scrollToBottom();
    }

    let typingEl = null;
    function showTypingIndicator() {
        typingEl = document.createElement('div');
        typingEl.className = 'typing-indicator';
        typingEl.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingEl);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        if (typingEl && typingEl.parentNode) {
            typingEl.parentNode.removeChild(typingEl);
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
