// =====================================================================
// ESTE ARCHIVO YA NO CONTIENE LA DATA DE ORGAN_DATA.
// La data se encuentra en 'organ_templates.js' y se asume cargada globalmente.
// =====================================================================


// ---------------------------------------------------------------------
// FUNCIONES DE UTILIDAD
// ---------------------------------------------------------------------

/**
 * Convierte un valor numérico de milímetros a centímetros.
 * @param {number} mmValue - Valor en milímetros.
 * @returns {string} Valor en centímetros (con un decimal).
 */
function convertMmToCm(mmValue) {
    const value = parseFloat(mmValue);
    if (isNaN(value) || value === 0) {
        return '0.0'; 
    }
    // Divide por 10 y lo formatea a un decimal
    return (value / 10).toFixed(1); 
}

/**
 * Genera el HTML de los datos del paciente usando la nueva estructura compacta.
 */
function generatePatientDataHtml() {
    // Lectura de los campos
    const name = document.getElementById('nombre')?.value || ' ';
    const age = document.getElementById('edad')?.value || ' ';
    const identification = document.getElementById('identificacion')?.value || ' ';
    const physician = document.getElementById('medico-solicitante')?.value || 'Dr/Dra.  ';
    const date = document.getElementById('fecha-estudio')?.value || 'Fecha: __/__/____';
    const sex = document.getElementById('sexo')?.value || 'N/D'; 
    
    // Formato de fecha
    let displayDate = date;
    if (date && date !== 'Fecha: __/__/____') {
        const parts = date.split('-');
        displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // ESTRUCTURA COMPACTA EN 3 COLUMNAS
    return `
        <div class="patient-info-block print-grid-container" id="patient-data-print-container">
            <div class="patient-info-line"><strong>Paciente:</strong> ${name.toUpperCase()}</div>
            <div class="patient-info-line"><strong>Edad:</strong> ${age} Años</div>
            <div class="patient-info-line"><strong>Sexo:</strong> ${sex}</div>
            <div class="patient-info-line"><strong>ID/Cédula:</strong> ${identification}</div>
            <div class="patient-info-line"><strong>Médico Tratante:</strong> ${physician}</div>
            <div class="patient-info-line"><strong>Fecha del Estudio:</strong> ${displayDate}</div>
        </div>
    `;
}

/**
 * Genera el HTML de la sección de conclusión (Impresión Diagnóstica).
 */
function generateConclusionSection(pathologies) {
    let conclusionListHTML = '<ul id="conclusion-list">';
    const uniqueSuggestions = new Set();
    
    // 1. Compilar hallazgos
    if (pathologies.length > 0) {
        pathologies.forEach(item => {
            // Usar una estructura sencilla: [Patología] en [Órgano]
            conclusionListHTML += `<li>${item.finding} en ${item.organ}</li>`;
            
            if (item.suggestion) {
                uniqueSuggestions.add(item.suggestion);
            }
        });
    } else {
        // Mensaje si no hay hallazgos
        conclusionListHTML += `<li>Estudio Sonográfico dentro de límites normales.</li>`;
    }
    conclusionListHTML += '</ul>';
    
    // 2. Compilar sugerencias (si hay)
    let suggestionsHTML = '';
    
    // 3. Agregar sugerencias opcionales del sidebar y luego las automáticas
    const correlacion = document.getElementById('sugerencia-clinico')?.checked;
    const complementario = document.getElementById('sugerencia-complementario')?.checked;

    if (uniqueSuggestions.size > 0 || correlacion || complementario) {
        suggestionsHTML += '<p class="report-heading">SUGERENCIAS</p>';
        suggestionsHTML += '<ul>';
        
        // Sugerencias opcionales del sidebar
        if (correlacion) {
            suggestionsHTML += '<li>Correlación con el cuadro clínico y laboratorios.</li>';
        }
        if (complementario) {
            suggestionsHTML += '<li>Se recomienda estudio de imagen complementario.</li>';
        }

        // Sugerencias automáticas por patología
        Array.from(uniqueSuggestions).forEach(suggestion => {
            suggestionsHTML += `<li>${suggestion}</li>`;
        });

        suggestionsHTML += '</ul>'; 
    }

    return conclusionListHTML + suggestionsHTML;
}

// ---------------------------------------------------------------------
// MANEJO DE INTERFAZ DE ÓRGANOS - ACTUALIZADA PARA LA TABLA
// ---------------------------------------------------------------------

/**
 * Mapeo de nombres de órganos a iconos de FontAwesome.
 */
const ORGAN_ICONS = {
    'Higado': 'fa-solid fa-liver',
    'Vesicula Biliar': 'fa-solid fa-flask',
    'Páncreas': 'fa-solid fa-stomach', 
    'Bazo': 'fa-solid fa-lungs', 
    'Riñon Derecho': 'fa-solid fa-kidneys',
    'Riñon Izquierdo': 'fa-solid fa-kidneys',
    'Grandes Vasos': 'fa-solid fa-heart-pulse',
    'Cavidad Peritoneal': 'fa-solid fa-layer-group'
};

/**
 * Maneja el cambio entre los botones Normal y Patológico.
 * Muestra u oculta los detalles de la patología y la fila expandible.
 * @param {Event} event - El evento de click en el contenedor de la tabla.
 */
function handleOrganToggle(event) {
    const clickedButton = event.target.closest('.toggle-btn');
    if (!clickedButton) return;
    
    const organRow = clickedButton.closest('.organ-row');
    const organName = organRow.dataset.organ;
    const patologyDetailsRow = document.getElementById(`details-row-${organName.replace(/\s/g, '-')}`);
    
    if (!organRow || !patologyDetailsRow) return;

    // 1. Alternar el estado activo de los botones
    const isPatologicoClick = clickedButton.dataset.estado === 'Patologico';

    // Desactivar todos los botones y clases de fila
    organRow.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    organRow.classList.remove('active-patologico');

    // Activar el botón clickeado
    clickedButton.classList.add('active');

    // 2. Mostrar/Ocultar la fila de detalles
    if (isPatologicoClick) {
        patologyDetailsRow.classList.remove('hidden');
        organRow.classList.add('active-patologico');
    } else {
        patologyDetailsRow.classList.add('hidden');
        // Limpiar los inputs de patología y la medida al volver a Normal para que no se reporten hallazgos residuales
        patologyDetailsRow.querySelectorAll('.patology-checkbox').forEach(chk => chk.checked = false);
        const measureInput = patologyDetailsRow.querySelector('.measure-input');
        if (measureInput) measureInput.value = '';
    }
    
    // 3. Actualizar el reporte
    updateReportContent();
}


/**
 * Función principal para compilar todas las secciones y actualizar el editor.
 */
function updateReportContent() {
    // Verificar si ORGAN_DATA existe globalmente (Asumimos que está definida en organ_templates.js)
    if (typeof ORGAN_DATA === 'undefined') {
        console.error("Error: ORGAN_DATA no está disponible.");
        return; 
    }
    
    const organDescriptionsArea = document.getElementById('organ-descriptions');
    let reportText = '';
    
    // 1. CREAR ARRAY PARA RECOLECTAR HALLAZGOS Y SUGERENCIAS AUTOMÁTICAS
    const collectedPathologies = []; 

    // 2. COMPILACIÓN DE DATOS DEL PACIENTE
    document.getElementById('patient-data-output').innerHTML = generatePatientDataHtml(); 

    // 3. COMPILACIÓN DE DESCRIPCIONES DE ÓRGANOS
    document.querySelectorAll('#organ-table-body .organ-row').forEach(organRow => {
        const organName = organRow.dataset.organ;
        const organData = ORGAN_DATA[organName]; // Usar ORGAN_DATA directamente
        
        if (!organData) return; 

        // Encontrar el estado
        const isPatologicoActive = organRow.querySelector('.toggle-btn.patologico').classList.contains('active');
        const patologyDetailsRow = document.getElementById(`details-row-${organName.replace(/\s/g, '-')}`);
        
        let measureValue = '___';
        let selectedPathologyInputs = [];

        if (patologyDetailsRow) {
            // Obtener el valor de la medida
            const measureInput = patologyDetailsRow.querySelector('.measure-input');
            // Obtener el valor del input. Si está vacío, usar '___'.
            measureValue = measureInput ? measureInput.value || '___' : '___'; 
            
            // Obtener las patologías seleccionadas
            selectedPathologyInputs = patologyDetailsRow.querySelectorAll('.patology-checkbox:checked');
        }

        const rangeText = organData.range || 'ND';

        let description = '';
        
        // Conversión de unidades (MM a CM) - Aplicar al valor de display
        let displayMeasure = measureValue;
        const organsUsingMmInput = ['Vesicula Biliar', 'Grandes Vasos', 'Cavidad Peritoneal'];

        // Solo convertir si el input tiene valor y el órgano lo requiere
        if (measureValue !== '___' && organsUsingMmInput.includes(organName)) {
             displayMeasure = convertMmToCm(measureValue); 
        }

        const hasSelectedPathology = isPatologicoActive && selectedPathologyInputs.length > 0;

        if (!hasSelectedPathology) {
            // ESTADO NORMAL o Patológico seleccionado sin checkboxes marcados (se reporta como Normal)
            description = organData.normal
                .replace('[MEDIDA]', displayMeasure)
                .replace('[RANGE]', rangeText);
        } else {
            // ESTADO PATOLÓGICO CON HALLAZGOS SELECCIONADOS
            
            // Recorre todas las patologías seleccionadas
            const findings = Array.from(selectedPathologyInputs).map(input => {
                const patologyKey = input.value;
                const patologyData = organData.patologies[patologyKey];
                
                // COLECTAR HALLAZGOS Y SUGERENCIAS
                if (patologyData) {
                    collectedPathologies.push({
                        organ: organName,
                        finding: patologyKey, 
                        suggestion: patologyData.suggestion || '' 
                    });
                }

                const patologyTemplate = patologyData?.text || `[Descripción no definida para ${patologyKey}]`;
                return patologyTemplate
                    .replace('[MEDIDA]', displayMeasure) 
                    .replace('[RANGE]', rangeText);
            }).join('<br> • '); 
            
            description = `**Hallazgos:** ${findings}`; // Usar la variable 'findings'
        }

        // Añadir Título de Órgano y Descripción al reporte final
        reportText += `<p><strong>${organName.toUpperCase()}:</strong> ${description}</p>\n`;
    });

    // 4. ACTUALIZAR EL ÁREA DE DESCRIPCIONES
    organDescriptionsArea.innerHTML = reportText;
    
    // 5. GENERAR CONCLUSIONES (Impresión Diagnóstica)
    const conclusionsSection = document.getElementById('report-conclusions-final');
    const notesBox = document.getElementById('notes-box');
    const staticHeading = conclusionsSection?.querySelector('.report-heading');

    if (staticHeading && notesBox) {
        // Limpiar el contenido dinámico anterior (todo entre el título y el textarea)
        let current = staticHeading.nextElementSibling;
        while (current && current !== notesBox) {
            const next = current.nextElementSibling;
            current.remove(); 
            current = next;
        }
        
        // Generar e insertar la sección de conclusiones
        notesBox.insertAdjacentHTML('beforebegin', generateConclusionSection(collectedPathologies));
    }

    // 6. ACTUALIZAR VISTA PREVIA DE FIRMA
    const sonografista = document.getElementById('sonografista')?.value || '__________________________';
    const signaturePreview = document.getElementById('sonografista-signature-preview');
    if (signaturePreview) {
        signaturePreview.textContent = sonografista !== '__________________________' ? ` ${sonografista}` : sonografista;
    }
}

/**
 * Inicializa la lista de órganos en formato de TABLA de forma dinámica.
 */
function initOrgans() {
    // Verificar si ORGAN_DATA existe globalmente
    if (typeof ORGAN_DATA === 'undefined') {
        console.error("Error: ORGAN_DATA no está disponible para inicializar órganos.");
        return; 
    }

    const organListContainer = document.getElementById('organ-list');
    if (!organListContainer) {
        console.error("Error: Contenedor 'organ-list' no encontrado.");
        return;
    }
    
    organListContainer.innerHTML = ''; 
    
    // Iniciar la estructura de la tabla
    let tableHTML = `
        <table class="organ-table">
            <thead>
                <tr>
                    <th>Órgano</th>
                    <th>Estado</th>
                    <th>Medida Ref.</th>
                </tr>
            </thead>
            <tbody id="organ-table-body">
    `;
    
    // Órgamos que deben tener una entrada de número entero (mm)
    const organsUsingMmInput = ['Vesicula Biliar', 'Grandes Vasos', 'Cavidad Peritoneal'];

    // Cargar los órganos de la DATA
    Object.keys(ORGAN_DATA).forEach(organName => {
        const data = ORGAN_DATA[organName];
        const organIcon = ORGAN_ICONS[organName] || 'fa-solid fa-flask';
        
        // Determinar el STEP de entrada
        let inputStep = '0.1'; // Predeterminado para centímetros (permite decimales)
        if (organsUsingMmInput.includes(organName)) {
            inputStep = '1'; 
        }

        const rangeUnit = organsUsingMmInput.includes(organName) ? ' mm' : ' cm'; 
        const rangeDisplay = data.range === 'ND' ? 'ND' : `Rango: ${data.range}${rangeUnit}`; 
        
        // --- 1. FILA PRINCIPAL (3 COLUMNAS) ---
        tableHTML += `
            <tr class="organ-row" data-organ="${organName}">
                <td class="organ-cell"><i class="${organIcon}"></i> ${organName.toUpperCase()}</td>
                <td class="organ-cell">
                    <div class="toggle-group">
                        <button class="toggle-btn normal active" data-estado="Normal"><i class="fas fa-check-circle"></i> N</button>
                        <button class="toggle-btn patologico" data-estado="Patologico"><i class="fas fa-times-circle"></i> P</button>
                    </div>
                </td>
                <td class="organ-cell">${data.label}</td>
            </tr>
        `;

        // --- 2. FILA DE DETALLES (EXPANDIBLE, 1 COLUMNA QUE OCUPA TODO EL ANCHO) ---
        let patologyOptionsHTML = '';
        if (data.patologies && Object.keys(data.patologies).length > 0) {
            patologyOptionsHTML += `
                <p style="font-weight: bold; margin: 0 0 10px 0; font-size: 0.9em; color: var(--color-primary);">Seleccione Hallazgos:</p>
                <div class="patology-options">
            `;
            patologyOptionsHTML += Object.keys(data.patologies).map(key => `
                <div class="patology-checkbox-group">
                    <input type="checkbox" class="patology-checkbox" value="${key}" id="${organName.replace(/\s/g, '-')}-${key.replace(/\s/g, '-')}" data-organ="${organName}">
                    <label for="${organName.replace(/\s/g, '-')}-${key.replace(/\s/g, '-')}" >${key}</label>
                </div>
            `).join('');
             patologyOptionsHTML += `</div>`;
        } else {
             patologyOptionsHTML = '<p style="font-style: italic; font-size: 0.8em; color: #666;">No hay patologías predefinidas para este órgano.</p>';
        }

        // Fila que se expande
        tableHTML += `
            <tr class="patology-details-row hidden" id="details-row-${organName.replace(/\s/g, '-')}" data-organ-details="${organName}">
                <td colspan="3" class="patology-details-cell">
                    <div class="measurement-field">
                        <label>Medida (${data.label}):</label>
                        <input type="number" step="${inputStep}" class="measure-input" 
                            placeholder="Ej. ${data.range ? data.range.split('-')[0] : '0'}">
                        <span class="range-info">${rangeDisplay}</span>
                    </div>
                    ${patologyOptionsHTML}
                </td>
            </tr>
        `;
    });
    
    // Cerrar la estructura de la tabla
    tableHTML += `
            </tbody>
        </table>
    `;
    
    organListContainer.insertAdjacentHTML('beforeend', tableHTML);
}


/**
 * Pone la fecha de hoy en el campo correspondiente.
 */
function setTodayDate() {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dateInput = document.getElementById('fecha-estudio');
    if (dateInput) {
         dateInput.value = formattedDate; 
    }
}

/**
 * Configura todos los event listeners al cargar la página.
 */
function setupEventListeners() {
    // 1. Eventos en los campos de datos del paciente y otros inputs del sidebar
    const inputIds = ['nombre', 'edad', 'identificacion', 'medico-solicitante', 'sonografista', 'fecha-estudio', 'sexo', 'notes-box', 'sugerencia-clinico', 'sugerencia-complementario'];
    inputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            // Usa 'input' para inputs de texto, 'change' para select/checkbox/textarea
            const eventType = (input.type === 'text' || input.type === 'number') ? 'input' : 'change';
            input.addEventListener(eventType, updateReportContent);
        }
    });
    
    // 2. Eventos en los controles de órganos generados dinámicamente
    const organListContainer = document.getElementById('organ-list');
    if (organListContainer) {
        organListContainer.addEventListener('click', handleOrganToggle); // Maneja N/P toggles
        
        organListContainer.addEventListener('input', (event) => {
            // Escucha cambios en las medidas y checkboxes de patología
            if (event.target.classList.contains('measure-input') || event.target.classList.contains('patology-checkbox')) {
                updateReportContent();
            }
        });
    }
    
    // 3. Botones Generar/Actualizar Informe
    document.getElementById('generate-report-btn')?.addEventListener('click', () => {
        updateReportContent();
        alert('Contenido del informe actualizado y listo para impresión.');
    });

    // 4. Botón Imprimir/PDF
    document.getElementById('print-save-btn')?.addEventListener('click', () => {
        updateReportContent(); // Asegura la última compilación antes de imprimir
        window.print(); 
    });
    
    // 5. Botón Nuevo Informe (Para limpiar)
    document.getElementById('new-report-btn')?.addEventListener('click', () => {
        document.getElementById('patient-form')?.reset();
        document.getElementById('notes-box').value = '';
        document.getElementById('sugerencia-clinico').checked = false;
        document.getElementById('sugerencia-complementario').checked = false;
        initOrgans(); // Reinicia la tabla de órganos con el estado por defecto
        setTodayDate();
        updateReportContent();
        alert('Informe reiniciado con los valores por defecto.');
    });
}

// =====================================================================
// 5. INICIALIZACIÓN AL CARGAR EL DOCUMENTO
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Se asegura que la data esté disponible
    if (typeof ORGAN_DATA === 'undefined') {
        console.error("Error FATAL: La constante ORGAN_DATA no está definida. Asegúrese de cargar 'organ_templates.js' antes de 'script.js' en el HTML.");
        // Detener la ejecución si la data principal no está cargada
        return; 
    }
    
    setTodayDate();
    initOrgans();
    setupEventListeners();
    updateReportContent(); // Carga el informe 'Normal' predeterminado al inicio
});