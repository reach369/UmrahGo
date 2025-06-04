import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = 'https://umrahgo.reach369.com/api/v1';

// This API route acts as a proxy to get featured packages from the Umrah API
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow GET requests
    if (req.method === 'GET') {
      // Fetch packages with is_featured=true parameter
      const response = await axios.get(`${API_URL}/public/packages`, {
        params: { is_featured: true, ...req.query },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      return res.status(200).json(response.data);
    }
    
    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Proxy API error:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status || 500).json({
        message: 'Error fetching data from external API',
        error: error.response.data,
      });
    }
    
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 