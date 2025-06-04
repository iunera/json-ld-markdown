# markdown-to-json-ld

Transform Markdown to JSON-LD with Advanced Table & Annotation Support

This is the npm package for the [json-ld-markdown](https://github.com/iunera/json-ld-markdown) project.

## Installation

```bash
npm install markdown-to-json-ld
```

## CDN Usage

You can also use this library directly from a CDN without installing it locally:

```html
<!-- Include the library from unpkg CDN -->
<script src="https://unpkg.com/markdown-to-json-ld@1.0.2/dist/markdown-to-json-ld.js"></script>
```

When loaded via CDN, the library is available as a global variable `window.MarkdownToJsonLd` with the following components:

```javascript
// Access the components
const EnhancedMarkdownParser = window.MarkdownToJsonLd.EnhancedMarkdownParser;
const JsonLDTransformer = window.MarkdownToJsonLd.JsonLDTransformer;

// Use the transformer
const jsonLd = window.MarkdownToJsonLd.JsonLDTransformer.transform(markdownContent, config);
```

### Example HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>Markdown to JSON-LD Example</title>
</head>
<body>
    <!-- Your HTML content -->

    <!-- Include the library from CDN -->
    <script src="https://unpkg.com/markdown-to-json-ld@1.0.2/dist/markdown-to-json-ld.js"></script>

    <script>
        // Your markdown content
        const markdown = `# My Article\n\nThis is content.`;

        // Configuration
        const config = {
            type: 'Article',
            author: ['John Doe'],
            publisher: {
                name: 'Example Publisher',
                url: 'https://example.com'
            }
        };

        // Transform markdown to JSON-LD
        const jsonLd = window.MarkdownToJsonLd.JsonLDTransformer.transform(markdown, config);

        // Use the result
        console.log(jsonLd);
    </script>
</body>
</html>
```

## Usage

The library provides two main classes:
- `EnhancedMarkdownParser`: Parses Markdown content and extracts various components
- `JsonLDTransformer`: Transforms the parsed Markdown data into JSON-LD

### Basic Usage

```javascript
import { JsonLDTransformer } from 'markdown-to-json-ld';

// Your Markdown content
const markdownContent = `---
title: My Article
type: Article
schema: https://schema.org
date: 2023-08-15
author: John Doe
---

# My Article

This is the content of my article.`;

// Configuration options
const config = {
  baseUrl: 'https://example.com',
  slug: 'my-article',
  descriptionLength: 200,
  type: 'Article',
  date: '2023-08-15',
  author: ['John Doe'],
  publisher: {
    name: 'Example Publisher',
    url: 'https://example.com'
  },
  keywords: ['example', 'article'],
  categories: ['Technology']
};

// Transform Markdown to JSON-LD
const jsonLd = JsonLDTransformer.transform(markdownContent, config);

// Output the JSON-LD
console.log(JSON.stringify(jsonLd, null, 2));
```

### Configuration Options

The `transform` method accepts the following configuration options:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `baseUrl` | string | Base URL for the article | `'https://example.com'` |
| `slug` | string | Slug for the article URL | `''` |
| `descriptionLength` | number | Maximum length for the description | `200` |
| `type` | string | Type of the article (e.g., 'Article', 'NewsArticle') | `'Article'` |
| `date` | string | Publication date in ISO format | Current date |
| `author` | array | Array of author names | `[]` |
| `publisher` | object | Publisher information | `{}` |
| `keywords` | array | Keywords for the article | `[]` |
| `categories` | array | Categories for the article | `[]` |

### Advanced Features

#### YAML Front Matter

The library supports YAML front matter for defining metadata:

```markdown
---
title: My Article
type: Article
schema: https://schema.org
date: 2023-08-15
author: John Doe
publisher.name: Example Publisher
publisher.url: https://example.com
slug: my-article
keywords: [example, article]
categories: [Technology]
---

# My Article

Content here...
```

#### FAQ Sections

FAQ sections are automatically detected and transformed into a separate `FAQPage` JSON-LD object:

```markdown
## Frequently Asked Questions

### What is this?
This is an example.

### How does it work?
It works like this...
```

#### Tables

Markdown tables are automatically detected and transformed into `Table` or `Dataset` JSON-LD objects:

```markdown
| Name | Price | Description |
|------|-------|-------------|
| Item 1 | $10 | Description 1 |
| Item 2 | $20 | Description 2 |
```

#### Lists

Ordered and unordered lists are transformed into `ItemList` JSON-LD objects:

```markdown
- Item 1
- Item 2
- Item 3
```

#### Links

Links are transformed into appropriate JSON-LD objects based on their URL:

```markdown
[Example](https://example.com)
[GitHub Repository](https://github.com/example/repo)
[YouTube Video](https://youtube.com/watch?v=123456)
```

#### Multiple Types

You can define multiple JSON-LD types in a single Markdown file using the `---` separator:

```markdown
---
type: Article
schema: https://schema.org
---

# My Article

Content here...

---
type: Document
schema: http://purl.org/dc/terms/
---

# Metadata

Additional metadata here...
```

## Examples

For more examples, see the [example-articles](https://github.com/iunera/json-ld-markdown/tree/main/example-articles) directory in the main repository.

For a comprehensive example that demonstrates many of the library's features including YAML front matter, FAQ sections, and multiple types, see the [License Token Article example](https://github.com/iunera/json-ld-markdown/blob/main/example-articles/examples_license_token_article.md).

## API Reference

### EnhancedMarkdownParser

The `EnhancedMarkdownParser` class provides methods for parsing Markdown content:

- `extractMetadata(content)`: Extracts metadata from YAML front matter
- `extractContext(content)`: Extracts the JSON-LD context
- `extractTables(content)`: Extracts tables from the content
- `extractLists(content)`: Extracts lists from the content
- `extractLinks(content, articleUrl)`: Extracts links from the content
- `extractAnnotations(content)`: Extracts annotations from the content
- `extractTitle(content)`: Extracts the title from the content
- `extractDescription(content, maxLength)`: Extracts the description from the content
- `extractArticleBody(content)`: Extracts the article body from the content
- `extractSections(content)`: Extracts sections from the content
- `extractFaqQuestions(content)`: Extracts FAQ questions from the content

### JsonLDTransformer

The `JsonLDTransformer` class provides methods for transforming Markdown to JSON-LD:

- `transform(markdownContent, config)`: Transforms Markdown content to JSON-LD
- `processAuthors(authors, articleUrl)`: Processes author information
- `processPublisher(publisher)`: Processes publisher information

## For more information

For full documentation, please see the [main repository README](https://github.com/iunera/json-ld-markdown).


## License

We choose fair [code, fair work, fair payment, open collaboration](https://www.license-token.com).

## [Open Compensation Token License](https://www.license-token.com/license/text)

```
Licensed under the OPEN COMPENSATION TOKEN LICENSE (the "License").

You may not use this file except in compliance with the License.

You may obtain a copy of the License at
[https://github.com/open-compensation-token-license/license/blob/main/LICENSE.md](https://github.com/open-compensation-token-license/license/blob/main/LICENSE.md)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either expressed or implied.
See the License for the specific language governing permissions and
limitations under the License.

@octl.sid: 5fecd757-5fec-d757-d757-00005fb33b80
```

@octl.sid: [x-octl-sid:5fecd757-5fec-d757-d757-00005fb33b80](https://www.license-token.com/license/new-procurement/x-octl-sid%3A5fecd757-5fec-d757-d757-00005fb33b80)

* Why did we [choose the OCTL as alternative to the BSD 3-Clause License](https://www.license-token.com/wiki/unveiling-bsd-3-clause-license-summary)?
* Why we [do NOT apply Apache 2.0 License](https://www.license-token.com/wiki/the-downside-of-apache-license-and-why-i-never-would-use-it)?

This project is licensed under the Open Compensation Token License (OCTL), with the unique project identifier
`x-octl-sid:5fecd757-5fec-d757-d757-00005fb33b80`. The OCTL enables blockchain-based licensing and royalty distribution via NFTs. View the license token
at [https://www.license-token.com/license/new-procurement/x-octl-sid%3A5fecd757-5fec-d757-d757-00005fb33b80](https://www.license-token.com/license/new-procurement/x-octl-sid%3A5fecd757-5fec-d757-d757-00005fb33b80).
See the [LICENSE](LICENSE) file or [OCTL license text](https://github.com/open-compensation-token-license/license/blob/main/LICENSE.md) for details. For OCTL
compliance, ensure contributions are registered with the project’s `x-octl-sid` using the license token link.
