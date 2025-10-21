'use client';

import { useState } from 'react';

export default function CalendarTest() {
  const [url, setUrl] = useState('');
  const [lat, setLat] = useState('23.0899321');
  const [lng, setLng] = useState('72.5086508');
  const [months, setMonths] = useState('12');
  const [athamChaudas, setAthamChaudas] = useState(false);

  const generateUrl = () => {
    const baseUrl = `${window.location.origin}/api/calendar/ics`;
    const params = new URLSearchParams();
    
    if (lat && lng) {
      params.append('lat', lat);
      params.append('lng', lng);
    }
    
    if (months && months !== '12') {
      params.append('months', months);
    }
    
    if (athamChaudas) {
      params.append('atham_chaudas', '1');
    }
    
    const finalUrl = `${baseUrl}${params.toString() ? '?' + params.toString() : ''}`;
    setUrl(finalUrl);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center">
            Jain Calendar iCal Feed
          </h1>
          
          <div className="w-full max-w-2xl space-y-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Generate Calendar URL
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Latitude (optional)
                  </label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="23.0899321"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longitude (optional)
                  </label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="72.5086508"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of months (default: 12)
                  </label>
                  <input
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    placeholder="12"
                    min="1"
                    max="24"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={athamChaudas}
                      onChange={(e) => setAthamChaudas(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show only Atham Chaudas days (cal_atham_chaudas = 1)
                    </span>
                  </label>
                </div>
                
                <button
                  onClick={generateUrl}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Generate Calendar URL
                </button>
              </div>
            </div>
            
            {url && (
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Calendar URL
                </h3>
                
                <div className="space-y-4">
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                    <code className="text-sm text-gray-800 dark:text-gray-200 break-all">
                      {url}
                    </code>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Copy URL
                    </button>
                    
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Preview Calendar
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How to Subscribe
              </h3>
              
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <p>Copy the generated URL above</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <p>Go to <a href="https://calendar.google.com/calendar/u/0/r/settings/addbyurl" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">Google Calendar Settings</a></p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <p>Paste the URL in the &quot;URL of calendar&quot; field</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
                  <p>Click &quot;Add calendar&quot; to subscribe</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Calendar Features
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Daily Events</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Enhanced titles: "Sud 14 - Kartak (Tuesday)"</li>
                    <li>• Emoji-rich descriptions with icons</li>
                    <li>• Tithi, Sud/Vad, and calendar month</li>
                    <li>• Veer and Vikram years</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Special Events</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Clear titles: "🎉 Tirthankar Kalyaanak"</li>
                    <li>• Detailed event descriptions</li>
                    <li>• Religious festivals and important dates</li>
                    <li>• Historical events with context</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sunrise/Sunset</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Daily sunrise times</li>
                    <li>• Daily sunset times</li>
                    <li>• Location-specific data</li>
                    <li>• Accurate timing</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Format</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Standard iCal format</li>
                    <li>• Google Calendar compatible</li>
                    <li>• Apple Calendar compatible</li>
                    <li>• Outlook compatible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
