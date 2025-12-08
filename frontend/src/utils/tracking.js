// Home Assistant tracking utility for React

// ===== GENERIC METADATA COLLECTION =====
function getCommonMetadata(additionalMetadata = {}) {
  const now = Date.now();
  const pageLoadTime = window._pageLoadTime || now;
  const timeOnPage = Math.floor((now - pageLoadTime) / 1000);
  
  // Parse user agent
  const ua = navigator.userAgent;
  const browserInfo = parseUserAgent(ua);
  
  // Get screen info
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const screenResolution = `${screenWidth}x${screenHeight}`;
  
  // Get URL parameters
  const urlParamsObj = {};
  const currentUrlParams = new URLSearchParams(window.location.search);
  for (const [key, value] of currentUrlParams.entries()) {
    urlParamsObj[key] = value;
  }
  
  // Build common metadata
  const commonMetadata = {
    // User/Browser Information
    user_agent: ua,
    browser_name: browserInfo.name,
    browser_version: browserInfo.version,
    device_type: getDeviceType(),
    os_name: browserInfo.os,
    os_version: browserInfo.osVersion,
    screen_resolution: screenResolution,
    screen_width: screenWidth,
    screen_height: screenHeight,
    
    // Session Information
    session_id: getSessionId(),
    time_on_page_seconds: timeOnPage,
    page_url: window.location.href,
    page_path: window.location.pathname,
    
    // URL Parameters
    url_params: urlParamsObj,
    has_url_params: Object.keys(urlParamsObj).length > 0,
    
    // App State
    referrer: document.referrer || null,
    timestamp: new Date().toISOString()
  };
  
  return { ...commonMetadata, ...additionalMetadata };
}

function parseUserAgent(ua) {
  let name = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';
  let osVersion = 'Unknown';
  
  // Browser detection
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    if (match) { name = 'Chrome'; version = match[1]; }
  } else if (ua.includes('Firefox')) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    if (match) { name = 'Firefox'; version = match[1]; }
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/([\d.]+)/);
    if (match) { name = 'Safari'; version = match[1]; }
  } else if (ua.includes('Edg')) {
    const match = ua.match(/Edg\/([\d.]+)/);
    if (match) { name = 'Edge'; version = match[1]; }
  }
  
  // OS detection
  if (ua.includes('Windows NT')) {
    const match = ua.match(/Windows NT ([\d.]+)/);
    os = 'Windows';
    if (match) {
      const ntVersion = match[1];
      const versionMap = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
      osVersion = versionMap[ntVersion] || ntVersion;
    }
  } else if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X ([\d_]+)/);
    os = 'macOS';
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (ua.includes('Android')) {
    const match = ua.match(/Android ([\d.]+)/);
    os = 'Android';
    if (match) osVersion = match[1];
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    const match = ua.match(/OS ([\d_]+)/);
    os = 'iOS';
    if (match) osVersion = match[1].replace(/_/g, '.');
  }
  
  return { name, version, os, osVersion };
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getSessionId() {
  if (!window._sessionId) {
    window._sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  }
  return window._sessionId;
}

// Home Assistant tracking helper
export async function trackEvent(eventName, metadata = {}) {
  try {
    await fetch('/api/ha-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        metadata: getCommonMetadata(metadata)
      })
    });
  } catch (error) {
    // Silently fail - don't interrupt user experience
  }
}

// Initialize page load time
if (typeof window !== 'undefined') {
  window._pageLoadTime = Date.now();
}

