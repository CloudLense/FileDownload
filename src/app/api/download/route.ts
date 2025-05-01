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

    // For non-Facebook URLs, proceed with normal download
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