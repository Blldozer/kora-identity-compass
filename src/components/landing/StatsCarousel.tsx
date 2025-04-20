
import React, { useState } from 'react';
import { Chart, DollarSign } from 'lucide-react';

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
        <p className="text-sm mt-2 text-white/80">Improving steadily this month</p>
      </div>
    )
  },
  {
    title: "Smart insights for better decisions",
    content: (
      <div className="bg-[#0A2463] p-6 rounded-xl shadow-lg max-w-sm mx-auto mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Spending Analysis</h3>
        <p className="text-gray-200 mb-2">Potential monthly savings</p>
        <div className="text-3xl font-bold text-white mb-2">$386</div>
        <div className="h-2 bg-white/20 rounded">
          <div className="h-full w-2/3 bg-[#F26419] rounded"></div>
        </div>
        <p className="text-sm mt-2 text-white/80">Based on AI pattern analysis</p>
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
      
      <h2 className="text-4xl font-bold mb-4 text-gray-800 max-w-lg mx-auto leading-tight">
        {slides[currentSlide].title}
      </h2>
      
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        {currentSlide === 0 
          ? "Make better financial choices with Kora's context-aware AI assistance"
          : "Discover opportunities to optimize your spending and grow your wealth"
        }
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
