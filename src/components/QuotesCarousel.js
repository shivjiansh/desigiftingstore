// components/QuotesCarousel.js

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useSwipeable } from "react-swipeable";

const QuotesCarousel = () => {
  const quotes = [
    "Some gifts are bought, but the most meaningful ones are crafted with the heart.",
    "You can purchase a present, but you create a memory.",
    "Ordinary gifts fill a box; personalized gifts fill a soul.",
    "Anyone can buy a gift; only true thoughtfulness can make it unforgettable.",
    "Store-bought gifts delight for a moment; handmade gifts resonate forever.",
    "A gift from a shelf adds joy—but a gift from your hands adds love.",
    "Commercial gifts are wrapped in paper; heartfelt gifts are wrapped in intention.",
    "Objects can be purchased, but sentiments must be invented.",
    "You may select an item from a store, but you compose a keepsake from your heart.",
    "Gifts appear on shelves, but special sentiments appear in stories you create.",
    "A purchased gift occupies hands; a crafted gift occupies thoughts long after.",
    "Store shelves hold options; your imagination holds heirlooms waiting to be born.",
    "Price tags measure cost; the time in your hands measures love.",
    "Mass-produced gifts satisfy an occasion; uniquely made gifts define a relationship.",
    "You find one gift among many; you invent a treasure meant for one.",
    "Wrapping paper hides a surprise; your effort reveals a piece of your soul.",
    "Anyone can spend money; only you can weave a moment into a lasting legacy.",
    "Factory gifts shine briefly; handmade gifts glow with the slow burn of true care.",
    "Off-the-shelf says 'I remembered'; crafted-by-you says 'I know you.'",
    "The finest stores sell objects; the deepest connections gift irreplaceable stories etched by your touch.",
  ];

  const [currentQuote, setCurrentQuote] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const nextQuote = useCallback(() => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
  }, [quotes.length]);

  const prevQuote = useCallback(() => {
    setCurrentQuote((prev) => (prev - 1 + quotes.length) % quotes.length);
  }, [quotes.length]);

  // Handlers for swipe gestures
  const handlers = useSwipeable({
    onSwipedLeft: () => nextQuote(),
    onSwipedRight: () => prevQuote(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (!isVisible) return null;

  return (
    <div
      {...handlers}
      className="fixed bottom-0 left-0 right-0 z-50  bg-gradient-to-r from-blue-500 to-blue-700 shadow-2xl touch-pan-y"
    >
      {/* Close Button */}

      <div className="relative  pb-2 pt-1">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Prev Button */}

          {/* Quote Text */}
          <div className="flex-1 mx-2 text-center ">
            <p className="text-sm md:text-sm font-medium text-white leading-relaxed italic">
              "{quotes[currentQuote]}"
            </p>
          </div>

          {/* Next Button */}
        </div>

        {/* Dots Indicator */}
      </div>
    </div>
  );
};

export default QuotesCarousel;
