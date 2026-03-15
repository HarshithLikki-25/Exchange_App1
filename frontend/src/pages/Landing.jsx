import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, ShieldCheck, RefreshCcw, Users, ArrowRight, Zap, BookOpen, Package } from 'lucide-react';

export default function Landing() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <Helmet>
        <title>CampusXchange | College Marketplace</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-300/40 to-purple-300/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-300/30 to-blue-300/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card border border-white text-sm font-semibold text-blue-600 mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-ping relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            </span>
            The #1 College Trading Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Trade Textbooks, Tech, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">More on Campus.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            CampusXchange connects you with other students to buy, sell, or exchange items safely and securely within your college community.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-white rounded-2xl font-bold flex items-center justify-center text-lg shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform duration-200">
              Start Trading <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/" className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold flex items-center justify-center text-lg hover:scale-105 transition-transform duration-200 border border-gray-200 shadow-sm">
              Explore Items
            </Link>
          </div>
        </motion.div>

        {/* Floating elements animation */}
        <motion.div style={{ y: y1, opacity }} className="mt-12 relative w-full max-w-5xl h-32 md:h-48 rounded-3xl overflow-hidden glass-card border-none shadow-xl">
           <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-white/10 backdrop-blur-md z-10 flex items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 w-full opacity-60">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 md:h-24 bg-white/50 rounded-2xl animate-pulse delay-75"></div>
                ))}
              </div>
           </div>
           {/* Mockup image underneath */}
           <div className="absolute inset-0 bg-gray-200/50"></div>
        </motion.div>
      </section>

      {/* Why CampusXchange Section */}
      <section className="py-20 bg-white border-y border-gray-100 z-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Why CampusXchange?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">Designed exclusively for college students, bringing safety and convenience to trading.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "Safe & Verified", desc: "Only students with verified .edu emails can join.", icon: <ShieldCheck size={32} /> },
              { title: "Local & Fast", desc: "Meet up between classes, no shipping fees or waiting.", icon: <MapPin size={32} /> },
              { title: "Eco-Friendly", desc: "Give items a second life and reduce campus waste.", icon: <RefreshCcw size={32} /> }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-default"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">Five simple steps to upgrade your dorm setup or clear out old textbooks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[10%] w-[80%] h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 -z-10"></div>

          {[
            { icon: <ShieldCheck />, title: "Register", desc: "Sign up securely using your student email." },
            { icon: <Package />, title: "Post Product", desc: "Take a picture and list your item in seconds." },
            { icon: <RefreshCcw />, title: "Request Exchange", desc: "Find an item and offer yours in return." },
            { icon: <MapPin />, title: "Schedule Pickup", desc: "Agree on a safe, local spot on campus." },
            { icon: <Zap />, title: "Complete Trade", desc: "Meet up and successfully trade goods!" },
          ].map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center relative group p-6 rounded-3xl hover:bg-white hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] transition-all duration-300 border border-transparent hover:border-blue-100 cursor-default"
            >
              <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 mb-6 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300 group-hover:shadow-xl relative z-10">
                {React.cloneElement(step.icon, { size: 36, className: 'group-hover:scale-110 transition-transform duration-300' })}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{i + 1}. {step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-white/60 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-black text-white text-xl mr-3 shadow-lg shadow-blue-500/20">CX</div>
            <span className="text-2xl font-black text-white tracking-tight">Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Xchange</span></span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CampusXchange. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
