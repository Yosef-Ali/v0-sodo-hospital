import { PageHeader } from "@/components/ui/page-header"
import { TeamCard } from "@/components/ui/team-card"
import { PageActions } from "@/components/ui/page-actions"

export function TeamsPage() {
  return (
    <div className="p-8">
      <PageHeader title="Teams" description="Manage hospital teams and their members across different departments." />

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400">Showing 9 teams across all departments</div>
        <PageActions searchPlaceholder="Search teams..." buttonText="Create Team" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TeamCard
          name="Emergency Department"
          description="Front-line team handling emergency cases and critical care situations."
          memberCount={24}
          leadName="Dr. James Wilson"
          leadTitle="Emergency Medicine Director"
          tags={["Critical Care", "Trauma", "Triage"]}
        />
        <TeamCard
          name="Surgical Team"
          description="Specialized team performing various surgical procedures and post-operative care."
          memberCount={18}
          leadName="Dr. Sarah Chen"
          leadTitle="Chief of Surgery"
          tags={["Surgery", "Operating Room", "Post-Op"]}
        />
        <TeamCard
          name="Nursing Staff"
          description="Core nursing team providing patient care across all hospital departments."
          memberCount={45}
          leadName="Nancy Johnson"
          leadTitle="Chief Nursing Officer"
          tags={["Patient Care", "Medication", "Monitoring"]}
        />
        <TeamCard
          name="Administrative Staff"
          description="Team handling hospital administration, records, and operational logistics."
          memberCount={15}
          leadName="Michael Roberts"
          leadTitle="Administrative Director"
          tags={["Operations", "Records", "Scheduling"]}
        />
        <TeamCard
          name="Laboratory Team"
          description="Specialists conducting medical tests and analyzing patient samples."
          memberCount={12}
          leadName="Dr. Emily Patel"
          leadTitle="Laboratory Director"
          tags={["Diagnostics", "Testing", "Analysis"]}
        />
        <TeamCard
          name="Radiology Department"
          description="Team specializing in medical imaging and diagnostic procedures."
          memberCount={10}
          leadName="Dr. Robert Kim"
          leadTitle="Chief Radiologist"
          tags={["Imaging", "X-Ray", "MRI"]}
        />
        <TeamCard
          name="Pharmacy Staff"
          description="Team managing medication dispensing, inventory, and patient education."
          memberCount={8}
          leadName="Dr. Lisa Wong"
          leadTitle="Chief Pharmacist"
          tags={["Medications", "Dispensing", "Inventory"]}
        />
        <TeamCard
          name="IT Department"
          description="Technical team maintaining hospital systems, networks, and digital infrastructure."
          memberCount={6}
          leadName="David Martinez"
          leadTitle="IT Director"
          tags={["Systems", "Support", "Security"]}
        />
        <TeamCard
          name="Quality Improvement"
          description="Team focused on monitoring and improving hospital quality metrics and patient safety."
          memberCount={7}
          leadName="Dr. Thomas Jackson"
          leadTitle="Quality Director"
          tags={["Quality", "Safety", "Compliance"]}
        />
      </div>
    </div>
  )
}
