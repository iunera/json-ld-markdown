// Main entry point for the markdown-to-json-ld package
import { EnhancedMarkdownParser } from './enhanced-markdown-parser.js';
import { JsonLDTransformer } from './json-ld-transformer.js';

// Export all classes
export {
    EnhancedMarkdownParser,
    JsonLDTransformer
};

// Default export for convenience
export default {
    EnhancedMarkdownParser,
    JsonLDTransformer,

    // Helper function to transform markdown to JSON-LD
    transform: (markdown, config) => {
        return JsonLDTransformer.transform(markdown, config);
    }
};
