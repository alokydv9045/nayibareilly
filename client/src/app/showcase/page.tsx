/**
 * Component Showcase - Visual examples of all shared components
 * 
 * This file demonstrates all components from the shared library.
 * Use this as a reference or copy examples for your own pages.
 */

'use client'

import { 
  StatusBadge, 
  PriorityBadge,
  IssueCardCitizen,
  IssueCardModerator,
  IssueCardStaff,
  IssueCardAdmin,
  IssueTimeline,
  TimelineStepper,
  StatusTransition,
  StatsCard,
  DataTable
} from '@/components/shared'
import type { BaseIssue, TimelineEvent, WorkflowStep } from '@/components/shared'
import type { IssueStatus } from '@/components/shared/StatusBadge'
import type { IssuePriority } from '@/components/shared/PriorityBadge'
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

// ===========================
// Sample Data
// ===========================

const sampleIssue: BaseIssue = {
  id: '1',
  reportId: 'RPT-2024-001',
  title: 'Broken street light on Main Street',
  description: 'The street light near the intersection has been out for several days, making the area unsafe at night.',
  category: 'Infrastructure',
  categoryName: 'Street Lighting',
  status: 'in_progress',
  priority: 'high',
  address: '123 Main Street, Downtown',
  location: { latitude: 40.7128, longitude: -74.0060 },
  reporterName: 'John Doe',
  reporterId: 'user-123',
  assignedToName: 'Jane Smith',
  departmentName: 'Public Works',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-16T14:20:00Z',
  images: [
    { id: 'img-1', url: '/images/issues/street-light-1.jpg', altText: 'Broken light' },
    { id: 'img-2', url: '/images/issues/street-light-2.jpg', altText: 'Location view' }
  ],
  commentsCount: 5,
  viewsCount: 42
}

const sampleTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'created',
    title: 'Issue Reported',
    description: 'Citizen reported broken street light',
    timestamp: '2024-01-15T10:30:00Z',
    user: {
      id: 'user-123',
      name: 'John Doe',
      avatar: '/avatars/john.jpg',
      role: 'Citizen'
    }
  },
  {
    id: '2',
    type: 'status_change',
    title: 'Issue Approved',
    description: 'Moderator verified and approved the issue',
    timestamp: '2024-01-15T11:45:00Z',
    user: {
      id: 'mod-456',
      name: 'Sarah Johnson',
      role: 'Moderator'
    },
    metadata: {
      oldStatus: 'open',
      newStatus: 'approved'
    }
  },
  {
    id: '3',
    type: 'assigned',
    title: 'Issue Assigned',
    description: 'Assigned to Public Works department',
    timestamp: '2024-01-15T14:20:00Z',
    user: {
      id: 'admin-789',
      name: 'Mike Wilson',
      role: 'Department Admin'
    },
    metadata: {
      assignedTo: 'Jane Smith'
    }
  },
  {
    id: '4',
    type: 'status_change',
    title: 'Work Started',
    description: 'Staff member started working on the issue',
    timestamp: '2024-01-16T09:00:00Z',
    user: {
      id: 'staff-101',
      name: 'Jane Smith',
      role: 'Staff'
    },
    metadata: {
      oldStatus: 'approved',
      newStatus: 'in_progress'
    }
  },
  {
    id: '5',
    type: 'comment',
    title: 'Update Posted',
    description: 'Staff provided progress update',
    timestamp: '2024-01-16T14:20:00Z',
    user: {
      id: 'staff-101',
      name: 'Jane Smith',
      role: 'Staff'
    },
    metadata: {
      comment: 'Replacement part has been ordered. Expected to complete repairs by end of week.'
    }
  }
]

const sampleWorkflowSteps: WorkflowStep[] = [
  { id: '1', label: 'Submitted', status: 'open', completedAt: '2024-01-15T10:30:00Z' },
  { id: '2', label: 'Approved', status: 'approved', completedAt: '2024-01-15T11:45:00Z' },
  { id: '3', label: 'In Progress', status: 'in_progress', isActive: true },
  { id: '4', label: 'Resolved', status: 'resolved' },
  { id: '5', label: 'Verified', status: 'verified' }
]

const sampleTableData = [
  {
    id: '1',
    reportId: 'RPT-2024-001',
    title: 'Broken street light',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2024-01-15T10:30:00Z',
    department: 'Public Works'
  },
  {
    id: '2',
    reportId: 'RPT-2024-002',
    title: 'Pothole on Oak Avenue',
    status: 'open',
    priority: 'medium',
    createdAt: '2024-01-16T08:15:00Z',
    department: 'Road Maintenance'
  },
  {
    id: '3',
    reportId: 'RPT-2024-003',
    title: 'Graffiti removal needed',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-01-14T16:45:00Z',
    department: 'Sanitation'
  }
]

// ===========================
// Component Showcase
// ===========================

