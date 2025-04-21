import { PageHeader } from "@/components/ui/page-header"
import { DepartmentCard } from "@/components/ui/department-card"
import { PageActions } from "@/components/ui/page-actions"

export function DepartmentsPage() {
  return (
    <div className="p-8">
      <PageHeader title="Departments" description="Manage hospital departments and their operational structures." />

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400">Showing all hospital departments</div>
        <PageActions searchPlaceholder="Search departments..." buttonText="Add Department" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DepartmentCard
          name="Emergency Medicine"
          description="Provides immediate care for acute illnesses and injuries requiring urgent medical attention."
          staffCount={32}
          headName="Dr. James Wilson"
          location="Building A, Floor 1"
          metrics={[
            { label: "Patients/Day", value: "45" },
            { label: "Avg. Wait Time", value: "22 min" },
            { label: "Satisfaction", value: "87%" },
          ]}
        />
        <DepartmentCard
          name="Surgery"
          description="Performs surgical procedures for both inpatient and outpatient cases across multiple specialties."
          staffCount={28}
          headName="Dr. Sarah Chen"
          location="Building B, Floor 3"
          metrics={[
            { label: "Surgeries/Week", value: "65" },
            { label: "Success Rate", value: "98.5%" },
            { label: "Utilization", value: "82%" },
          ]}
        />
        <DepartmentCard
          name="Internal Medicine"
          description="Provides comprehensive care for adult patients with a wide range of medical conditions."
          staffCount={35}
          headName="Dr. Michael Brown"
          location="Building A, Floor 2"
          metrics={[
            { label: "Patients/Day", value: "38" },
            { label: "Bed Occupancy", value: "78%" },
            { label: "Avg. Stay", value: "4.2 days" },
          ]}
        />
        <DepartmentCard
          name="Pediatrics"
          description="Specializes in medical care for infants, children, and adolescents up to age 18."
          staffCount={25}
          headName="Dr. Emily Rodriguez"
          location="Building C, Floor 1"
          metrics={[
            { label: "Patients/Day", value: "32" },
            { label: "Vaccination Rate", value: "95%" },
            { label: "Satisfaction", value: "92%" },
          ]}
        />
        <DepartmentCard
          name="Obstetrics & Gynecology"
          description="Provides care for women's reproductive health and pregnancy-related services."
          staffCount={22}
          headName="Dr. Lisa Wong"
          location="Building B, Floor 2"
          metrics={[
            { label: "Deliveries/Month", value: "85" },
            { label: "C-Section Rate", value: "24%" },
            { label: "Prenatal Visits", value: "320/month" },
          ]}
        />
        <DepartmentCard
          name="Radiology"
          description="Performs diagnostic imaging services including X-rays, CT scans, MRIs, and ultrasounds."
          staffCount={18}
          headName="Dr. Robert Kim"
          location="Building A, Floor 1"
          metrics={[
            { label: "Scans/Day", value: "75" },
            { label: "Report Time", value: "24 hrs" },
            { label: "Equipment Uptime", value: "99.2%" },
          ]}
        />
        <DepartmentCard
          name="Laboratory"
          description="Conducts clinical tests and analyses to support diagnosis and treatment decisions."
          staffCount={15}
          headName="Dr. Thomas Jackson"
          location="Building B, Floor 1"
          metrics={[
            { label: "Tests/Day", value: "450" },
            { label: "Turnaround Time", value: "4 hrs" },
            { label: "Accuracy Rate", value: "99.8%" },
          ]}
        />
        <DepartmentCard
          name="Pharmacy"
          description="Manages medication dispensing, inventory, and patient education across the hospital."
          staffCount={12}
          headName="Dr. Jennifer Martinez"
          location="Building A, Floor 1"
          metrics={[
            { label: "Prescriptions/Day", value: "320" },
            { label: "Error Rate", value: "0.01%" },
            { label: "Inventory Value", value: "$1.2M" },
          ]}
        />
        <DepartmentCard
          name="Physical Therapy"
          description="Provides rehabilitation services to help patients recover physical function and mobility."
          staffCount={10}
          headName="Dr. David Thompson"
          location="Building C, Floor 2"
          metrics={[
            { label: "Sessions/Day", value: "45" },
            { label: "Recovery Rate", value: "87%" },
            { label: "Satisfaction", value: "94%" },
          ]}
        />
      </div>
    </div>
  )
}
