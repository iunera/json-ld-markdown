// Main entry point for the markdown-to-json-ld package
import { Config } from './config.js';
import { EnhancedMarkdownParser } from './enhanced-markdown-parser.js';
import { JsonLDTransformer } from './json-ld-transformer.js';
import { UIController } from './ui-controller.js';

// Export all classes
export {
    Config,
    EnhancedMarkdownParser,
    JsonLDTransformer,
    UIController
};

// Initialize the application when the DOM is loaded
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new UIController();
    });
}

// Default export for convenience
export default {
    Config,
    EnhancedMarkdownParser,
    JsonLDTransformer,
    UIController,
    
    // Helper function to transform markdown to JSON-LD
    transform: (markdown, config) => {
        if (!config) {
            config = new Config();
        }
        return JsonLDTransformer.transform(markdown, config);
    }
};