import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Car, 
  ClipboardList, 
  Package, 
  BarChart3,
  Wrench,
  Eye
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/veiculos', label: 'Veículos', icon: Car },
    { path: '/ordens-servico', label: 'Ordens de Serviço', icon: ClipboardList },
    { path: '/pecas', label: 'Peças', icon: Package },
    { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  
  // Função para abrir o Object Recognition em uma nova aba
const handleOpenObjectRecognition = ( ) => {

  window.open('https://object-recognition-service.onrender.com', '_blank' ); 
};


  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8" />
            <span className="text-xl font-bold">Oficina Manager</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Botão Object Recognition */}
            <button
              onClick={handleOpenObjectRecognition}
              className="flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 text-blue-100 hover:bg-green-600 hover:text-white ml-2"
              title="Abrir Reconhecimento de Objetos"
            >
              <Eye className="h-4 w-4" />
              <span>Reconhecimento</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-blue-100 hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Botão Object Recognition Mobile */}
            <button
              onClick={handleOpenObjectRecognition}
              className="flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 text-blue-100 hover:bg-green-600 hover:text-white w-full"
              title="Abrir Reconhecimento de Objetos"
            >
              <Eye className="h-4 w-4" />
              <span>Reconhecimento</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
