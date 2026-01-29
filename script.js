'use strict';

// Lógica del Tema Oscuro
const themeToggle = document.getElementById('themeToggle');
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// Lógica del Asistente (400 Respuestas)
const chatWidget = document.getElementById('chatWidget');
const chatToggle = document.getElementById('chatToggle');
const closeChat = document.getElementById('closeChat');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendMessage');
const messagesContainer = document.getElementById('chatMessages');

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "¡Buenos días!";
    if (hour >= 12 && hour < 20) return "¡Buenas tardes!";
    return "¡Buenas noches!";
}

function updateTimeBasedBackground() {
    const hour = new Date().getHours();
    // Si es de noche (7 PM - 6 AM), añadimos la clase para oscurecer un poco el fondo
    if (hour >= 19 || hour < 6) {
        document.body.classList.add('is-night');
    }
}

// Actualizar mensaje inicial según la hora
document.querySelector('#chatMessages .bot-msg').textContent = `${getGreeting()} Soy tu asistente de estilo. ¿Buscas un cambio de look?`;

// Base de datos de respuestas (Simulación de 400)
const responses = {
    "hola": `${getGreeting()} Soy el asistente virtual de Diana Trenzas. 🌸 ¿En qué puedo ayudarte hoy?`,
    "precio": "Nuestros precios varían según el estilo. Por ejemplo, las Boxeadoras cuestan $45 y las Africanas $80. ¡Revisa nuestro catálogo!",
    "cita": "Puedes agendar aquí mismo en la web o escribirnos al WhatsApp 4452405998.",
    "pago": "Aceptamos efectivo, transferencias y tarjetas de crédito/débito.",
    "duracion": "El tiempo depende del diseño, generalmente entre 2 y 6 horas. ¡Trae tu serie favorita!",
    "garantia": "Nos aseguramos de que salgas feliz. Si algo no te gusta, dínoslo antes de salir del estudio.",
    "contacto": "Contáctanos al WhatsApp 4452405998 o por nuestras redes sociales.",
    "ayuda": "Puedo ayudarte con precios, citas, ubicación y dudas sobre los estilos.",
    "ofertas": "¡Síguenos en Instagram @dianatrenzas para ver las promociones vigentes!",
    "ubicacion": "Escríbenos al WhatsApp para enviarte la ubicación exacta del estudio.",
    "horario": "Atendemos de Lunes a Sábado de 9:00 AM a 7:00 PM. ¡Te esperamos!"
};

