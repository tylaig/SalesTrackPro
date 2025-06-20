import SupportForm from "@/components/support/SupportForm";
import TicketsList from "@/components/support/TicketsList";

export default function Support() {
  return (
    <div>
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Suporte</h2>
            <p className="text-sm text-gray-600">Central de atendimento e suporte</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SupportForm />
          <TicketsList />
        </div>
      </div>
    </div>
  );
}
