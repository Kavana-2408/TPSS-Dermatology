import api from '@/utils/api';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Validate required fields
  if (!req.body.name || !req.body.dob) {
    return res.status(400).json({ 
      message: 'Name and date of birth are required',
      fields: ['name', 'dob']
    });
  }

  try {
    const response = await api.post('/patients', req.body);
    return res.status(201).json(response.data);
  } catch (error) {
    console.error('API Error:', error);
    
    // Determine appropriate status code
    const status = error.response?.status || 
                 (error.message.includes('network') ? 502 : 500);
    
    return res.status(status).json({
      message: error.response?.data?.message || error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
}