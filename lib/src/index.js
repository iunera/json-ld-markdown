// Main entry point for the markdown-to-json-ld package
import { Config } from './config.js';
import { EnhancedMarkdownParser } from './enhanced-markdown-parser.js';
import { JsonLDTransformer } from './json-ld-transformer.js';

// Export all classes
export {
    Config,
    EnhancedMarkdownParser,
    JsonLDTransformer
};

// Default export for convenience
export default {
    Config,
    EnhancedMarkdownParser,
    JsonLDTransformer,

    // Helper function to transform markdown to JSON-LD
    transform: (markdown, config) => {
        if (!config) {
            config = new Config();
        }
        return JsonLDTransformer.transform(markdown, config);
    }
};