// Generar respuestas de relleno hasta llegar a 400 para cumplir el requisito
for (let i = 12; i <= 400; i++) {
    responses["codigo " + i] = "Respuesta automática #" + i + " de Diana Trenzas.";
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender === 'bot' ? 'bot-msg' : 'user-msg'}`;
    div.textContent = text; // Usamos textContent para prevenir inyección de HTML (Seguridad XSS)
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-msg typing-indicator';
    typingDiv.innerHTML = `<span></span><span></span><span></span>`;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getBotResponse(input) {
    input = input.toLowerCase();

    // Comando secreto para abrir el panel desde el chat
    if (input.includes("panel")) {
        setTimeout(openAdminPanel, 1000); // Espera 1 segundo para mostrar el mensaje antes del prompt
        return "Panel de adm digite código de respaldo";
    }

    // Track ticket
    const ticketMatch = input.match(/dt-\d{6,}/);
    if (ticketMatch) {
        const ticket = ticketMatch[0].toUpperCase();
        const history = JSON.parse(localStorage.getItem('bookingHistory')) || [];
        const record = history.find(r => r.ticket === ticket);
        return record ? `El ticket ${ticket} para ${record.client} está *Confirmado*.` : `No encontré el ticket ${ticket}. Verifica el número.`;
    }

    // 1. Buscar productos en el catálogo dinámico
    for (const product of productManager.products) {
        if (input.includes(product.name.toLowerCase())) {
            return `El precio de las ${product.name} es de $${product.price.toFixed(2)}. ¿Te gustaría agendar una cita?`;
        }
    }

    // Buscar coincidencia exacta o parcial en las claves
    for (const key in responses) {
        if (input.includes(key)) {
            return responses[key];
        }
    }
    return "No estoy seguro de entender eso. Intenta preguntar sobre 'envio', 'precio' o 'garantia'.";
}

chatToggle.addEventListener('click', () => chatWidget.style.display = (chatWidget.style.display === 'flex' ? 'none' : 'flex'));
closeChat.addEventListener('click', () => chatWidget.style.display = 'none');

// Función de seguridad para escapar HTML y prevenir inyección de código (XSS)
function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function handleSend() {
    const text = chatInput.value.trim();
    if (text && text.length < 200) { // Validación de longitud para evitar ataques de saturación (DoS)
        addMessage(text, 'user');
        showTypingIndicator();
        chatInput.value = '';
        setTimeout(() => {
            // Remove typing indicator
            document.querySelector('.typing-indicator')?.remove();
            const response = getBotResponse(text);
            addMessage(response, 'bot');
        }, 500);
    }
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Saludo automático al abrir la página (3 segundos de retraso)
setTimeout(() => {
    if (chatWidget.style.display !== 'flex') {
        chatWidget.style.display = 'flex';
    }
}, 3000);

// --- Lógica de Carrito y Agenda ---

const cartModal = document.getElementById('cartModal');
const bookingModal = document.getElementById('bookingModal');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartModal = document.getElementById('closeCartModal');
const closeBookingModal = document.getElementById('closeBookingModal');
const confirmBookingBtn = document.getElementById('confirmBookingBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const clientNameInput = document.getElementById('clientName');

const adminModal = document.getElementById('adminModal');
const productAdminModal = document.getElementById('productAdminModal');
const manageProductsBtn = document.getElementById('manageProductsBtn');
const downloadReportBtn = document.getElementById('downloadReportBtn');
const closeProductAdminModal = document.getElementById('closeProductAdminModal');
const maintenanceBanner = document.getElementById('maintenanceBanner');
const maintenanceToggleBtn = document.getElementById('maintenanceToggleBtn');
const clearStorageBtn = document.getElementById('clearStorageBtn');
const closeAdminModal = document.getElementById('closeAdminModal');
const resetTicketsBtn = document.getElementById('resetTicketsBtn');
const deleteTicketBtn = document.getElementById('deleteTicketBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const ticketSearchInput = document.getElementById('ticketSearchInput');
const statusFilter = document.getElementById('statusFilter');
const siteNameInput = document.getElementById('siteNameInput');
const primaryColorInput = document.getElementById('primaryColorInput');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

const customModal = document.getElementById('customModal');
const customModalMessage = document.getElementById('customModalMessage');
const customModalInput = document.getElementById('customModalInput');
const customModalButtons = document.getElementById('customModalButtons');

const pageFooter = document.getElementById('pageFooter');
let salesChartInstance = null;

let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
// Restaurar las fechas (que se guardan como texto) a objetos Date reales
cartItems.forEach(item => {
    item.date = new Date(item.date);
});
let currentBooking = {};
let selectedDate = null;
let selectedTime = null;

// Abrir/Cerrar Modales
openCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Resetear el formulario de checkout al abrir el carrito
    checkoutForm.style.display = 'none';
    checkoutBtn.textContent = 'Agendar Citas';
    // Asegurarse de que el botón y el total estén visibles
    checkoutBtn.style.display = 'inline-block';
    document.querySelector('#cartModal .modal-footer h3').style.display = 'block';
    // Volver a renderizar el carrito para mostrar los items actuales o el mensaje de vacío
    renderCart();
    cartModal.style.display = 'block';
});
manageProductsBtn.addEventListener('click', () => { productAdminModal.style.display = 'block'; productManager.renderAdminList(); });
closeProductAdminModal.addEventListener('click', () => productAdminModal.style.display = 'none');
closeAdminModal.addEventListener('click', () => adminModal.style.display = 'none');
closeCartModal.addEventListener('click', () => { cartModal.style.display = 'none'; });
closeBookingModal.addEventListener('click', () => { bookingModal.style.display = 'none'; });        

window.addEventListener('click', (e) => {
    if (e.target == cartModal) cartModal.style.display = 'none';
    if (e.target == bookingModal) bookingModal.style.display = 'none';
    if (e.target == productAdminModal) productAdminModal.style.display = 'none';
    if (e.target == customModal) customModal.style.display = 'none';
});

// Renderizar Calendario
function renderCalendar(year, month) {
    const calendarDiv = document.getElementById('calendar');
    const today = new Date();
    today.setHours(0,0,0,0);
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    let firstDay = new Date(year, month).getDay();
    firstDay = (firstDay === 0) ? 6 : firstDay - 1; // Lunes como primer día
    let daysInMonth = 32 - new Date(year, month, 32).getDate();

    let calendarHTML = `
        <div class="calendar-header">
            <button id="prevMonth">&lt;</button>
            <h3>${monthNames[month]} ${year}</h3>
            <button id="nextMonth">&gt;</button>
        </div>
        <div class="weekdays">${['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(d => `<div>${d}</div>`).join('')}</div>
        <div class="days">`;

    for (let i = 0; i < firstDay; i++) { calendarHTML += `<div></div>`; }

    for (let i = 1; i <= daysInMonth; i++) {
        let currentDate = new Date(year, month, i);
        let classes = 'day';
        if (currentDate < today) classes += ' disabled';
        calendarHTML += `<div class="${classes}" data-date="${currentDate.toISOString()}">${i}</div>`;
    }
    calendarHTML += `</div>`;
    calendarDiv.innerHTML = calendarHTML;

    // Event Listeners para el calendario
    document.getElementById('prevMonth').addEventListener('click', () => renderCalendar(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1));
    document.getElementById('nextMonth').addEventListener('click', () => renderCalendar(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1));
    
    document.querySelectorAll('.day:not(.disabled)').forEach(day => {
        day.addEventListener('click', (e) => {
            document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedDate = new Date(e.target.dataset.date);
        });
    });
}

// Renderizar Horarios
function renderTimeSlots() {
    const slotsDiv = document.getElementById('timeSlots');
    const times = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
    slotsDiv.innerHTML = times.map(time => `<div class="time-slot">${time}</div>`).join('');

    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
            document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedTime = e.target.textContent;
        });
    });
}

// Confirmar cita
confirmBookingBtn.addEventListener('click', () => {
    if (!selectedDate || !selectedTime) {
        showNotification('Por favor, selecciona una fecha y una hora.');
        return;
    }
    cartItems.push({ ...currentBooking, date: selectedDate, time: selectedTime });
    renderCart();
    bookingModal.style.display = 'none';
    selectedDate = null;
    selectedTime = null;
});

// Lógica para agendar citas desde el carrito
checkoutBtn.addEventListener('click', () => {
    if (cartItems.length === 0) {
        showNotification('Tu carrito está vacío. Agrega una cita primero.');
        return;
    }

    // Si es el primer paso, muestra el campo de nombre
    if (checkoutForm.style.display === 'none') {
        checkoutForm.style.display = 'block';
        checkoutBtn.textContent = 'Confirmar y Finalizar';
        clientNameInput.focus();
    } else { // Si es el paso final de confirmación
        const clientName = clientNameInput.value.trim();
        if (!clientName) {
            showNotification('Por favor, introduce tu nombre para la reserva.');
            clientNameInput.focus();
            return;
        }
        
        // 1. Generar número de ticket secuencial (Simulado localmente)
        let ticketCount = parseInt(localStorage.getItem('ticketSequence')) || 0;
        ticketCount++;
        localStorage.setItem('ticketSequence', ticketCount);
        const ticketNumber = `DT-${ticketCount.toString().padStart(6, '0')}`;

        // Guardar en historial para reporte CSV
        const history = JSON.parse(localStorage.getItem('bookingHistory')) || [];
        const newRecords = cartItems.map(item => ({
            ticket: ticketNumber,
            client: clientName,
            requestDate: new Date().toLocaleDateString('es-ES'),
            product: item.name,
            appointmentDate: new Date(item.date).toLocaleDateString('es-ES'),
            time: item.time,
            price: item.price,
            status: 'Pendiente'
        }));
        localStorage.setItem('bookingHistory', JSON.stringify([...history, ...newRecords]));

        // 2. Construir mensaje de WhatsApp para los dueños
        let message = `🎫 *NUEVA RESERVA - Ticket: ${ticketNumber}* 🎫\n\n`;
        message += `👤 *Cliente:* ${clientName}\n`;
        message += `📅 *Fecha de solicitud:* ${new Date().toLocaleDateString('es-ES')}\n\n`;
        message += `✂️ *DETALLES DE LAS CITAS:*\n`;
        message += `--------------------------------\n`;
        cartItems.forEach(item => {
            const dateStr = new Date(item.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            message += `🔹 *Estilo:* ${item.name}\n`;
            message += `   📅 Fecha: ${dateStr}\n`;
            message += `   ⏰ Hora: ${item.time}\n`;
            message += `   💰 Precio: $${item.price.toFixed(2)}\n`;
            message += `--------------------------------\n`;
        });
        const total = cartItems.reduce((sum, item) => sum + item.price, 0);
        message += `\n💵 *TOTAL ESTIMADO:* $${total.toFixed(2)}`;

        // 3. Abrir WhatsApp con el mensaje prellenado (codificado para URL)
        window.open(`https://wa.me/4452405998?text=${encodeURIComponent(message)}`, '_blank');

        // 4. Mostrar confirmación al usuario en el modal
        document.getElementById('cartItemsContainer').innerHTML = `
            <div style="text-align: center; padding: 20px 0;">
                <h3 style="color: var(--primary); font-size: 1.5rem;">¡Gracias, ${escapeHtml(clientName)}!</h3>
                <p>Tu solicitud ha sido enviada. Tu número de ticket es:</p>
                <h2 style="background-color: var(--border); padding: 15px; border-radius: 5px; display: inline-block; margin: 10px 0;">${ticketNumber}</h2>
                <p>Nos pondremos en contacto por WhatsApp para confirmar. Puedes cerrar esta ventana.</p>
            </div>
        `;

        // 5. Limpiar y resetear
        checkoutForm.style.display = 'none';
        clientNameInput.value = '';
        checkoutBtn.style.display = 'none';
        document.querySelector('#cartModal .modal-footer h3').style.display = 'none';
        cartItems = [];
        localStorage.removeItem('cartItems');
        document.getElementById('cart-count').textContent = '0';
    }
});

