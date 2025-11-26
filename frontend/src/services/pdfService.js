import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generateRoutinePDF = (routine) => {
    const doc = new jsPDF();

    // Colors
    const primaryColor = [37, 99, 235]; // Blue 600
    const secondaryColor = [75, 85, 99]; // Gray 600

    // Header
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text('Antigravity Routines', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28);

    // Routine Info
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(routine.name || 'Rutina Sin Nombre', 14, 40);

    if (routine.student_name) {
        doc.setFontSize(12);
        doc.setTextColor(...secondaryColor);
        doc.text(`Alumno: ${routine.student_name}`, 14, 48);
    }

    if (routine.description) {
        doc.setFontSize(11);
        doc.setTextColor(...secondaryColor);
        doc.text(routine.description, 14, routine.student_name ? 56 : 48);
    }

    // Exercises Table
    const tableColumn = ["Ejercicio", "Categoría", "Series", "Reps", "Peso", "Notas"];
    const tableRows = [];

    if (routine.exercises && routine.exercises.length > 0) {
        routine.exercises.forEach(ex => {
            const exerciseData = [
                ex.exercise_name,
                ex.category || 'Otro',
                ex.series,
                ex.repetitions,
                ex.weight ? `${ex.weight} kg` : '-',
                ex.notes || '-'
            ];
            tableRows.push(exerciseData);
        });
    }

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: routine.description ? 65 : 55,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [243, 244, 246] // Gray 100
        }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    // Save
    const fileName = `Rutina_${routine.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

export default {
    generateRoutinePDF
};
