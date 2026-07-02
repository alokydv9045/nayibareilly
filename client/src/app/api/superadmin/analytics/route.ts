import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const mockAnalytics = {
    overview: {
      totalUsers: 14520,
      activeCities: 12,
      totalIssues: 8345,
      systemUptime: 99.9,
      avgResponseTime: 45,
      dataIntegrity: 98.5
    },
    performance: {
      serverHealth: 98,
      databasePerformance: 95,
      apiResponseTime: 120,
      errorRate: 0.5,
      throughput: 2500,
      memoryUsage: 65,
      cpuUsage: 45,
      diskUsage: 70
    },
    userAnalytics: {
      dailyActiveUsers: 3450,
      monthlyActiveUsers: 12500,
      userGrowthRate: 15,
      userRetention: 85,
      sessionDuration: 12,
      bounceRate: 25
    },
    cityMetrics: [
      {
        cityName: 'Bareilly Central',
        population: 500000,
        totalIssues: 3200,
        resolutionRate: 92,
        citizenSatisfaction: 4.5,
        systemAdoption: 85,
        dataQuality: 95,
        lastSync: new Date().toISOString()
      },
      {
        cityName: 'Bareilly North',
        population: 350000,
        totalIssues: 2100,
        resolutionRate: 88,
        citizenSatisfaction: 4.2,
        systemAdoption: 78,
        dataQuality: 92,
        lastSync: new Date().toISOString()
      },
      {
        cityName: 'Bareilly South',
        population: 420000,
        totalIssues: 2800,
        resolutionRate: 95,
        citizenSatisfaction: 4.7,
        systemAdoption: 82,
        dataQuality: 96,
        lastSync: new Date().toISOString()
      }
    ],
    systemHealth: {
      services: [
        {
          name: 'Core API Server',
          status: 'healthy',
          uptime: 99.9,
          lastCheck: new Date().toISOString(),
          responseTime: 45
        },
        {
          name: 'Database Cluster',
          status: 'healthy',
          uptime: 99.9,
          lastCheck: new Date().toISOString(),
          responseTime: 12
        },
        {
          name: 'Storage Service',
          status: 'warning',
          uptime: 98.5,
          lastCheck: new Date().toISOString(),
          responseTime: 180
        }
      ],
      alerts: [
        {
          id: '1',
          type: 'warning',
          message: 'Storage capacity reaching 75% threshold',
          timestamp: new Date().toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'info',
          message: 'Weekly backup completed successfully',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          resolved: true
        }
      ]
    },
    dataInsights: {
      topIssueCategories: [
        { category: 'Infrastructure', count: 3240, trend: 5 },
        { category: 'Sanitation', count: 2150, trend: -2 },
        { category: 'Public_Safety', count: 1800, trend: 10 }
      ],
      resolutionTrends: [
        { period: 'Jan', resolved: 450, pending: 50, satisfaction: 4.2 },
        { period: 'Feb', resolved: 520, pending: 45, satisfaction: 4.4 },
        { period: 'Mar', resolved: 610, pending: 30, satisfaction: 4.6 }
      ],
      geographicDistribution: [
        { region: 'North', cities: 4, issues: 2100, performance: 88 },
        { region: 'Central', cities: 3, issues: 3200, performance: 92 },
        { region: 'South', cities: 5, issues: 2800, performance: 95 }
      ]
    },
    financialMetrics: {
      totalBudget: 5000000,
      budgetUtilized: 3250000,
      costPerResolution: 450,
      roiMetrics: {
        citizenSatisfactionROI: 25,
        efficiencyGains: 40,
        costSavings: 1500000
      }
    }
  };

  return NextResponse.json(mockAnalytics);
}
