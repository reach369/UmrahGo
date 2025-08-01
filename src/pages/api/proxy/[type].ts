import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// This dynamic API route acts as a proxy to the Umrah API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the endpoint type from the URL
    const { type } = req.query;
    
    // Ensure type is a string
    const endpointType = Array.isArray(type) ? type[0] : type;
    
    // Validate the endpointType is defined
    if (!endpointType) {
      return res.status(400).json({ message: 'Missing endpoint type' });
    }
    
    // Forward the query parameters (excluding type)
    const { type: _, ...queryParams } = req.query;
    
    // Validate endpoint type
    const validEndpoints = ['packages', 'offices', 'featured-packages'];
    if (!validEndpoints.includes(endpointType)) {
      return res.status(400).json({ message: `Invalid endpoint type: ${endpointType}` });
    }
    
    // Map endpoint type to API path
    const apiPathMap: Record<string, string> = {
      'packages': '/public/packages',
      'offices': '/public/offices',
      'featured-packages': '/public/packages/featured'
    };
    
    const apiPath = apiPathMap[endpointType];
    
    // Try multiple API URLs
    const apiUrls = [
      process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1',
      'https://admin.umrahgo.net/api/v1', 
    ];
    
    let lastError = null;
    
    // Try each URL until one works
    for (const baseUrl of apiUrls) {
      try {
        console.log(`Proxy attempting to fetch from: ${baseUrl}${apiPath}`);
        
        // Add a unique timestamp to prevent caching
        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${baseUrl}${apiPath}${apiPath.includes('?') ? '&' : '?'}_t=${timestamp}`;
        
        const response = await axios.get(urlWithTimestamp, {
          params: queryParams,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          timeout: 5000, // 5 second timeout
        });
        
        // If successful, return the data
        console.log(`Successful response from ${baseUrl}${apiPath}`);
        return res.status(200).json(response.data);
      } catch (error) {
        console.error(`Proxy error with ${baseUrl}:`, error);
        lastError = error;
        // Continue to next URL
      }
    }
    
    // If all URLs failed, check for a local sample file
    try {
      // Map endpoint type to sample file
      const sampleFileMap: Record<string, string> = {
        'packages': 'sample-packages.json',
        'offices': 'sample-offices.json',
        'featured-packages': 'sample-packages.json' // Reuse packages sample, filter for featured later
      };
      
      const sampleFile = sampleFileMap[endpointType];
      const filePath = path.join(process.cwd(), 'src', 'data', sampleFile);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const sampleData = JSON.parse(fileContent);
        
        // For featured packages, filter only featured ones
        if (endpointType === 'featured-packages' && sampleData && sampleData.data) {
          sampleData.data = sampleData.data.filter((pkg: any) => pkg.is_featured);
        }
        
        console.log(`Using local sample data for ${endpointType}`);
        return res.status(200).json(sampleData);
      } else {
        throw new Error(`Sample file not found: ${filePath}`);
      }
    } catch (e) {
      console.error('Error loading sample data:', e);
      // If no sample file, return the last error
      throw lastError || new Error('All API URLs failed');
    }
  } catch (error) {
    console.error('Proxy handler error:', error);
    return res.status(500).json({ 
      message: 'Error fetching data from API',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}