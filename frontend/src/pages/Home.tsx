import { Link } from 'react-router-dom';
import { Car, Shield, Wrench, Clock } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">AutoParts IMS</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Vehicle Parts & Service
            <br />
            <span className="text-blue-600">Management System</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Register your vehicles, manage your profile, and keep track of all your automotive needs in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-white text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors border border-slate-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            Everything you need to manage your vehicles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <Car className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Vehicle Management</h3>
              <p className="text-slate-600">
                Register and manage all your vehicles in one place. Keep track of details like mileage and service history.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Secure Profile</h3>
              <p className="text-slate-600">
                Your data is protected with secure authentication. Easily update your profile and contact information.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
                <Wrench className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Parts & Services</h3>
              <p className="text-slate-600">
                Browse available parts, request services, and schedule appointments for your vehicles.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Clock className="h-4 w-4" />
            Quick & Easy Setup
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Create your account in seconds and start managing your vehicles today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      <footer className="bg-slate-800 text-slate-400 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold text-white">AutoParts IMS</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Vehicle Parts Selling & Inventory Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
