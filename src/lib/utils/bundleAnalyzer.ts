interface BundleInfo {
  name: string;
  size: number;
  gzipSize?: number;
  loadTime?: number;
  isLoaded: boolean;
}

interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  parseTime: number;
  executeTime: number;
}

class BundleAnalyzer {
  private bundles: Map<string, BundleInfo> = new Map();
  private performanceObserver?: PerformanceObserver;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_BUNDLE_ANALYSIS === 'true';
    
    if (this.isEnabled) {
      this.initializePerformanceObserver();
      this.trackInitialBundles();
    }
  }

  private initializePerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('.js')) {
          this.trackBundle(entry as PerformanceResourceTiming);
        }
      }
    });

    this.performanceObserver.observe({ entryTypes: ['resource'] });
  }

  private trackInitialBundles(): void {
    // Track bundles that are already loaded
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('.js')) {
        const name = this.extractBundleName(src);
        this.bundles.set(name, {
          name,
          size: 0,
          isLoaded: true,
          loadTime: 0
        });
      }
    });
  }

  private trackBundle(entry: PerformanceResourceTiming): void {
    const name = this.extractBundleName(entry.name);
    const size = entry.transferSize || entry.encodedBodySize || 0;
    const loadTime = entry.responseEnd - entry.requestStart;

    this.bundles.set(name, {
      name,
      size,
      loadTime,
      isLoaded: true
    });

    if (this.isEnabled) {
      this.logBundleInfo(name, { size, loadTime });
    }
  }

  private extractBundleName(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace(/\.[a-f0-9]+\.js$/, '').replace(/\.js$/, '');
  }

  private logBundleInfo(name: string, metrics: { size: number; loadTime: number }): void {
    const sizeKB = (metrics.size / 1024).toFixed(2);
    const loadTimeMs = metrics.loadTime.toFixed(2);
    
    console.group(`📦 Bundle Loaded: ${name}`);
    console.log(`Size: ${sizeKB} KB`);
    console.log(`Load Time: ${loadTimeMs} ms`);
    console.groupEnd();
  }

  /**
   * Get information about all loaded bundles
   */
  getBundleInfo(): BundleInfo[] {
    return Array.from(this.bundles.values());
  }

  /**
   * Get total bundle size
   */
  getTotalBundleSize(): number {
    return Array.from(this.bundles.values())
      .reduce((total, bundle) => total + bundle.size, 0);
  }

  /**
   * Get performance metrics for a specific bundle
   */
  getBundleMetrics(bundleName: string): BundleInfo | undefined {
    return this.bundles.get(bundleName);
  }

  /**
   * Track custom performance metrics
   */
  trackCustomMetric(name: string, value: number, unit: string = 'ms'): void {
    if (this.isEnabled) {
      console.log(`⚡ ${name}: ${value}${unit}`);
    }

    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'custom_metric', {
        metric_name: name,
        metric_value: value,
        metric_unit: unit
      });
    }
  }

  /**
   * Analyze bundle loading patterns
   */
  analyzeBundlePatterns(): {
    totalSize: number;
    averageLoadTime: number;
    slowestBundle: BundleInfo | null;
    largestBundle: BundleInfo | null;
  } {
    const bundles = this.getBundleInfo();
    const totalSize = this.getTotalBundleSize();
    const averageLoadTime = bundles.length > 0 
      ? bundles.reduce((sum, b) => sum + (b.loadTime || 0), 0) / bundles.length 
      : 0;

    const slowestBundle = bundles.reduce((slowest, current) => 
      (current.loadTime || 0) > (slowest?.loadTime || 0) ? current : slowest, null as BundleInfo | null);

    const largestBundle = bundles.reduce((largest, current) => 
      current.size > (largest?.size || 0) ? current : largest, null as BundleInfo | null);

    return {
      totalSize,
      averageLoadTime,
      slowestBundle,
      largestBundle
    };
  }

  /**
   * Generate bundle report
   */
  generateReport(): string {
    const analysis = this.analyzeBundlePatterns();
    const bundles = this.getBundleInfo();

    let report = '📊 Bundle Analysis Report\n';
    report += '========================\n\n';
    report += `Total Bundles: ${bundles.length}\n`;
    report += `Total Size: ${(analysis.totalSize / 1024).toFixed(2)} KB\n`;
    report += `Average Load Time: ${analysis.averageLoadTime.toFixed(2)} ms\n\n`;

    if (analysis.largestBundle) {
      report += `Largest Bundle: ${analysis.largestBundle.name} (${(analysis.largestBundle.size / 1024).toFixed(2)} KB)\n`;
    }

    if (analysis.slowestBundle) {
      report += `Slowest Bundle: ${analysis.slowestBundle.name} (${(analysis.slowestBundle.loadTime || 0).toFixed(2)} ms)\n`;
    }

    report += '\nBundle Details:\n';
    report += '---------------\n';
    bundles
      .sort((a, b) => b.size - a.size)
      .forEach(bundle => {
        report += `${bundle.name}: ${(bundle.size / 1024).toFixed(2)} KB (${(bundle.loadTime || 0).toFixed(2)} ms)\n`;
      });

    return report;
  }

  /**
   * Check for bundle size warnings
   */
  checkBundleWarnings(): string[] {
    const warnings: string[] = [];
    const bundles = this.getBundleInfo();
    const analysis = this.analyzeBundlePatterns();

    // Check total bundle size
    if (analysis.totalSize > 1024 * 1024) { // 1MB
      warnings.push(`Total bundle size is large: ${(analysis.totalSize / 1024 / 1024).toFixed(2)} MB`);
    }

    // Check individual bundle sizes
    bundles.forEach(bundle => {
      if (bundle.size > 500 * 1024) { // 500KB
        warnings.push(`Large bundle detected: ${bundle.name} (${(bundle.size / 1024).toFixed(2)} KB)`);
      }
    });

    // Check load times
    if (analysis.averageLoadTime > 1000) { // 1 second
      warnings.push(`Slow average load time: ${analysis.averageLoadTime.toFixed(2)} ms`);
    }

    return warnings;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Create singleton instance
export const bundleAnalyzer = new BundleAnalyzer();

// Development utilities
if (import.meta.env.DEV) {
  // Add global access for debugging
  (window as unknown).bundleAnalyzer = bundleAnalyzer;

  // Log bundle report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log(bundleAnalyzer.generateReport());
      
      const warnings = bundleAnalyzer.checkBundleWarnings();
      if (warnings.length > 0) {
        console.warn('⚠️ Bundle Warnings:');
        warnings.forEach(warning => console.warn(`  - ${warning}`));
      }
    }, 2000);
  });
}

export default bundleAnalyzer;
