import { useParams } from 'react-router-dom'

export default function ExaminerReviewPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  return <h1 className="text-2xl font-semibold">Проверка попытки {attemptId}</h1>
}
