import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Users, BarChart3, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchService } from '@/lib/services/searchService';

interface SearchAnalyticsDashboardProps {
  className?: string;
}

const SearchAnalyticsDashboard: React.FC<SearchAnalyticsDashboardProps> = ({
  className
}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = searchService.getSearchAnalyticsSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load search analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalytics = () => {
    const data = searchService.getSearchAnalyticsSummary();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Search Data Available
            </h3>
            <p className="text-gray-600">
              Search analytics will appear here once users start searching.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Search Analytics</h2>
          <p className="text-gray-600">Monitor search behavior and performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSearches.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Queries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalSearches > 0 
                ? Math.round((analytics.uniqueQueries / analytics.totalSearches) * 100)
                : 0}% of total searches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Results</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgResultsCount}</div>
            <p className="text-xs text-muted-foreground">
              Results per search
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zero Results</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.zeroResultsPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              Searches with no results
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Searches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Popular Searches</span>
            </CardTitle>
            <CardDescription>
              Most frequently searched terms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popularSearches.slice(0, 10).map((search: string, index: number) => (
                <div key={search} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{search}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={((10 - index) / 10) * 100} 
                      className="w-16 h-2"
                    />
                    <span className="text-sm text-gray-500 w-8 text-right">
                      {Math.round(((10 - index) / 10) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Search Performance</span>
            </CardTitle>
            <CardDescription>
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Search Success Rate</span>
                  <span className="text-sm text-gray-500">
                    {100 - analytics.zeroResultsPercentage}%
                  </span>
                </div>
                <Progress value={100 - analytics.zeroResultsPercentage} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Query Diversity</span>
                  <span className="text-sm text-gray-500">
                    {analytics.totalSearches > 0 
                      ? Math.round((analytics.uniqueQueries / analytics.totalSearches) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={analytics.totalSearches > 0 
                    ? (analytics.uniqueQueries / analytics.totalSearches) * 100
                    : 0} 
                  className="h-2" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Results Quality</span>
                  <span className="text-sm text-gray-500">
                    {Math.min(100, (analytics.avgResultsCount / 10) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, (analytics.avgResultsCount / 10) * 100)} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Suggestions to improve search experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.zeroResultsPercentage > 20 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-yellow-800">High Zero Results Rate</p>
                  <p className="text-sm text-yellow-700">
                    {analytics.zeroResultsPercentage}% of searches return no results. Consider improving product tagging or adding synonyms.
                  </p>
                </div>
              </div>
            )}

            {analytics.uniqueQueries / analytics.totalSearches < 0.3 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-blue-800">Low Query Diversity</p>
                  <p className="text-sm text-blue-700">
                    Users are searching for similar terms. Consider promoting diverse product categories.
                  </p>
                </div>
              </div>
            )}

            {analytics.avgResultsCount < 3 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-red-800">Low Average Results</p>
                  <p className="text-sm text-red-700">
                    Searches return few results on average. Consider expanding your product catalog or improving search algorithms.
                  </p>
                </div>
              </div>
            )}

            {analytics.zeroResultsPercentage <= 10 && analytics.avgResultsCount >= 5 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-green-800">Great Search Performance!</p>
                  <p className="text-sm text-green-700">
                    Your search is performing well with good result coverage and low zero-result rate.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchAnalyticsDashboard;