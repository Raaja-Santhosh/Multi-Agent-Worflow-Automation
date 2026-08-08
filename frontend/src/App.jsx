import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

// Core Technical Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard'; // Core Interactive Workspace Console
import WorkflowBuilder from './pages/WorkflowBuilder';
import HistoryPage from './pages/History';
import Architecture from './pages/Architecture';
import WorkflowPage from './pages/WorkflowPage';
import Features from './pages/Features';
import DocumentationPreview from './pages/DocumentationPreview';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#08090a] text-white flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
        {/* Navigation Bar */}
        <NavBar />

        {/* Content Router */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/workspace" element={<Dashboard />} />
            <Route path="/builder" element={<WorkflowBuilder />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/workflow" element={<WorkflowPage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/docs" element={<DocumentationPreview />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}
