
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f26419] to-[#FFA162] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 bg-white/20 backdrop-blur-md p-12 rounded-2xl shadow-2xl"
      >
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-6xl font-bold text-white drop-shadow-lg"
        >
          Kora
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xl text-white/90 mb-8"
        >
          Your Financial Health Companion
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center space-x-4"
        >
          <Button 
            onClick={() => navigate('/login')} 
            className="bg-white text-[#f26419] hover:bg-white/90"
          >
            Login
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/register')}
            className="border-white text-white hover:bg-white/20"
          >
            Register
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
