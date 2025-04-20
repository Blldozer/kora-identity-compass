
import React, { useState } from 'react';
import { CircleDollarSign } from 'lucide-react';

const slides = [
  {
    title: "We've got your back on all things money",
    content: (
      <div className="bg-[#0A2463] text-white p-6 rounded-xl shadow-lg max-w-sm mx-auto mb-4">
        <h3 className="text-lg font-semibold mb-2">Net worth</h3>
        <div className="text-3xl font-bold mb-2">$3,073</div>
        <div className="h-1 bg-white/20 rounded">
          <div className="h-full w-3/4 bg-white rounded"></div>
        </div>
      </div>
    )
  },
  {
    title: "Own your limits with custom budgets",
    content: (
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-auto mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">August budget</h3>
        <p className="text-gray-600 mb-2">Great job! You have <span className="text-[#F26419] font-semibold">$800</span> left</p>
        <div className="h-2 bg-gray-200 rounded">
          <div className="h-full w-2/3 bg-[#F26419] rounded"></div>
        </div>
      </div>
    )
  }
];

const StatsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="text-center">
      <div className="min-h-[300px] flex items-center justify-center">
        {slides[currentSlide].content}
      </div>
      
      <h2 className="text-4xl font-bold mb-8 text-gray-800 max-w-lg mx-auto">
        {slides[currentSlide].title}
      </h2>
      
      <div className="flex justify-center gap-2 mb-12">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-[#0A2463] w-4' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default StatsCarousel;