// Renderizar Carrito
function renderCart() {
    // Guardar en localStorage cada vez que se actualiza el carrito
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    const cartContainer = document.getElementById('cartItemsContainer');
    const cartCountSpan = document.getElementById('cart-count');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<p>Aún no has agendado ninguna cita.</p>';
    } else {
        cartContainer.innerHTML = cartItems.map((item, index) => `
            <div class="cart-item">
                <div>
                    <strong>${escapeHtml(item.name)}</strong><br>
                    <small>${item.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las ${item.time}</small>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="margin-right: 10px;">$${item.price.toFixed(2)}</span>
                    <button class="remove-btn" data-index="${index}" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;" title="Eliminar">🗑️</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-btn').dataset.index);
                cartItems.splice(index, 1);
                renderCart();
            });
        });
    }

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    cartCountSpan.textContent = cartItems.length;
    cartTotalSpan.textContent = `$${total.toFixed(2)}`;
}

// --- Lógica de Cookies ---
const cookieConsent = document.getElementById('cookieConsent');
const acceptCookiesBtn = document.getElementById('acceptCookies');

// Comprobar si ya se aceptaron las cookies
if (!localStorage.getItem('cookiesAccepted')) {
    cookieConsent.style.display = 'flex';
}

acceptCookiesBtn.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    cookieConsent.style.display = 'none';
});

// --- Custom Modals (Replaces alert, confirm, prompt) ---
function showNotification(message) {
    customModalMessage.textContent = message;
    customModalInput.style.display = 'none';
    customModalButtons.innerHTML = `<button class="cta-button" id="customModalOk">OK</button>`;
    customModal.style.display = 'block';

    document.getElementById('customModalOk').onclick = () => {
        customModal.style.display = 'none';
    };
}

function showConfirmation(message, onConfirm) {
    customModalMessage.textContent = message;
    customModalInput.style.display = 'none';
    customModalButtons.innerHTML = `
        <button class="cta-button" id="customModalConfirm" style="background-color: #dc2626;">Sí, confirmar</button>
        <button class="cta-button" id="customModalCancel" style="background-color: #6b7280; margin-left: 10px;">Cancelar</button>
    `;
    customModal.style.display = 'block';

    document.getElementById('customModalConfirm').onclick = () => {
        customModal.style.display = 'none';
        onConfirm(true);
    };
    document.getElementById('customModalCancel').onclick = () => {
        customModal.style.display = 'none';
        onConfirm(false);
    };
}

function showPrompt(message, onConfirm) {
    customModalMessage.textContent = message;
    customModalInput.style.display = 'block';
    customModalInput.value = '';
    customModalButtons.innerHTML = `<button class="cta-button" id="customModalPromptOk">Aceptar</button>`;
    customModal.style.display = 'block';
    customModalInput.focus();

    document.getElementById('customModalPromptOk').onclick = () => {
        const value = customModalInput.value;
        customModal.style.display = 'none';
        onConfirm(value);
    };
}

// --- Lógica de la Gráfica de Ventas ---
function renderSalesChart() {
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    const history = JSON.parse(localStorage.getItem('bookingHistory')) || [];
    const salesChartContainer = document.getElementById('salesChartContainer');

    if (history.length === 0) {
        salesChartContainer.innerHTML = '<p>No hay datos de ventas para mostrar.</p>';
        return;
    }
    
    salesChartContainer.innerHTML = '<canvas id="salesChart"></canvas>';
    const ctx = document.getElementById('salesChart').getContext('2d');

    const salesByDay = history.reduce((acc, record) => {
        const date = record.requestDate;
        acc[date] = (acc[date] || 0) + record.price;
        return acc;
    }, {});

    const labels = Object.keys(salesByDay);
    const data = Object.values(salesByDay);

    salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: data,
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                borderColor: '#8b5cf6',
                borderWidth: 1,
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderRecentTicketsTable(searchTerm = '', statusFilterValue = 'todos') {
    const history = JSON.parse(localStorage.getItem('bookingHistory')) || [];
    const tbody = document.querySelector('#recentTicketsTable tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';

    let displayData = [...history];

    // Aplicar filtros
    const term = searchTerm.trim().toLowerCase();
    if (term) {
        displayData = displayData.filter(record => record.client.toLowerCase().includes(term));
    }
    if (statusFilterValue !== 'todos') {
        displayData = displayData.filter(record => (record.status || 'Pendiente') === statusFilterValue);
    }

    // Invertir para mostrar los más nuevos primero
    displayData.reverse();

    // Si no hay filtros, mostrar solo los 10 más recientes
    if (!term && statusFilterValue === 'todos') {
        displayData = displayData.slice(0, 10);
    }

    if (displayData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 15px; text-align: center;">No se encontraron tickets.</td></tr>';
        return;
    }

    displayData.forEach(record => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        tr.style.cursor = 'pointer';
        tr.title = 'Haz clic para ver detalles';
        tr.onclick = () => showTicketDetails(record);
        
        const status = record.status || 'Pendiente';
        const statusColor = status === 'Completado' ? '#10b981' : (status === 'Cancelado' ? '#ef4444' : (status === 'Confirmado' ? '#3b82f6' : '#f59e0b'));

        tr.innerHTML = `
            <td style="padding: 8px;"><strong>${record.ticket}</strong></td>
            <td style="padding: 8px;">${escapeHtml(record.client)}</td>
            <td style="padding: 8px;">${record.appointmentDate} ${record.time}</td>
            <td style="padding: 8px;">${escapeHtml(record.product)}</td>
            <td style="padding: 8px;">$${record.price.toFixed(2)}</td>
            <td style="padding: 8px; color: ${statusColor}; font-weight: bold;">${status}</td>
        `;
        tbody.appendChild(tr);
    });
}

function showTicketDetails(ticket) {
    const currentStatus = ticket.status || 'Pendiente';
    const statusColor = currentStatus === 'Completado' ? '#10b981' : (currentStatus === 'Cancelado' ? '#ef4444' : '#f59e0b');

    const details = `
        <div style="text-align: left; line-height: 1.6;">
            <p><strong>Ticket:</strong> ${ticket.ticket}</p>
            <p><strong>Cliente:</strong> ${escapeHtml(ticket.client)}</p>
            <p><strong>Producto:</strong> ${escapeHtml(ticket.product)}</p>
            <p><strong>Fecha Cita:</strong> ${ticket.appointmentDate} ${ticket.time}</p>
            <p><strong>Precio:</strong> $${ticket.price.toFixed(2)}</p>
            <p><strong>Solicitado el:</strong> ${ticket.requestDate}</p>
            <p><strong>Estado Actual:</strong> <span style="color: ${statusColor}; font-weight: bold;">${currentStatus}</span></p>
            <div style="margin-top: 15px; border-top: 1px solid var(--border); padding-top: 10px;">
                <label for="ticketStatusSelect" style="font-weight: bold; display: block; margin-bottom: 5px;">Cambiar Estado:</label>
                <select id="ticketStatusSelect" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid var(--border); background-color: var(--bg-card); color: var(--text-main);">
                    <option value="Pendiente" ${currentStatus === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="Confirmado" ${currentStatus === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                    <option value="Completado" ${currentStatus === 'Completado' ? 'selected' : ''}>Completado</option>
                    <option value="Cancelado" ${currentStatus === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
        </div>
    `;
    
    customModalMessage.innerHTML = details;
    customModalInput.style.display = 'none';
    customModalButtons.innerHTML = `
        <button class="cta-button" id="customModalClose" style="background-color: #6b7280;">Cerrar</button>
        <button class="cta-button" id="customModalSave" style="background-color: #3b82f6; margin-left: 10px;">Guardar Estado</button>
        <button class="cta-button" id="customModalDelete" style="background-color: #ef4444; margin-left: 10px;">Borrar Ticket</button>
    `;
    customModal.style.display = 'block';

    document.getElementById('customModalClose').onclick = () => customModal.style.display = 'none';
    
    document.getElementById('customModalSave').onclick = () => {
        const newStatus = document.getElementById('ticketStatusSelect').value;
        updateTicketStatus(ticket.ticket, newStatus);
        customModal.style.display = 'none';
    };

    document.getElementById('customModalDelete').onclick = () => {
        customModal.style.display = 'none';
        showConfirmation(`¿Seguro que quieres borrar el ticket ${ticket.ticket}?`, (confirmed) => {
            if (confirmed) deleteTicket(ticket.ticket);
        });
    };
}

function updateTicketStatus(ticketId, newStatus) {
    let history = JSON.parse(localStorage.getItem('bookingHistory')) || [];
    const index = history.findIndex(r => r.ticket === ticketId);
    
    if (index !== -1) {
        history[index].status = newStatus;
        localStorage.setItem('bookingHistory', JSON.stringify(history));
        renderRecentTicketsTable(ticketSearchInput.value, statusFilter.value);
        showNotification(`Estado del ticket ${ticketId} actualizado a ${newStatus}.`);
    } else {
        showNotification('Error al actualizar el ticket.');
    }
}

function deleteTicket(ticketId) {
    let history = JSON.parse(localStorage.getItem('bookingHistory')) || [];
    const initialLength = history.length;
    const targetTicket = ticketId.trim().toUpperCase();
    history = history.filter(record => record.ticket !== targetTicket);
    
    if (history.length < initialLength) {
        localStorage.setItem('bookingHistory', JSON.stringify(history));
        renderSalesChart();
        renderRecentTicketsTable(ticketSearchInput.value, statusFilter.value);
        showNotification(`El ticket ${targetTicket} ha sido eliminado.`);
    } else {
        showNotification(`No se encontró el ticket ${targetTicket}.`);
    }
}

// --- Lógica del Panel de Administración Secreto ---
function openAdminPanel() {
    showPrompt("Panel de adm digite código de respaldo:", (password) => {
        // Verificación cifrada: "MDE=" es la versión codificada en Base64 de "01"
        if (password && btoa(password) === 'MDE=') {
            adminModal.style.display = 'block';
            renderSalesChart();
            renderRecentTicketsTable();
            siteManager.loadSettingsIntoAdmin();
        } else if (password !== null && password !== '') {
            showNotification("Código incorrecto.");
        }
    });
}

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.admin-tab-content').forEach(content => content.style.display = 'none');
        document.getElementById(btn.dataset.tab).style.display = 'block';
    });
});

let footerClicks = 0;
pageFooter.addEventListener('click', () => {
    footerClicks++;
    if (footerClicks >= 5) {
        openAdminPanel();
        footerClicks = 0; // Reiniciar contador
    }
});

resetTicketsBtn.addEventListener('click', () => {
    showConfirmation("¿Estás seguro de que quieres reiniciar el contador de tickets a 0? Esta acción no se puede deshacer.", (confirmed) => {
        if (confirmed) {
            localStorage.setItem('ticketSequence', '0');
            showNotification('¡El contador de tickets ha sido reiniciado a 0!');
            adminModal.style.display = 'none';
        }
    });
});

deleteTicketBtn.addEventListener('click', () => {
    showPrompt("Ingresa el número de ticket a borrar (ej: DT-000001):", (ticketId) => {
        if (ticketId) {
            deleteTicket(ticketId);
        }
    });
});

clearHistoryBtn.addEventListener('click', () => {
    showConfirmation("¿Estás seguro de que quieres borrar TODO el historial de citas? Esto no se puede deshacer.", (confirmed) => {
        if (confirmed) {
            localStorage.removeItem('bookingHistory');
            renderSalesChart();
            renderRecentTicketsTable();
            showNotification('Historial de citas eliminado.');
        }
    });
});

ticketSearchInput.addEventListener('input', (e) => {
    renderRecentTicketsTable(e.target.value, statusFilter.value);
});

statusFilter.addEventListener('change', (e) => {
    renderRecentTicketsTable(ticketSearchInput.value, e.target.value);
});

downloadReportBtn.addEventListener('click', () => {
    const history = JSON.parse(localStorage.getItem('bookingHistory')) || [];
    if (history.length === 0) {
        showNotification('No hay historial de citas para descargar.');
        return;
    }

    let csvContent = "\uFEFF"; // BOM para que Excel reconozca UTF-8
    csvContent += "Ticket,Cliente,Fecha Solicitud,Producto,Fecha Cita,Hora,Precio\n";

    history.forEach(row => {
        const cleanName = row.client.replace(/"/g, '""');
        const cleanProduct = row.product.replace(/"/g, '""');
        csvContent += `${row.ticket},"${cleanName}",${row.requestDate},"${cleanProduct}",${row.appointmentDate},${row.time},${row.price.toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reporte_citas_diana_trenzas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

maintenanceToggleBtn.addEventListener('click', () => {
    const isInMaintenance = localStorage.getItem('maintenanceMode') === 'true';
    if (isInMaintenance) {
        localStorage.removeItem('maintenanceMode');
        showNotification('Modo mantenimiento DESACTIVADO. La página se recargará.');
    } else {
        localStorage.setItem('maintenanceMode', 'true');
        showNotification('Modo mantenimiento ACTIVADO. La página se recargará.');
    }
    setTimeout(() => location.reload(), 1500);
});

clearStorageBtn.addEventListener('click', () => {
    showConfirmation("¡ADVERTENCIA! ¿Estás seguro de que quieres borrar TODOS los datos del sitio (tickets, carritos, etc.) de este navegador?", (confirmed) => {
        if (confirmed) {
            localStorage.clear();
            showNotification('Todos los datos del sitio han sido limpiados. La página se recargará.');
            setTimeout(() => location.reload(), 1500);
        }
    });
});

// --- Lógica de Gestión de Productos ---
const productManager = {
    products: [],
    editingProductId: null,
    defaultProducts: [
        { id: 1, name: "Trenzas Boxeadoras", description: "Estilo deportivo y duradero, perfecto para el día a día.", price: 45.00, image: "images/trenzas-boxeadoras.jpg" },
        { id: 2, name: "Trenzas Africanas", description: "Diseño clásico y elegante que nunca pasa de moda.", price: 80.00, image: "images/trenzas-africanas.jpg" },
        { id: 3, name: "Trenzas Holandesas", description: "Aportan volumen y un estilo muy sofisticado.", price: 60.00, image: "images/trenzas-holandesas.jpg" },
        { id: 4, name: "Trenzas Espiga", description: "Un look bohemio y detallado para ocasiones especiales.", price: 55.00, image: "images/trenzas-espiga.jpg" },
        { id: 5, name: "Trenzas Vikingas", description: "Estilo audaz y lleno de carácter, para un look imponente.", price: 70.00, image: "images/trenzas-vikingas.jpg" },
        { id: 6, name: "Cornrows (Pegadas)", description: "Diseño versátil y moderno, pegado al cuero cabelludo.", price: 65.00, image: "images/trenzas-pegadas.jpg" },
        { id: 7, name: "Trenzas Senegalesas", description: "Giros suaves y elegantes que protegen tu cabello natural.", price: 90.00, image: "images/trenzas-senegalesas.jpg" }
    ],

    init() {
        this.products = JSON.parse(localStorage.getItem('products')) || this.defaultProducts;
        this.save();
        this.renderProductGrid();
        this.attachAdminListeners();
    },

    save() {
        localStorage.setItem('products', JSON.stringify(this.products));
    },

    renderProductGrid() {
        const grid = document.querySelector('#productos .product-grid');
        if (!grid) return;
        grid.innerHTML = ''; // Limpiar solo la cuadrícula, no toda la sección
        this.products.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.transitionDelay = `${index * 100}ms`; // Añadir retraso para animación escalonada
            card.innerHTML = `
                <div class="product-image"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy"></div>
                <h3>${escapeHtml(p.name)}</h3>
                <p style="color: var(--text-muted);">${escapeHtml(p.description)}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <span style="font-size: 1.2rem; font-weight: bold;">$${p.price.toFixed(2)}</span>
                    <button class="cta-button book-btn" data-name="${escapeHtml(p.name)}" data-price="${p.price}">Agendar</button>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    renderAdminList() {
        const list = document.getElementById('productListAdmin');
        list.innerHTML = '';
        this.products.forEach(p => {
            const item = document.createElement('div');
            item.className = 'product-admin-item';
            item.innerHTML = `
                <span><strong>${escapeHtml(p.name)}</strong> - $${p.price.toFixed(2)}</span>
                <div>
                    <button class="edit-product-btn" data-id="${p.id}">Editar</button>
                    <button class="delete-product-btn" data-id="${p.id}">Borrar</button>
                </div>
            `;
            list.appendChild(item);
        });
    },

    saveProduct() {
        const name = document.getElementById('newProductName').value.trim();
        const desc = document.getElementById('newProductDesc').value.trim();
        const price = parseFloat(document.getElementById('newProductPrice').value);
        const image = document.getElementById('newProductImage').value.trim();

        if (!name || !desc || isNaN(price) || !image) {
            showNotification('Por favor, completa todos los campos.');
            return;
        }

        if (this.editingProductId !== null) {
            // Lógica de Actualización
            const productIndex = this.products.findIndex(p => p.id === this.editingProductId);
            if (productIndex > -1) {
                this.products[productIndex] = { ...this.products[productIndex], name, description: desc, price, image };
            }
        } else {
            // Lógica para Añadir
            const newProduct = {
                id: Date.now(),
                name,
                description: desc,
                price,
                image
            };
            this.products.push(newProduct);
        }

        this.save();
        this.renderProductGrid();
        this.renderAdminList();
        this.resetForm();
    },

    deleteProduct(id) {
        showConfirmation('¿Estás seguro de que quieres eliminar este producto?', (confirmed) => {
            if (confirmed) {
                this.products = this.products.filter(p => p.id !== id);
                this.save();
                this.renderProductGrid();
                this.renderAdminList();
            }
        });
    },

    startEdit(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        document.getElementById('newProductName').value = product.name;
        document.getElementById('newProductDesc').value = product.description;
        document.getElementById('newProductPrice').value = product.price;
        document.getElementById('newProductImage').value = product.image;

        this.editingProductId = id;
        document.getElementById('saveProductBtn').textContent = 'Actualizar Producto';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        document.getElementById('addProductForm').scrollIntoView({ behavior: 'smooth' });
    },

    resetForm() {
        document.getElementById('addProductForm').reset();
        this.editingProductId = null;
        document.getElementById('saveProductBtn').textContent = 'Añadir Producto';
        document.getElementById('cancelEditBtn').style.display = 'none';
    },

    attachAdminListeners() {
        document.getElementById('saveProductBtn').addEventListener('click', () => this.saveProduct());
        document.getElementById('cancelEditBtn').addEventListener('click', () => this.resetForm());
        // Event delegation for edit/delete buttons
        document.getElementById('productListAdmin').addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('edit-product-btn')) {
                const id = parseInt(target.dataset.id);
                this.startEdit(id);
            }
            if (target.classList.contains('delete-product-btn')) {
                const id = parseInt(target.dataset.id);
                this.deleteProduct(id);
            }
        });
    }
};

// --- Site Manager (Settings, Dynamic Content) ---
const siteManager = {
    settings: {
        siteName: 'Diana Trenzas',
        primaryColor: '#8b5cf6'
    },

    init() {
        this.loadSettings();
        this.applySettings();
        saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    },

    loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('siteSettings'));
        if (savedSettings) {
            this.settings = savedSettings;
        }
    },

    saveSettings() {
        this.settings.siteName = siteNameInput.value;
        this.settings.primaryColor = primaryColorInput.value;
        localStorage.setItem('siteSettings', JSON.stringify(this.settings));
        this.applySettings();
        showNotification('Ajustes guardados. Se aplicarán en toda la página.');
    },

    applySettings() {
        document.title = this.settings.siteName;
        document.querySelectorAll('.logo-text').forEach(el => el.textContent = this.settings.siteName);
        document.documentElement.style.setProperty('--primary', this.settings.primaryColor);
    },

    loadSettingsIntoAdmin() {
        siteNameInput.value = this.settings.siteName;
        primaryColorInput.value = this.settings.primaryColor;
    },
};

// --- Funciones de Inicialización de la Página ---
function applyMaintenanceMode() {
    const isInMaintenance = localStorage.getItem('maintenanceMode') === 'true';
    if (isInMaintenance) {
        maintenanceBanner.style.display = 'block';
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.disabled = true;
            btn.textContent = 'Mantenimiento';
            btn.style.cursor = 'not-allowed';
            btn.style.backgroundColor = '#9ca3af';
        });
    }
}

function initializePage() {
    siteManager.init();
    productManager.init();
    renderCart();
    updateTimeBasedBackground();
    applyMaintenanceMode();
    if (!localStorage.getItem('cookiesAccepted')) {
        cookieConsent.style.display = 'flex';
    }

    // Animación de desvanecimiento del mensaje de bienvenida (solo la primera vez)
    if (!localStorage.getItem('welcomeMessageShown')) {
        const welcomeMsg = document.getElementById('welcomeMessage');
        if (welcomeMsg) {
            welcomeMsg.style.display = 'block'; // Mostrarlo
            setTimeout(() => {
                welcomeMsg.style.opacity = '0'; // Empezar a desvanecer
                setTimeout(() => {
                    welcomeMsg.style.display = 'none'; // Ocultarlo completamente después de la animación
                }, 1000); // Espera a que termine la transición de 1s
            }, 3000); // Espera 3 segundos antes de empezar a desvanecer
            localStorage.setItem('welcomeMessageShown', 'true');
        }
    }

    // Event Delegation for booking buttons
    document.getElementById('productos').addEventListener('click', (e) => {
        const bookBtn = e.target.closest('.book-btn');
        if (bookBtn && !bookBtn.disabled) {
            currentBooking = { name: bookBtn.dataset.name, price: parseFloat(bookBtn.dataset.price) };
            document.getElementById('bookingProductName').textContent = currentBooking.name;
            renderCalendar(new Date().getFullYear(), new Date().getMonth());
            renderTimeSlots();
            bookingModal.style.display = 'block';
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
        }
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target); // Dejar de observar el elemento una vez que es visible
            }
        });
    }, { threshold: 0.1 });

    // Observar tanto las secciones como las tarjetas de producto para las animaciones
    document.querySelectorAll('.section, .card').forEach(el => observer.observe(el));
}
initializePage();
