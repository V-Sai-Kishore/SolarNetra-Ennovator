import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Zap, BarChart3, Shield, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WelcomePage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Sun, title: 'Solar Detection', desc: 'AI-powered panel identification' },
    { icon: Layers, title: 'Segmentation', desc: 'Pixel-level mask generation' },
    { icon: Shield, title: 'Quality Control', desc: 'Automated verification checks' },
    { icon: BarChart3, title: 'Analytics', desc: 'Comprehensive scoring metrics' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-solar-gold/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-solar-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo and Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-solar-gold to-solar-orange shadow-2xl shadow-solar-gold/30 mb-8 relative">
            <Sun className="w-12 h-12 text-white" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-solar-gold animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-solar-gold via-solar-orange to-primary bg-clip-text text-transparent mb-4">
            SolarNetra
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Advanced Rooftop Solar Verification & Audit Platform
          </p>
          
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" />
            30 Analysis Modules • Image & CSV Processing • Complete Verification
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {features.map((feature, i) => (
            <div 
              key={i}
              className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="group bg-gradient-to-r from-solar-gold to-solar-orange hover:from-solar-orange hover:to-solar-gold text-white px-8 py-6 text-lg rounded-2xl shadow-xl shadow-solar-gold/30 hover:shadow-2xl hover:shadow-solar-gold/40 transition-all duration-300 animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Tagline */}
        <p className="mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Upload satellite imagery or CSV data for comprehensive solar verification
        </p>
      </div>

      {/* Footer */}
      <footer className="relative text-center py-6 text-sm text-muted-foreground border-t border-border/30">
        <p>Powered by SolarNetra • Advanced Solar Analytics</p>
      </footer>
    </div>
  );
};

export default WelcomePage;
