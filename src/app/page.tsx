import CarReturnForm from "@/components/CarReturnForm";
import { processCarReturn } from "./actions/processCarReturn";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Car Return Processing
          </h1>

          <CarReturnForm />
        </div>
      </div>
    </div>
  );
}
