/**
 * Tree shaking utilities and dead code elimination helpers
 */

interface ModuleUsage {
  module: string;
  exports: string[];
  usedExports: Set<string>;
  unusedExports: string[];
}

class TreeShakingAnalyzer {
  private moduleUsage: Map<string, ModuleUsage> = new Map();
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.DEV;
  }

  /**
   * Track module export usage
   */
  trackExportUsage(moduleName: string, exportName: string): void {
    if (!this.isEnabled) return;

    const usage = this.moduleUsage.get(moduleName) || {
      module: moduleName,
      exports: [],
      usedExports: new Set(),
      unusedExports: []
    };

    usage.usedExports.add(exportName);
    this.moduleUsage.set(moduleName, usage);
  }

  /**
   * Register all exports for a module
   */
  registerModuleExports(moduleName: string, exports: string[]): void {
    if (!this.isEnabled) return;

    const usage = this.moduleUsage.get(moduleName) || {
      module: moduleName,
      exports: [],
      usedExports: new Set(),
      unusedExports: []
    };

    usage.exports = exports;
    usage.unusedExports = exports.filter(exp => !usage.usedExports.has(exp));
    this.moduleUsage.set(moduleName, usage);
  }

  /**
   * Get unused exports report
   */
  getUnusedExports(): ModuleUsage[] {
    return Array.from(this.moduleUsage.values())
      .filter(usage => usage.unusedExports.length > 0);
  }

  /**
   * Generate tree shaking report
   */
  generateTreeShakingReport(): string {
    const unusedExports = this.getUnusedExports();
    
    let report = '🌳 Tree Shaking Analysis\n';
    report += '========================\n\n';

    if (unusedExports.length === 0) {
      report += '✅ No unused exports detected!\n';
      return report;
    }

    report += `Found ${unusedExports.length} modules with unused exports:\n\n`;

    unusedExports.forEach(usage => {
      report += `📦 ${usage.module}\n`;
      report += `   Used: ${Array.from(usage.usedExports).join(', ') || 'none'}\n`;
      report += `   Unused: ${usage.unusedExports.join(', ')}\n\n`;
    });

    return report;
  }
}

/**
 * Utility functions for better tree shaking
 */
export const treeShakingUtils = {
  /**
   * Create a tree-shakable export wrapper
   */
  createTreeShakableExport: <T>(
    factory: () => T,
    condition: boolean | (() => boolean) = true
  ): T | null => {
    const shouldInclude = typeof condition === 'function' ? condition() : condition;
    return shouldInclude ? factory() : null;
  },

  /**
   * Conditional feature loading
   */
  loadFeature: async <T>(
    featureName: string,
    loader: () => Promise<T>,
    condition: boolean | (() => boolean) = true
  ): Promise<T | null> => {
    const shouldLoad = typeof condition === 'function' ? condition() : condition;
    
    if (!shouldLoad) {
      return null;
    }

    try {
      return await loader();
    } catch (error) {
      import('./consoleMigration').then(({ logError }) => {
        logError(`Failed to load feature: ${featureName}`, { error });
      });
      return null;
    }
  },

  /**
   * Environment-specific imports
   */
  loadForEnvironment: async <T>(
    environment: 'development' | 'production' | 'test',
    loader: () => Promise<T>
  ): Promise<T | null> => {
    const currentEnv = import.meta.env.MODE;
    
    if (currentEnv !== environment) {
      return null;
    }

    return await loader();
  },

  /**
   * Feature flag based imports
   */
  loadWithFeatureFlag: async <T>(
    flagName: string,
    loader: () => Promise<T>,
    defaultValue: boolean = false
  ): Promise<T | null> => {
    // Check environment variable
    const envFlag = import.meta.env[`VITE_FEATURE_${flagName.toUpperCase()}`];
    const isEnabled = envFlag ? envFlag === 'true' : defaultValue;

    if (!isEnabled) {
      return null;
    }

    return await loader();
  }
};

/**
 * Dead code elimination helpers
 */
export const deadCodeElimination = {
  /**
   * Mark code as development-only (will be removed in production)
   */
  devOnly: <T>(code: () => T): T | undefined => {
    if (import.meta.env.DEV) {
      return code();
    }
    return undefined;
  },

  /**
   * Mark code as production-only
   */
  prodOnly: <T>(code: () => T): T | undefined => {
    if (import.meta.env.PROD) {
      return code();
    }
    return undefined;
  },

  /**
   * Conditional code execution
   */
  when: <T>(condition: boolean, code: () => T): T | undefined => {
    if (condition) {
      return code();
    }
    return undefined;
  },

  /**
   * Debug-only code (removed in production builds)
   */
  debug: (code: () => void): void => {
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true') {
      code();
    }
  }
};

/**
 * Bundle size optimization helpers
 */
export const bundleOptimization = {
  /**
   * Lazy load heavy dependencies
   */
  lazyLoadDependency: async <T>(
    dependencyName: string,
    loader: () => Promise<T>
  ): Promise<T> => {
    try {
      return await loader();
    } catch (error) {
      throw new Error(`Failed to load dependency: ${dependencyName}`);
    }
  },

  /**
   * Split vendor chunks intelligently
   */
  getVendorChunkName: (id: string): string | undefined => {
    if (!id.includes('node_modules')) return undefined;

    // Core React ecosystem
    if (id.includes('react') || id.includes('react-dom')) {
      return 'vendor-react';
    }

    // UI libraries
    if (id.includes('@radix-ui') || id.includes('lucide-react')) {
      return 'vendor-ui';
    }

    // Data libraries
    if (id.includes('@supabase') || id.includes('@tanstack')) {
      return 'vendor-data';
    }

    // Utility libraries
    if (id.includes('date-fns') || id.includes('clsx') || id.includes('zod')) {
      return 'vendor-utils';
    }

    return 'vendor-misc';
  },

  /**
   * Check if module should be externalized
   */
  shouldExternalize: (id: string): boolean => {
    // Externalize large libraries that are commonly available via CDN
    const externalizable = [
      'react',
      'react-dom',
      'lodash',
      'moment'
    ];

    return externalizable.some(lib => id.includes(lib));
  }
};

// Create analyzer instance
export const treeShakingAnalyzer = new TreeShakingAnalyzer();

// Development utilities
if (import.meta.env.DEV) {
  (window as unknown).treeShakingAnalyzer = treeShakingAnalyzer;
  
  // Generate report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log(treeShakingAnalyzer.generateTreeShakingReport());
    }, 3000);
  });
}

export default treeShakingAnalyzer;
