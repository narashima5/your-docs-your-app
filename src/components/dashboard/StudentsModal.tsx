import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { EcoButton } from "@/components/ui/eco-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StudentDetailsModal } from "./StudentDetailsModal"

interface Student {
  id: string
  user_id: string
  display_name: string
  level: number
  eco_points: number
  completed_lessons: number
  completed_missions: number
  region_district: string
  region_state: string
  region_country: string
}

interface StudentsModalProps {
  isOpen: boolean
  onClose: () => void
  students: Student[]
  organizationName: string
}

export function StudentsModal({ isOpen, onClose, students, organizationName }: StudentsModalProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showStudentDetails, setShowStudentDetails] = useState(false)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Students ({students.length})</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {students.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{student.display_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Level {student.level} • {student.region_district}, {student.region_state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium text-primary">{student.eco_points} points</div>
                      <div className="text-sm text-muted-foreground">
                        {student.completed_lessons}L • {student.completed_missions}M
                      </div>
                    </div>
                    <EcoButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(student)
                        setShowStudentDetails(true)
                      }}
                    >
                      View Details
                    </EcoButton>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          organizationName={organizationName}
          onClose={() => {
            setShowStudentDetails(false)
            setSelectedStudent(null)
          }}
        />
      )}
    </>
  )
}
