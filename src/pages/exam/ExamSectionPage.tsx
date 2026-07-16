import { useParams } from 'react-router-dom'

// exam-section-runner widget (Ф-4) will own reconciling sectionCode with the
// backend's current allowed section — this page just hosts it.
export default function ExamSectionPage() {
  const { sectionCode } = useParams<{ sectionCode: string }>()
  return <h1 className="text-2xl font-semibold">Раздел: {sectionCode}</h1>
}
