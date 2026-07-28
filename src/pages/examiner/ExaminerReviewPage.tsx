import { useParams } from 'react-router-dom'
import { ExaminerReviewPanel } from '@/widgets/examiner-review-panel/ExaminerReviewPanel'

export default function ExaminerReviewPage() {
  const { attemptId } = useParams<{ attemptId: string }>()

  if (!attemptId) return null

  return <ExaminerReviewPanel attemptId={attemptId} />
}
