import { requireAdmin } from '@/lib/clerk-auth'
import { QRScanner } from '@/components/admin'

export default async function AdminScanPage() {
  await requireAdmin()

  return <QRScanner />
}