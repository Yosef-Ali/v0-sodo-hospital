import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import type { ReportData } from '@/lib/types/reports';

// Register a font (optional, standard fonts work but custom looks better. Using standard Helvetica for now)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db', // gray-300
    paddingBottom: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
  },
  description: {
    fontSize: 10,
    color: '#4b5563', // gray-600
    marginBottom: 10,
    lineHeight: 1.4,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    width: '45%',
    flexDirection: 'row',
    marginBottom: 5,
  },
  metaLabel: {
    fontWeight: 'bold',
    width: 80,
    color: '#374151',
  },
  metaValue: {
    color: '#4b5563',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#111',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 8,
    flex: 1,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 9,
    color: '#4b5563',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%', // Default, overrides inline
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 10,
    color: '#4b5563',
  },
  tableCellMoney: {
    fontSize: 10,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 2,
    borderTopColor: '#d1d5db',
    paddingTop: 10,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Text Colors
  textGreen: { color: '#059669' },
  textRed: { color: '#dc2626' },
  textBlue: { color: '#2563eb' },
  textPurple: { color: '#7c3aed' },
  textOrange: { color: '#ea580c' },
});

interface StandardReportPDFProps {
  report: ReportData;
  data?: any;
}

const formatDate = (date: Date | null | undefined) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMMM dd, yyyy HH:mm');
};

