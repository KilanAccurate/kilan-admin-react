export interface ApprovalData {
    uid: string
    approvedDate: Date
    userId: string
    approvalStatus: 'approved' | 'rejected'
    role: 'pjo' | 'manager' | 'hrd'
}