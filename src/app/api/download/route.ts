import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Check if the URL is from Facebook
    if (url.includes('fb.watch') || url.includes('facebook.com')) {
      // Create form data for fdown.net
      const formData = new URLSearchParams();
      formData.append('URLz', url);

      // Make request to fdown.net
      const fdownResponse = await fetch('https://fdown.net/download.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!fdownResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch from fdown.net' }, { status: 500 });
      }

      const html = await fdownResponse.text();

      // Parse the HTML to find download links
      const hdLinkMatch = html.match(/id="hdlink"[^>]*href="([^"]+)"/);
      const sdLinkMatch = html.match(/id="sdlink"[^>]*href="([^"]+)"/);

      // Use HD link if available, otherwise use SD link
      const encodedUrl = hdLinkMatch ? hdLinkMatch[1] : (sdLinkMatch ? sdLinkMatch[1] : null);

      if (!encodedUrl) {
        return NextResponse.json({ error: 'No download link found' }, { status: 404 });
      }

      const downloadUrl = decodeURIComponent(encodedUrl.replace(/&amp;/g, '&'));

      // Fetch the actual video
      const videoResponse = await fetch(downloadUrl);
      if (!videoResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
      }

      // Get the video content
      const videoBlob = await videoResponse.blob();

      // Create response with video
      return new NextResponse(videoBlob, {
        headers: {
          'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
          'Content-Disposition': `attachment; filename="facebook-video.mp4"`,
        },
      });
    }
    // Check if the URL is from Instagram
    else if (url.includes('instagram.com')) {
      try {
        // Create form data for y2mate.mx
        const formData = new URLSearchParams();
        formData.append('p', 'home')
        formData.append('q', url)
        formData.append('w', '')
        formData.append('lang', 'en');

        // Make request to y2mate.mx
        const y2mateResponse = await fetch('https://y2mate.mx/api/ajaxSearch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        if (!y2mateResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch from y2mate.mx' }, { status: 500 });
        }

        const data = await y2mateResponse.json();

        if (!data || data.status !== 'ok' || !data.data) {
          console.error('Invalid y2mate.mx response:', data);
          return NextResponse.json({ error: 'Invalid response from y2mate.mx' }, { status: 500 });
        }

        // Parse the HTML to find download link
        const htmlContent = data.data;
        const downloadLinkMatch = htmlContent.match(/href="([^"]+)"[^>]*title="Download Video"/);

        if (!downloadLinkMatch) {
          console.error('No download link found in HTML:', htmlContent);
          return NextResponse.json({ error: 'No download link found' }, { status: 404 });
        }

        const downloadUrl = downloadLinkMatch[1];

        // Fetch the actual video
        const videoResponse = await fetch(downloadUrl);
        if (!videoResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
        }

        // Get the video content
        const videoBlob = await videoResponse.blob();

        // Create response with video
        return new NextResponse(videoBlob, {
          headers: {
            'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
            'Content-Disposition': `attachment; filename="instagram-video.mp4"`,
          },
        });
      } catch (error) {
        console.error('Instagram download error:', error);
        return NextResponse.json({ error: 'Failed to process Instagram video' }, { status: 500 });
      }
    }
    // Check if the URL is from TikTok or Douyin
    else if (url.match(/tiktok\.com|douyin\.com|vm\.tiktok\.com|vt\.tiktok\.com|v\.douyin\.com/)) {
      try {
        // Create form data for savetik.co
        const formData = new URLSearchParams();
        formData.append('q', url);
        formData.append('lang', 'en');
        formData.append('cftoken', '');

        // Make request to savetik.co
        const savetikResponse = await fetch('https://savetik.co/api/ajaxSearch', {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'accept-language': 'en-IN,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,gu;q=0.6,da;q=0.5,es;q=0.4,hi;q=0.3',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'pragma': 'no-cache',
            'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-requested-with': 'XMLHttpRequest',
            'Referer': 'https://savetik.co/en2',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
          },
          body: formData,
        });

        if (!savetikResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch from savetik.co' }, { status: 500 });
        }

        const data = await savetikResponse.json();
        
        if (!data || data.status !== 'ok' || !data.data) {
          console.error('Invalid savetik.co response:', data);
          return NextResponse.json({ error: 'Invalid response from savetik.co' }, { status: 500 });
        }

        // Parse the HTML to find download links
        const htmlContent = data.data;
        const downloadLinkMatch = htmlContent.match(/href="([^"]+)"[^>]*class="[^"]*\btik-button-dl\b[^"]*"[^>]*>/i);
        const downloadUrl = downloadLinkMatch[1];

        if (!downloadUrl) {
          console.error('No download link found in HTML:', htmlContent);
          return NextResponse.json({ error: 'No download link found' }, { status: 404 });
        }

        // Fetch the actual video
        const videoResponse = await fetch(downloadUrl);
        if (!videoResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
        }

        // Get the video content
        const videoBlob = await videoResponse.blob();

        // Create response with video
        return new NextResponse(videoBlob, {
          headers: {
            'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
            'Content-Disposition': `attachment; filename="tiktok-video.mp4"`,
          },
        });
      } catch (error) {
        console.error('TikTok download error:', error);
        return NextResponse.json({ error: 'Failed to process TikTok video' }, { status: 500 });
      }
    }
    // Check if the URL is from X.com (Twitter)
    // https://x.com/politicsusa46/status/1917073402738729346
    else if (url.includes('x.com') || url.includes('twitter.com')) {
      try {
        // Create form data for savetwitter.net
        const formData = new URLSearchParams();
        formData.append('q', url);
        formData.append('lang', 'en');
        formData.append('cftoken', '');

        // Make request to savetwitter.net
        const savetwitterResponse = await fetch('https://savetwitter.net/api/ajaxSearch', {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'accept-language': 'en-IN,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,gu;q=0.6,da;q=0.5,es;q=0.4,hi;q=0.3',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'pragma': 'no-cache',
            'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-requested-with': 'XMLHttpRequest',
            'Referer': 'https://savetwitter.net/en',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
          },
          body: formData,
        });

        if (!savetwitterResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch from savetwitter.net' }, { status: 500 });
        }

        const data = await savetwitterResponse.json();
        
        if (!data || data.status !== 'ok' || !data.data) {
          console.error('Invalid savetwitter.net response:', data);
          return NextResponse.json({ error: 'Invalid response from savetwitter.net' }, { status: 500 });
        }

        // Parse the HTML to find download links
        const htmlContent = data.data;
        const downloadLinkMatch = htmlContent.match(/<a[^>]*href="([^"]+)"[^>]*class="[^"]*\btw-button-dl\b[^"]*"[^>]*>/i);
        const downloadUrl = downloadLinkMatch[1];
        
        // Fetch the actual video
        const videoResponse = await fetch(downloadUrl);
        if (!videoResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
        }

        // Get the video content
        const videoBlob = await videoResponse.blob();

        // Create response with video
        return new NextResponse(videoBlob, {
          headers: {
            'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
            'Content-Disposition': `attachment; filename="twitter-video.mp4"`,
          },
        });
      } catch (error) {
        console.error('Twitter download error:', error);
        return NextResponse.json({ error: 'Failed to process Twitter video' }, { status: 500 });
      }
    }
    // Check if the URL is from any of the supported platforms
    // Vimeo, Pinterest, Soundcloud, Flickr, Ted, TikTok, LinkedIn, Reddit
    // https://www.linkedin.com/posts/rajivtalreja_70-90-100-hour-work-week-do-whatever-activity-7323230064471375872-egpv?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAP0tK8BnGJK5GzHN2rHYNtg6nSBg6XGoko
    else if (url.match(/vimeo\.com|pin\.it|pinterest\.com|soundcloud\.com|flic\.kr|flickr\.com|ted\.com|iesdouyin\.com|linkedin\.com|redd\.it/)) {
      try {
        // First, get the token from anydownloader.com
        const homeResponse = await fetch('https://anydownloader.com/');
        if (!homeResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch from anydownloader.com ' + homeResponse.statusText }, { status: homeResponse.status });
        }

        const homeHtml = await homeResponse.text();
        const tokenMatch = homeHtml.match(/name="token" value="([^"]+)"/);
        
        if (!tokenMatch) {
          return NextResponse.json({ error: 'Failed to get token from anydownloader.com' }, { status: 500 });
        }

        const token = tokenMatch[1];

        // Now make the POST request with the token
        const formData = new URLSearchParams();
        formData.append('url', url);
        formData.append('token', token);

        const downloadResponse = await fetch('https://anydownloader.com/wp-json/aio-dl/video-data/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        if (!downloadResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch video data' }, { status: 500 });
        }

        const videoData = await downloadResponse.json();
        
        if (!videoData || !videoData.downloadUrl) {
          console.error('Invalid video data response:', videoData);
          return NextResponse.json({ error: 'Invalid video data response' }, { status: 500 });
        }

        // Fetch the actual video
        const videoResponse = await fetch(videoData.downloadUrl);
        if (!videoResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
        }

        // Get the video content
        const videoBlob = await videoResponse.blob();

        // Create response with video
        return new NextResponse(videoBlob, {
          headers: {
            'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
            'Content-Disposition': `attachment; filename="downloaded-video.mp4"`,
          },
        });
      } catch (error) {
        console.error('Video download error:', error);
        return NextResponse.json({ error: 'Failed to process video' }, { status: 500 });
      }
    }

    // For non-supported URLs, proceed with normal download
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
    }

    // Get filename from headers or URL
    let filename = 'downloaded-file';
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) filename = match[1];
    } else {
      const urlParts = url.split('/');
      filename = urlParts[urlParts.length - 1];
    }

    // Create response with file
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}