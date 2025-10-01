import Header from '@/components/Header'

interface TicketPageProps {
  params: { id: string }
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-8">My Ticket</h1>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
            <p className="text-white">Ticket details for ID: {id}</p>
            <p className="text-gray-300 mt-4">QR code and ticket information will be displayed here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}