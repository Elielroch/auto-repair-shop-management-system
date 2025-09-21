import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

// Componentes
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Clientes from './components/Clientes';
import Veiculos from './components/Veiculos';
import OrdensServico from './components/OrdensServico';
import Pecas from './components/Pecas';
import Relatorios from './components/Relatorios';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/veiculos" element={<Veiculos />} />
            <Route path="/ordens-servico" element={<OrdensServico />} />
            <Route path="/pecas" element={<Pecas />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

