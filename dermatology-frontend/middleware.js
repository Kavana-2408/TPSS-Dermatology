import { NextResponse } from 'next/server';

const allowedOrigins = [
  'http://localhost:3001',
  'https://yourproductiondomain.com'
];

export async function middleware(request) {
  const origin = request.headers.get('origin');
  const response = NextResponse.next();

  // Handle CORS
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: {
        ...Object.fromEntries(response.headers),
        'Content-Length': '0'
      }
    });
  }

  // Skip auth for public routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return response;
  }

  // Verify token for protected routes
  const token = request.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401, headers: response.headers }
    );
  }

  try {
    // Verify token and add user to request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.id);
    
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 403, headers: response.headers }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};

const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly include OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

module.exports = cors(corsOptions);