'use client';

import { useEffect, useState } from 'react';

const languages = [
  { text: '📥 Paste. Tap. Download! 🚀', lang: 'en' },
  { text: '📥 Cola. Toca. ¡Descarga! 🚀', lang: 'es' },
  { text: '📥 Cola. Toque. Baixe! 🚀', lang: 'pt' },
  { text: '📥 Collez. Appuyez. Téléchargez! 🚀', lang: 'fr' },
  { text: '📥 Einfügen. Tippen. Herunterladen! 🚀', lang: 'de' },
  { text: '📥 粘贴。点击。下载！ 🚀', lang: 'zh' },
  { text: '📥 貼り付け。タップ。ダウンロード！ 🚀', lang: 'ja' },
  // Indian Languages
  { text: '📥 पेस्ट करें। टैप करें। डाउनलोड करें! 🚀', lang: 'hi' }, // Hindi
  { text: '📥 পেস্ট করুন। ট্যাপ করুন। ডাউনলোড করুন! 🚀', lang: 'bn' }, // Bengali
  { text: '📥 ஒட்டவும். தட்டவும். பதிவிறக்கவும்! 🚀', lang: 'ta' }, // Tamil
  { text: '📥 పేస్ట్ చేయండి. టాప్ చేయండి. డౌన్లోడ్ చేయండి! 🚀', lang: 'te' }, // Telugu
  { text: '📥 ಅಂಟಿಸಿ. ಟ್ಯಾಪ್ ಮಾಡಿ. ಡೌನ್ಲೋಡ್ ಮಾಡಿ! 🚀', lang: 'kn' }, // Kannada
  { text: '📥 പേസ്റ്റ് ചെയ്യുക. ടാപ്പ് ചെയ്യുക. ഡൗൺലോഡ് ചെയ്യുക! 🚀', lang: 'ml' }, // Malayalam
  { text: '📥 પેસ્ટ કરો. ટેપ કરો. ડાઉનલોડ કરો! 🚀', lang: 'gu' }, // Gujarati
];

export default function AnimatedText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % languages.length);
        setIsVisible(true);
      }, 500); // Half of the transition duration
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className={`text-4xl font-bold text-gray-900 dark:text-white text-center transition-all duration-500 transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    }`}>
      {languages[currentIndex].text}
    </h1>
  );
} 