import { NextResponse } from 'next/server';
import os from 'os';
import process from 'process';

/**
 * Health check API endpoint for monitoring system status
 * Returns information about the application health, uptime, and system metrics
 * Used by Docker health checks and external monitoring systems
 */
export async function GET() {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    const cpuUsage = os.loadavg();
    
    // Convert to human readable format
    const formatBytes = (bytes: number) => {
      const mb = bytes / 1024 / 1024;
      return `${mb.toFixed(2)} MB`;
    };
    
    // Format uptime
    const formatUptime = (seconds: number) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const sec = Math.floor(seconds % 60);
      
      return `${days}d ${hours}h ${minutes}m ${sec}s`;
    };

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      uptime: formatUptime(uptime),
      memory: {
        usage: formatBytes(memoryUsage.rss),
        heapTotal: formatBytes(memoryUsage.heapTotal),
        heapUsed: formatBytes(memoryUsage.heapUsed),
        external: formatBytes(memoryUsage.external),
        free: formatBytes(freeMemory),
        total: formatBytes(totalMemory),
        percentUsed: `${((1 - freeMemory / totalMemory) * 100).toFixed(2)}%`,
      },
      cpu: {
        loadAvg1m: cpuUsage[0].toFixed(2),
        loadAvg5m: cpuUsage[1].toFixed(2),
        loadAvg15m: cpuUsage[2].toFixed(2),
      },
      hostname: os.hostname(),
      platform: os.platform(),
    };

    // Set cache-control header to prevent caching
    const headers = {
      'Cache-Control': 'no-store, max-age=0',
    };

    return NextResponse.json(healthData, { status: 200, headers });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}