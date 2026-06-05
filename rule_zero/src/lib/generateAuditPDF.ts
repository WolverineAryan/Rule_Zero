import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from 'firebase/auth';

type Clause = {
  id: string;
  clause_number: string;
  title: string | null;
  content_text: string;
  ai_description: string | null;
};

export const generateAuditReport = (
  user: User | null,
  documentTitle: string,
  playbook: string,
  clauses: Clause[],
  checkedItems: Set<string>
) => {
  // 1. Initialize a new standard A4 PDF document
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString();
  const score = clauses.length === 0 ? 0 : Math.round((checkedItems.size / clauses.length) * 100);

  // 2. Build the Corporate Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RULE_ZERO AUDIT REPORT", 14, 22);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${currentDate}`, 14, 30);
  doc.text(`Prepared for: ${user?.displayName || "Guest User"}`, 14, 35);
  doc.text(`Legal Framework: ${documentTitle}`, 14, 40);
  doc.text(`Playbook Category: ${playbook.toUpperCase()}`, 14, 45);

  // 3. The Big Score Indicator
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(score === 100 ? 16 : 220, score === 100 ? 185 : 38, score === 100 ? 129 : 38); // Emerald if 100%, Red if not
  doc.text(`Overall Compliance Score: ${score}%`, 14, 55);
  doc.setTextColor(0, 0, 0); // Reset to black

  // 4. Map the Data for the Table
  const tableData = clauses.map(clause => {
    const isCompliant = checkedItems.has(clause.id);
    return [
      `Sec ${clause.clause_number}`,
      clause.title || "Standard Provision",
      isCompliant ? "COMPLIANT" : "ACTION REQUIRED",
      clause.ai_description || "Manual review required."
    ];
  });

  // 5. Generate the Auto-Paginating Table
  autoTable(doc, {
    startY: 65,
    head: [['Section', 'Title', 'Status', 'Requirement Summary']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 40 },
      2: { cellWidth: 30, fontStyle: 'bold', textColor: [25, 25, 25] },
      3: { cellWidth: 'auto' }
    },
    didParseCell: function(data) {
      // Color-code the Status column inside the PDF
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === 'COMPLIANT') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald Green
        } else {
          data.cell.styles.textColor = [239, 68, 68]; // Red
        }
      }
    }
  });

  // 6. Trigger the browser download
  doc.save(`Rule_Zero_Audit_${playbook}_${currentDate.replace(/\//g, '-')}.pdf`);
};