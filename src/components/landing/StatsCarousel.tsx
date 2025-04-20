
import React, { useState } from 'react';
import { ChartBar, TrendingUp, ShieldCheck, Search, Wallet, PiggyBank } from 'lucide-react';

const slides = [
  {
    title: "Your AI-powered financial companion",
    content: (
      <div className="bg-[#F26419] text-white p-6 rounded-xl shadow-lg max-w-sm mx-auto mb-4">
        <h3 className="text-lg font-semibold mb-2">Financial Health Score</h3>
        <div className="text-3xl font-bold mb-2">78/100</div>
        <div className="h-1 bg-white/20 rounded">
          <div className="h-full w-[78%] bg-white rounded"></div>
        </div>
        <p className="text-sm mt-2 text-white/80">Your finances are getting stronger with Kora</p>
      </div>
    )
  },
  {
    title: "Smart spending insights",
    content: (
      <div className="bg-[#0A2463] p-6 rounded-xl shadow-lg max-w-sm mx-auto mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Search size={20} />
          AI-Powered Analysis
        </h3>
        <p className="text-gray-200 mb-2">Potential monthly savings</p>
        <div className="text-3xl font-bold text-white mb-2">$386</div>
        <div className="h-2 bg-white/20 rounded">
          <div className="h-full w-2/3 bg-[#F26419] rounded"></div>
        </div>
        <p className="text-sm mt-2 text-white/80">Based on your spending patterns</p>
      </div>
    )
  },
  {
    title: "Fraud protection that never sleeps",
    content: (
      <div className="bg-[#0A2463] p-6 rounded-xl shadow-lg max-w-sm mx-auto mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <ShieldCheck size={20} />
          Active Protection
        </h3>
        <div className="text-3xl font-bold text-white mb-2">24/7</div>
        <p className="text-gray-200">Real-time transaction monitoring</p>
        <div className="mt-4 bg-white/10 p-3 rounded-lg">
          <p className="text-sm text-white/80">Kora's AI monitors every transaction to keep your money safe</p>
        </div>
      </div>
    )
  },
  {
    title: "Investment opportunities tailored to you",
    content: (
      <div className="bg-[#F26419] p-6 rounded-xl shadow-lg max-w-sm mx-auto mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Wallet size={20} />
          Smart Investments
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-white" size={24} />
          <span className="text-2xl font-bold text-white">+12.3%</span>
        </div>
        <p className="text-white/80 mb-3">Potential returns based on your risk profile</p>
        <div className="bg-white/10 p-3 rounded-lg">
          <p className="text-sm text-white">Personalized investment recommendations based on your goals</p>
        </div>
      </div>
    )
  },
  {
    title: "Smart savings goals that work",
    content: (
      <div className="bg-[#0A2463] p-6 rounded-xl shadow-lg max-w-sm mx-auto mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <PiggyBank size={20} />
          Goal Progress
        </h3>
        <div className="text-3xl font-bold text-white mb-2">$12,450</div>
        <p className="text-gray-200 mb-2">Saved for your dream home</p>
        <div className="h-2 bg-white/20 rounded">
          <div className="h-full w-[83%] bg-[#F26419] rounded"></div>
        </div>
        <p className="text-sm mt-2 text-white/80">83% of your goal achieved</p>
      </div>
    )
  }
];

const StatsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="text-center px-4">
      <div className="min-h-[320px] flex items-center justify-center">
        {slides[currentSlide].content}
      </div>
      
      <h2 className="text-4xl font-bold mb-4 text-[#0A2463] max-w-lg mx-auto leading-tight">
        {slides[currentSlide].title}
      </h2>
      
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        {currentSlide === 0 && "Let Kora's AI guide you to financial success"}
        {currentSlide === 1 && "Discover smarter ways to save with AI-powered insights"}
        {currentSlide === 2 && "Rest easy knowing your finances are protected 24/7"}
        {currentSlide === 3 && "Grow your wealth with personalized investment strategies"}
        {currentSlide === 4 && "Achieve your financial goals faster with smart automation"}
      </p>
      
      <div className="flex justify-center gap-2 mb-12">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-[#F26419] w-4' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default StatsCarousel;