export const StandardReportPDF: React.FC<StandardReportPDFProps> = ({ report, data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 2 }}>Soddo Hospital</Text>
          <Text style={{ fontSize: 10, color: '#666' }}>Hospital Management System</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 8, color: '#666' }}>Generated on</Text>
          <Text style={{ fontSize: 10 }}>{formatDate(new Date())}</Text>
        </View>
      </View>

      {/* Report Info */}
      <View style={styles.titleSection}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        {report.description && (
          <Text style={styles.description}>{report.description.replace(/[*_#]/g, '')}</Text> // Simple strip markdown
        )}
        
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Department:</Text>
            <Text style={styles.metaValue}>{report.department || 'All Departments'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaValue}>{report.category || 'General'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Frequency:</Text>
            <Text style={styles.metaValue}>{report.frequency}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Status:</Text>
            <Text style={styles.metaValue}>{report.status}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ReportContent report={report} data={data} />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>This report was automatically generated by Soddo Hospital Management System</Text>
        <Text style={styles.footerText}>Report ID: {report.id} | Generated: {formatDate(new Date())}</Text>
      </View>
    </Page>
  </Document>
);

const ReportContent = ({ report, data }: { report: ReportData; data: any }) => {
  switch (report.category?.toLowerCase()) {
    case 'financial':
      return <FinancialContent data={data} />;
    case 'patient':
      return <PatientContent data={data} />;
    case 'staff':
      return <StaffContent data={data} />;
    case 'operations':
      return <OperationsContent data={data} />;
    default:
      return <GenericContent report={report} />;
  }
};

// --- Sub-Components ---

const FinancialContent = ({ data }: { data: any }) => {
  const sampleData = data || {
    revenue: 125000,
    expenses: 95000,
    profit: 30000,
    transactions: [
      { date: "2024-01-15", description: "Patient Services", amount: 25000 },
      { date: "2024-01-20", description: "Laboratory Services", amount: 15000 },
      { date: "2024-01-25", description: "Medical Supplies", amount: -12000 },
    ],
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Financial Summary</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Total Revenue</Text>
          <Text style={[styles.cardValue, styles.textGreen]}>${sampleData.revenue.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Total Expenses</Text>
          <Text style={[styles.cardValue, styles.textRed]}>${sampleData.expenses.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Net Profit</Text>
          <Text style={[styles.cardValue, styles.textBlue]}>${sampleData.profit.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { fontSize: 12 }]}>Recent Transactions</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, { width: '25%' }]}>
            <Text style={styles.tableCellHeader}>Date</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '50%' }]}>
            <Text style={styles.tableCellHeader}>Description</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '25%' }]}>
            <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Amount</Text>
          </View>
        </View>
        {sampleData.transactions.map((item: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>{item.date}</Text>
            </View>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text style={styles.tableCell}>{item.description}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={[styles.tableCellMoney, item.amount >= 0 ? styles.textGreen : styles.textRed]}>
                 ${Math.abs(item.amount).toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const PatientContent = ({ data }: { data: any }) => {
   const sampleData = data || {
    totalPatients: 450,
    newPatients: 75,
    admissions: 120,
    discharges: 95,
    departments: [
      { name: "Emergency", count: 85 },
      { name: "Surgery", count: 45 },
      { name: "Pediatrics", count: 65 },
      { name: "Cardiology", count: 55 },
    ],
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Patient Statistics</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Total Patients</Text>
          <Text style={[styles.cardValue, styles.textBlue]}>{sampleData.totalPatients}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>New Patients</Text>
          <Text style={[styles.cardValue, styles.textGreen]}>{sampleData.newPatients}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Admissions</Text>
          <Text style={[styles.cardValue, styles.textPurple]}>{sampleData.admissions}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Discharges</Text>
          <Text style={[styles.cardValue, styles.textOrange]}>{sampleData.discharges}</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { fontSize: 12 }]}>Patients by Department</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
           <View style={[styles.tableColHeader, { width: '70%' }]}>
            <Text style={styles.tableCellHeader}>Department</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '30%' }]}>
            <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Patient Count</Text>
          </View>
        </View>
         {sampleData.departments.map((item: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text style={styles.tableCell}>{item.name}</Text>
            </View>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>{item.count}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const StaffContent = ({ data }: { data: any }) => {
   const sampleData = data || {
    totalStaff: 250,
    doctors: 85,
    nurses: 120,
    admin: 45,
    departments: [
      { name: "Medical", count: 85, available: 80 },
      { name: "Nursing", count: 120, available: 115 },
      { name: "Administration", count: 45, available: 42 },
    ],
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Staff Report</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Total Staff</Text>
          <Text style={[styles.cardValue, styles.textBlue]}>{sampleData.totalStaff}</Text>
        </View>
        <View style={styles.summaryCard}>
           <Text style={styles.cardLabel}>Doctors</Text>
          <Text style={[styles.cardValue, styles.textGreen]}>{sampleData.doctors}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Nurses</Text>
          <Text style={[styles.cardValue, styles.textPurple]}>{sampleData.nurses}</Text>
        </View>
          <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Admin</Text>
          <Text style={[styles.cardValue, styles.textOrange]}>{sampleData.admin}</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { fontSize: 12 }]}>Staff by Department</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
           <View style={[styles.tableColHeader, { width: '40%' }]}>
            <Text style={styles.tableCellHeader}>Department</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '30%' }]}>
            <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Total</Text>
          </View>
           <View style={[styles.tableColHeader, { width: '30%' }]}>
            <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Available</Text>
          </View>
        </View>
         {sampleData.departments.map((item: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>{item.name}</Text>
            </View>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>{item.count}</Text>
            </View>
             <View style={[styles.tableCol, { width: '30%' }]}>
              <Text style={[styles.tableCell, { textAlign: 'right', color: 'green' }]}>{item.available}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const OperationsContent = ({ data }: { data: any }) => {
  const sampleData = data || {
    surgeries: 45,
    emergencies: 120,
    bedOccupancy: 85,
    equipment: [
      { name: "MRI Machine", status: "Operational", usage: "85%" },
      { name: "CT Scanner", status: "Operational", usage: "92%" },
      { name: "X-Ray Unit 1", status: "Maintenance", usage: "0%" },
      { name: "Ultrasound", status: "Operational", usage: "78%" },
    ],
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Operations Report</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Surgeries</Text>
          <Text style={[styles.cardValue, styles.textBlue]}>{sampleData.surgeries}</Text>
        </View>
         <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Emergencies</Text>
          <Text style={[styles.cardValue, styles.textRed]}>{sampleData.emergencies}</Text>
        </View>
         <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Bed Occupancy</Text>
          <Text style={[styles.cardValue, styles.textGreen]}>{sampleData.bedOccupancy}%</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { fontSize: 12 }]}>Equipment Status</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
           <View style={[styles.tableColHeader, { width: '40%' }]}>
            <Text style={styles.tableCellHeader}>Equipment</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '30%' }]}>
            <Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>Status</Text>
          </View>
           <View style={[styles.tableColHeader, { width: '30%' }]}>
            <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Usage</Text>
          </View>
        </View>
         {sampleData.equipment.map((item: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>{item.name}</Text>
            </View>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text style={[styles.tableCell, 
                { textAlign: 'center', color: item.status === 'Operational' ? 'green' : 'red' }
              ]}>{item.status}</Text>
            </View>
             <View style={[styles.tableCol, { width: '30%' }]}>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>{item.usage}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const GenericContent = ({ report }: { report: ReportData }) => (
  <View style={{ padding: 10, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb', borderRadius: 4 }}>
    <Text style={styles.sectionTitle}>Report Details</Text>
    <View style={{ marginBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={[styles.metaLabel, {width: 100}]}>Report Period:</Text>
      <Text style={styles.metaValue}>{format(new Date(), 'MMMM yyyy')}</Text>
    </View>
    <View style={{ marginBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
       <Text style={[styles.metaLabel, {width: 100}]}>Generated By:</Text>
      <Text style={styles.metaValue}>System Administrator</Text>
    </View>
  </View>
);