export default function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold mb-2">Component Library Showcase</h1>
          <p className="text-muted-foreground">
            Visual examples of all shared components with copy-paste code
          </p>
        </header>

        {/* Divider */}
        <div className="border-t" />

        {/* Status Badges */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Status Badges</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">All Statuses</h3>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="open" showIcon showTooltip />
                <StatusBadge status="pending" showIcon showTooltip />
                <StatusBadge status="in_progress" showIcon showTooltip />
                <StatusBadge status="approved" showIcon showTooltip />
                <StatusBadge status="resolved" showIcon showTooltip />
                <StatusBadge status="verified" showIcon showTooltip />
                <StatusBadge status="rejected" showIcon showTooltip />
                <StatusBadge status="closed" showIcon showTooltip />
                <StatusBadge status="archived" showIcon showTooltip />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Size Variants</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status="in_progress" size="sm" showIcon />
                <StatusBadge status="in_progress" size="md" showIcon />
                <StatusBadge status="in_progress" size="lg" showIcon />
              </div>
            </div>
          </div>
        </section>

        {/* Priority Badges */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Priority Badges</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">All Priorities</h3>
              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority="low" showIcon showTooltip />
                <PriorityBadge priority="medium" showIcon showTooltip />
                <PriorityBadge priority="high" showIcon showTooltip />
                <PriorityBadge priority="critical" showIcon showTooltip />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Stats Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard 
              title="Total Issues"
              value={247}
              icon={AlertCircle}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-100"
              change={{ value: 12, label: "from last month", trend: "up" }}
            />
            <StatsCard 
              title="In Progress"
              value={89}
              icon={Clock}
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-100"
            />
            <StatsCard 
              title="Resolved"
              value={121}
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
              change={{ value: 8, label: "this week", trend: "up" }}
            />
            <StatsCard 
              title="Satisfaction"
              value="94%"
              icon={TrendingUp}
              iconColor="text-slate-800"
              iconBgColor="bg-purple-100"
              change={{ value: 3, label: "from last quarter", trend: "up" }}
            />
          </div>
        </section>

        {/* Issue Cards */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Issue Cards</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Citizen View</h3>
              <IssueCardCitizen 
                issue={sampleIssue}
                showViewButton
                showMapButton
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Moderator View</h3>
              <IssueCardModerator 
                issue={sampleIssue}
                onApprove={(id) => console.log('Approve:', id)}
                onReject={(id) => console.log('Reject:', id)}
                onRequestInfo={(id) => console.log('Request info:', id)}
                onMarkSpam={(id) => console.log('Mark spam:', id)}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Staff View</h3>
              <IssueCardStaff 
                issue={sampleIssue}
                onStartWork={(id) => console.log('Start work:', id)}
                onMarkResolved={(id) => console.log('Mark resolved:', id)}
                onAddUpdate={(id) => console.log('Add update:', id)}
                isAssignedToUser={true}
                completionPercentage={65}
                estimatedTime="2 hours"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Admin View</h3>
              <IssueCardAdmin 
                issue={sampleIssue}
                onAssign={(id) => console.log('Assign:', id)}
                onEdit={(id) => console.log('Edit:', id)}
                showAnalytics
                analytics={{
                  responseTime: "2h 15m",
                  resolutionTime: "1d 4h",
                  citizenSatisfaction: 92
                }}
              />
            </div>
          </div>
        </section>

        {/* Timeline Components */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Timeline Components</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Issue Timeline</h3>
              <div className="bg-card p-6 rounded-lg border">
                <IssueTimeline events={sampleTimelineEvents} showAvatar />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Timeline Stepper (Horizontal)</h3>
              <div className="bg-card p-6 rounded-lg border">
                <TimelineStepper 
                  steps={sampleWorkflowSteps}
                  currentStep={2}
                  orientation="horizontal"
                  showDescription
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Timeline Stepper (Vertical)</h3>
              <div className="bg-card p-6 rounded-lg border max-w-md">
                <TimelineStepper 
                  steps={sampleWorkflowSteps}
                  currentStep={2}
                  orientation="vertical"
                  showDescription
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Status Transition</h3>
              <StatusTransition 
                oldStatus="open"
                newStatus="in_progress"
                timestamp={new Date()}
                user={{
                  name: "Jane Smith",
                  avatar: "/avatars/jane.jpg",
                  role: "Staff"
                }}
                reason="Issue has been assigned to the Public Works department"
              />
            </div>
          </div>
        </section>

        {/* Data Table */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Data Table</h2>
          <DataTable 
            columns={[
              {
                key: 'reportId',
                label: 'Report ID',
                sortable: true,
                width: '130px'
              },
              {
                key: 'title',
                label: 'Title',
                sortable: true,
                filterable: true
              },
              {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (value) => <StatusBadge status={value as IssueStatus} size="sm" />
              },
              {
                key: 'priority',
                label: 'Priority',
                sortable: true,
                render: (value) => <PriorityBadge priority={value as IssuePriority} size="sm" />
              },
              {
                key: 'department',
                label: 'Department',
                sortable: true
              },
              {
                key: 'createdAt',
                label: 'Created',
                sortable: true,
                render: (value) => format(new Date(value as string), 'MMM dd, yyyy')
              }
            ]}
            data={sampleTableData}
            keyField="id"
            searchable
            searchPlaceholder="Search issues..."
            pagination={{ pageSize: 10, showPagination: true }}
            onRowClick={(row) => console.log('Clicked:', row)}
          />
        </section>

        {/* Footer */}
        <footer className="text-center text-muted-foreground pt-8 border-t">
          <p>For more examples and documentation, see the README.md in the shared components folder</p>
        </footer>
      </div>
    </div>
  )
}
