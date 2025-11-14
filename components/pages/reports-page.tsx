import { PageHeader } from "@/components/ui/page-header"
import { ReportCard } from "@/components/ui/report-card"
import { PageActions } from "@/components/ui/page-actions"

export function ReportsPage() {
  return (
    <div className="p-8">
      <PageHeader
        title="Reports"
        description="Access and generate reports for hospital operations and performance metrics."
      />

      <div className="mt-[200px] flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400">Showing all available reports</div>
        <PageActions searchPlaceholder="Search reports..." buttonText="Generate Report" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Monthly Patient Statistics"
          description="Comprehensive report on patient admissions, discharges, and demographics."
          lastGenerated="Yesterday"
          frequency="Monthly"
          format="PDF, Excel"
          department="Administration"
        />
        <ReportCard
          title="Financial Performance"
          description="Detailed financial metrics including revenue, expenses, and budget variance."
          lastGenerated="3 days ago"
          frequency="Monthly"
          format="Excel, PowerPoint"
          department="Finance"
        />
        <ReportCard
          title="Staff Productivity"
          description="Analysis of staff performance, workload distribution, and efficiency metrics."
          lastGenerated="1 week ago"
          frequency="Quarterly"
          format="PDF"
          department="Human Resources"
        />
        <ReportCard
          title="Quality Indicators"
          description="Key quality metrics including patient satisfaction, safety incidents, and compliance."
          lastGenerated="2 weeks ago"
          frequency="Monthly"
          format="PDF, Dashboard"
          department="Quality"
        />
        <ReportCard
          title="Inventory Status"
          description="Current inventory levels, usage trends, and reorder recommendations."
          lastGenerated="Yesterday"
          frequency="Weekly"
          format="Excel"
          department="Supply Chain"
        />
        <ReportCard
          title="Department Utilization"
          description="Analysis of department capacity, utilization rates, and resource allocation."
          lastGenerated="5 days ago"
          frequency="Monthly"
          format="PDF, Dashboard"
          department="Operations"
        />
        <ReportCard
          title="Medication Usage"
          description="Patterns of medication prescribing, dispensing, and administration."
          lastGenerated="3 days ago"
          frequency="Monthly"
          format="PDF, Excel"
          department="Pharmacy"
        />
        <ReportCard
          title="Equipment Maintenance"
          description="Status of equipment maintenance, repairs, and replacement schedule."
          lastGenerated="1 month ago"
          frequency="Quarterly"
          format="PDF"
          department="Facilities"
        />
        <ReportCard
          title="Regulatory Compliance"
          description="Status of compliance with regulatory requirements and accreditation standards."
          lastGenerated="2 months ago"
          frequency="Quarterly"
          format="PDF, Dashboard"
          department="Compliance"
        />
      </div>
    </div>
  )
}
