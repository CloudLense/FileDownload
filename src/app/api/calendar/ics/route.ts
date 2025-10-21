import { NextResponse } from 'next/server';

interface CalendarDay {
  en_day: string;
  en_date: string;
  en_month: string;
  en_year: string;
  cal_tithi: string;
  cal_sud_vad: string;
  cal_month: string;
  cal_veer_year: string;
  cal_vikram_year: string;
  cal_day: string;
  cal_atham_chaudas: string;
  cal_special_tithi: string;
  cal_special_event: string;
  cal_event: string;
  cal_event_details: string;
}

interface CalendarResponse {
  calendar: CalendarDay[];
}

interface SunriseSunsetResponse {
  current_date: string;
  lattitude: number | null;
  longitude: number | null;
  day: number;
  month: number;
  year: number;
  sunrisetime: string;
  sunsettime: string;
}

// Helper function to escape iCal text
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

// Helper function to fold long lines (max 75 chars)
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  
  const lines = [];
  let currentLine = line;
  
  while (currentLine.length > 75) {
    lines.push(currentLine.substring(0, 75));
    currentLine = ' ' + currentLine.substring(75);
  }
  
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  
  return lines.join('\r\n');
}

// Helper function to format date for iCal (YYYYMMDD format)
function formatICalDate(year: string, month: string, day: string): string {
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  return `${year}${paddedMonth}${paddedDay}`;
}

// Helper function to get month names
function getMonthName(monthNumber: number): string {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  return months[monthNumber - 1];
}

// Helper function to fetch sunrise/sunset data
async function fetchSunriseSunset(day: string, month: string, year: string, lat: string, lng: string): Promise<SunriseSunsetResponse | null> {
  try {
    const response = await fetch('https://www.vitragvani.com/app-api-1-0-6/api/sunsetsunriseapi/getsunrisesunsettime', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-IN,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,gu;q=0.6,da;q=0.5,es;q=0.4,hi;q=0.3',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'dnt': '1',
        'origin': 'https://vitragvani.com',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'referer': 'https://vitragvani.com/',
        'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        day,
        month,
        year,
        lattitude: lat,
        longitude: lng
      })
    });

    if (!response.ok) {
      console.error('Failed to fetch sunrise/sunset data:', response.statusText);
      return null;
    }

    const data: SunriseSunsetResponse[] = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching sunrise/sunset data:', error);
    return null;
  }
}

// Helper function to fetch calendar data for a specific month
async function fetchCalendarData(year: number, month: number): Promise<CalendarDay[]> {
  try {
    const monthName = getMonthName(month);
    const url = `https://www.vitragvani.com/app-calendar/eng/calendar/${year}/${monthName}.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch calendar data for ${year}/${month}:`, response.statusText);
      return [];
    }

    const data: CalendarResponse = await response.json();
    return data.calendar || [];
  } catch (error) {
    console.error(`Error fetching calendar data for ${year}/${month}:`, error);
    return [];
  }
}

// Helper function to generate unique UID
function generateUID(year: string, month: string, day: string, type: string): string {
  return `${year}${month}${day}-${type}@vitragvani-calendar.com`;
}


// Helper function to create VEVENT for combined daily tithi and special events
function createCombinedEvent(day: CalendarDay, sunriseSunset?: SunriseSunsetResponse): string {
  const uid = generateUID(day.en_year, day.en_month, day.en_date, 'combined');
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtstart = formatICalDate(day.en_year, day.en_month, day.en_date);
  
  // Determine if there's a special event
  const hasSpecialEvent = day.cal_event === "1" && day.cal_event_details.trim();
  
  // Clean HTML tags from event details if present
  const cleanEventDetails = hasSpecialEvent 
    ? day.cal_event_details
        .replace(/<br\s*\/?>/gi, '\\n')
        .replace(/<[^>]*>/g, '')
        .trim()
    : '';
  
  // Create summary based on whether there's a special event
  let summary: string;
  if (hasSpecialEvent) {
    const firstLine = cleanEventDetails.split('\\n')[0] || 'Special Event';
    const tithiText = day.cal_tithi.includes('/') ? day.cal_tithi.split('/')[0].trim() : day.cal_tithi;
    summary = `🎉 ${firstLine} (${day.cal_sud_vad} ${tithiText} - ${day.cal_month})`;
  } else {
    const tithiText = day.cal_tithi.includes('/') ? day.cal_tithi.split('/')[0].trim() : day.cal_tithi;
    summary = `${day.cal_sud_vad} ${tithiText} - ${day.cal_month} (${day.en_day})`;
  }
  
  // Create comprehensive description
  let description = `📅 Jain Calendar Information\\n\\n`;
  
  if (hasSpecialEvent) {
    description += `🎉 Special Event:\\n${cleanEventDetails}\\n\\n`;
  }
  
  description += `📆 Calendar Day: ${day.cal_day}\\n`;
  description += `🌙 Tithi: ${day.cal_tithi}\\n`;
  description += `📈 Sud/Vad: ${day.cal_sud_vad}\\n`;
  description += `🗓️ Month: ${day.cal_month}\\n`;
  description += `📜 Veer Year: ${day.cal_veer_year}\\n`;
  description += `📜 Vikram Year: ${day.cal_vikram_year}`;
  
  if (sunriseSunset) {
    description += `\\n\\n🌅 Sunrise: ${sunriseSunset.sunrisetime}\\n`;
    description += `🌇 Sunset: ${sunriseSunset.sunsettime}`;
  }

  const event = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `SUMMARY:${escapeICalText(summary)}`,
    `DESCRIPTION:${escapeICalText(description)}`,
    'END:VEVENT'
  ].join('\r\n');

  return event;
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const months = parseInt(searchParams.get('months') || '12');
    const filterAthamChaudas = searchParams.get('atham_chaudas') === '1';

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11

    // Collect all calendar data
    const allCalendarData: CalendarDay[] = [];
    
    for (let i = 0; i < months; i++) {
      const targetMonth = currentMonth + i;
      const targetYear = currentYear + Math.floor((targetMonth - 1) / 12);
      const actualMonth = ((targetMonth - 1) % 12) + 1;
      
      const monthData = await fetchCalendarData(targetYear, actualMonth);
      allCalendarData.push(...monthData);
    }

    // Generate iCal content
    
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Vitragvani//Jain Calendar//EN',
      'CALSCALE:GREGORIAN',
      'X-WR-CALNAME:Jain Calendar - Vitragvani',
      'X-WR-TIMEZONE:Asia/Kolkata',
      'X-WR-CALDESC:Jain Calendar with Tithi and Special Events'
    ].join('\r\n') + '\r\n';

    // Process each day
    for (const day of allCalendarData) {
      // Apply atham chaudas filter if requested
      if (filterAthamChaudas && day.cal_atham_chaudas !== "1") {
        continue;
      }

      // Create single combined event for each day
      let sunriseSunset: SunriseSunsetResponse | null = null;
      
      if (lat && lng) {
        sunriseSunset = await fetchSunriseSunset(day.en_date, day.en_month, day.en_year, lat, lng);
      }
      
      const combinedEvent = createCombinedEvent(day, sunriseSunset || undefined);
      icalContent += combinedEvent + '\r\n';
    }

    icalContent += 'END:VCALENDAR';

    // Fold long lines
    const foldedContent = icalContent.split('\r\n').map(line => foldLine(line)).join('\r\n');

    return new NextResponse(foldedContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="jain-calendar.ics"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating iCal:', error);
    return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 });
  }
}
