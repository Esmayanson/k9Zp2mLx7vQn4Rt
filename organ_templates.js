// =====================================================================
// 1. DATA STRUCTURE (PLANTILLAS Y RANGOS)
//    Este archivo contiene la única fuente de verdad para el contenido
//    del reporte.
// =====================================================================

const ORGAN_DATA = {
    'Higado': {
        range: '10-15',
        label: 'Lóbulo derecho (cm)',
        normal: "Morfología y dimensiones conservadas. Contornos regulares. Parénquima de ecogenicidad homogénea. Sin evidencia de lesiones focales (masas o tumores). Midiendo [MEDIDA] cm.",
        patologies: {
            'Esteatosis Hepática Grado I': {
                text: "Esteatosis Hepática Grado I: Se observa un incremento difuso y tenue de la ecogenicidad hepática. Parénquima homogéneo. La permeabilidad y visibilidad de las estructuras vasculares y del diafragma se mantienen. Midiendo [MEDIDA] cm.",
                suggestion: "Hacer correlación bajo el contexto clínico y de laboratorio." 
            },
            'Esteatosis Hepática Grado II': {
                text: "Esteatosis Hepatosis Grado II: Aumento marcado de la ecogenicidad parenquimal. Se inicia una ligera atenuación posterior con disminución en la visualización de las estructuras vasculares. Existe un claro gradiente con el riñón derecho. Midiendo [MEDIDA] cm.",
                suggestion: "Referir a gastroenterología y control metabólico."
            },
            'Lesión Focal (Quiste)': {
                text: "Se identifica una lesión quística simple, anecoica, de paredes finas y refuerzo acústico posterior, en el segmento X, de [MEDIDA] cm de diámetro. Compatible con quiste simple.",
                suggestion: "Control ecográfico en 6 meses o según indicación clínica."
            }
        }
    },
    'Vesicula Biliar': {
        range: 'ND', 
        label: 'Pared (mm)',
        // CORRECCIÓN: Se actualiza la descripción para no usar [RANGE] cuando es 'ND'
        normal: "Vesícula biliar distendida con paredes finas (generalmente < 3 mm). Contenido anecoico, sin evidencia de litiasis ni colecciones perivesiculares. Pared midiendo [MEDIDA] mm.",
        patologies: {
            'Litiasis Simple': {
                text: "Se observan múltiples imágenes ecogénicas en su interior con sombra acústica posterior, móviles con el cambio de posición, compatibles con litiasis biliar.",
                suggestion: "Referir a cirugía o gastroenterología para evaluación de colecistectomía."
            },
            'Colecistitis': {
                text: "Pared vesicular difusamente engrosada ([MEDIDA] mm, normal menor a [RANGE] mm), con líquido perivesicular. Signo de Murphy ecográfico positivo. Compatible con Colecistitis Aguda.",
                suggestion: "Referir a urgencias quirúrgicas inmediatamente."
            }
        }
    },
    'Páncreas': {
        range: 'ND', 
        label: 'Cabeza/Cuerpo (cm)',
        normal: "El páncreas muestra una morfología conservada. Contornos regulares, ecogenicidad y ecotextura homogéneas. Conducto pancreático principal sin dilatación. Visualización parcial debido a interposición gaseosa.",
        patologies: {
             'Pancreatitis Aguda': {
                text: "El páncreas se encuentra aumentado de tamaño, de ecogenicidad disminuida y contornos irregulares. Compatible con edema por Pancreatitis Aguda.",
                suggestion: "Correlación clínica y laboratorial (amilasa/lipasa). Manejo médico urgente."
            }
        }
    },
    'Bazo': {
        range: '7-12',
        label: 'Longitud (cm)',
        normal: "Bazo de tamaño normal. Contornos lisos. Parénquima de ecogenicidad y ecotextura homogéneas. Midiendo [MEDIDA] cm.",
        patologies: {
            'Esplenomegalia Leve': {
                text: "Bazo aumentado de tamaño (Esplenomegalia) con una longitud máxima de [MEDIDA] cm, (normal hasta [RANGE] cm). Parénquima homogéneo.",
                suggestion: "Correlación con el cuadro clínico (Ej: procesos infecciosos o hematológicos)."
            }
        }
    },
    'Riñon Derecho': {
        range: '9-12',
        label: 'Longitud (cm)',
        normal: "Riñón de tamaño conservado. Contornos regulares. Buena diferenciación corticomedular. No se evidencia hidronefrosis ni litiasis. Longitud: [MEDIDA] cm.",
        patologies: {
            'Litiasis': {
                text: "Se visualiza una imagen ecogénica con sombra acústica posterior en el polo inferior/medio, compatible con litiasis renal. Longitud: [MEDIDA] cm.",
                suggestion: "Referir a urología para manejo. Se sugiere análisis de orina y química sanguínea." 
            },
            'Hidronefrosis Grado I': {
                text: "Dilatación leve del sistema pielocalicial (Grado I), con cálices y pelvis renal ligeramente distendidos, sin compromiso parenquimal significativo. Longitud: [MEDIDA] cm.",
                suggestion: "Control ecográfico en 4 semanas para evaluar progresión y descartar obstrucción." 
            }
        }
    },
    'Riñon Izquierdo': {
        range: '9-12',
        label: 'Longitud (cm)',
        normal: "Riñón de tamaño conservado. Contornos regulares. Buena diferenciación corticomedular. No se evidencia hidronefrosis ni litiasis. Longitud: [MEDIDA] cm.",
        patologies: {
            'Litiasis': {
                text: "Se visualiza una imagen ecogénica con sombra acústica posterior en el polo inferior/medio, compatible con litiasis renal. Longitud: [MEDIDA] cm.",
                suggestion: "Referir a urología para manejo. Se sugiere análisis de orina y química sanguínea." 
            },
            'Hidronefrosis Grado I': {
                text: "Dilatación leve del sistema pielocalicial (Grado I), con cálices y pelvis renal ligeramente distendidos, sin compromiso parenquimal significativo. Longitud: [MEDIDA] cm.",
                suggestion: "Control ecográfico en 4 semanas para evaluar progresión y descartar obstrucción." 
            }
        }
    },
    'Grandes Vasos': {
        range: 'ND', 
        label: 'Medida (cm)',
        normal: "La aorta y la vena cava inferior presentan diámetros conservados. Flujo vascular sin alteraciones significativas.",
        patologies: {
             'Aneurisma Aórtico': {
                text: "Dilatación de la aorta abdominal con un diámetro máximo de [MEDIDA] cm (normal < 3.0 cm). Compatible con Aneurisma de la Aorta Abdominal.",
                suggestion: "Referir a cirugía vascular inmediatamente. Control de presión arterial."
            }
        }
    },
    'Cavidad Peritoneal': {
        range: 'ND',
        label: 'Espesor (cm)',
        normal: "Ausencia de líquido libre (ascitis) o colecciones focales. El peritoneo presenta apariencia normal.",
        patologies: {
             'Ascitis (Líquido Libre)': {
                text: "Se observa presencia de líquido libre anecoico en la cavidad peritoneal, predominantemente en los cuadrantes inferiores y espacio hepatorrenal (Morrison).",
                suggestion: "Referir a medicina interna o gastroenterología. Evaluación de función hepática y paracentesis diagnóstica." 
            }
        }
    },
    // Añade más órganos aquí siguiendo el formato...
};