import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = 'https://admin.umrahgo.net/api/v1';

// This API route acts as a proxy to the Umrah API for packages
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id, ...query } = req.query;
    
    // Handle GET requests for a specific package by ID
    if (req.method === 'GET' && id) {
      const response = await axios.get(`${API_URL}/public/packages/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      return res.status(200).json(response.data);
    }
    
    // Handle GET requests for all packages with optional filters
    if (req.method === 'GET') {
      const response = await axios.get(`${API_URL}/public/packages`, {
        params: query,
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