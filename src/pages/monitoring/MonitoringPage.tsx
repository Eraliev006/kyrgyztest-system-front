import { LiveMonitoringTable } from '@/widgets/live-monitoring/LiveMonitoringTable'

export default function MonitoringPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Кто сейчас проходит тест</h1>
      <LiveMonitoringTable />
    </div>
  )
}
