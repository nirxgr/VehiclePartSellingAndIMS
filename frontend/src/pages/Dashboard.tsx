import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleApi, type Vehicle } from '../services/api';
import { Car, User, Plus, ChevronRight } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await vehicleApi.getVehicles();
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName}!</h1>
        <p className="text-blue-100">Manage your profile and vehicles from your personal dashboard.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/profile"
          className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200"
        >
          <div className="flex items-start justify-between">
            <div className="bg-blue-100 p-3 rounded-xl">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mt-4">My Profile</h2>
          <p className="text-slate-600 text-sm mt-1">View and update your personal information</p>
        </Link>

        <Link
          to="/vehicles"
          className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200"
        >
          <div className="flex items-start justify-between">
            <div className="bg-green-100 p-3 rounded-xl">
              <Car className="h-6 w-6 text-green-600" />
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mt-4">My Vehicles</h2>
          <p className="text-slate-600 text-sm mt-1">
            {loading ? 'Loading...' : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} registered`}
          </p>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Recent Vehicles</h2>
            <p className="text-slate-600 text-sm">Your registered vehicles</p>
          </div>
          <Link
            to="/vehicles"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-8 text-center">
            <Car className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No vehicles registered yet</p>
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add your first vehicle
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {vehicles.slice(0, 3).map((vehicle) => (
              <div key={vehicle.vehicleId} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <Car className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-sm text-slate-500">{vehicle.vehicleNumber} • {vehicle.year}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-500">{vehicle.mileage.toLocaleString()} km</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
