# markdown-to-structured-jsonld: Default Markdown to Structured JSON-LD Transformation
[Json-LD is required for AI training](https://www.iunera.com/kraken/machine-learning-ai/enterprise-data-java-spring-ai-nlweb/), [AI indexing](https://news.microsoft.com/source/features/company-news/introducing-nlweb-bringing-conversational-interfaces-directly-to-the-web/) and extended search engine snippets. Markdown files do not translate natively into [Json-LD](https://www.iunera.com/kraken/fabric/json-ld/). This project offers an easy way to transform markdown into Json-LD.

## Overview
The **markdown-to-structured-jsonld** project transforms non-annotated Markdown files into structured JSON-LD data, primarily using Schema.org but extendable to other schemas (e.g., Dublin Core). This README describes the **Default Markdown to Structured JSON-LD Transformation**, which maps Markdown structures (e.g., articles, FAQs) to Schema.org types (e.g., `Article`, `NewsArticle`, `FAQPage`) using YAML front matter and document content, or minimal inference for plain Markdown. This way, markdown files can be transformed easily and allow simple semantic data extraction for AI-driven applications like [NLWeb’s conversational AI](https://www.iunera.com/kraken/category/nlweb/). The transformation uses Markdown as the root format to generate multiple outputs (JSON-LD, HTML, Java objects) and is compatible with traditional Markdown renderers (e.g., GitHub, CommonMark).

An extended Markdown format with inline annotations (e.g., `[text]@{Type,property=value}`) is available for explicit tagging. See the extended specification for details.

This specification is created in formal and precise way, hoping to enable all AI systems to create parsers or transformers for the format.

## Support for Ordinary Markdown Files

The transformer can process any Markdown file. For plain Markdown, it infers minimal metadata:
- **Type**: Defaults to `Article` (Schema.org).
- **Schema**: Defaults to `https://schema.org`.
- **Name**: Taken from the first H1 header, or the file name if no H1 exists.
- **Description**: Taken from the first paragraph, or a 200-character excerpt if no distinct paragraph is found.
- **ArticleBody**: Concatenates all paragraphs, lists, and blockquotes.
- **URL**: Uses a default base URL (configurable, e.g., `https://www.iunera.com/blog/{{filename}}`) if no `base_url` is provided.
- **Author**, **Publisher**, **Date**, **Keywords**, **Categories**: Use transformer defaults (configurable) or remain empty if not specified.

This ensures that even minimal Markdown files produce valid JSON-LD, making the transformer versatile for various use cases.

## Transformer Options

The transformer supports configuration options to customize metadata, either manually or via defaults, ensuring flexibility for files with incomplete or no YAML front matter. Options include:

1. **Manual Settings**:
   - `--type <string>`: Set the document type (e.g., `NewsArticle`); overrides YAML `type`.
   - `--schema <url>`: Set the schema URL (e.g., `https://schema.org`); overrides YAML `schema`.
   - `--author <string | JSON-LD>`: Set the author(s) (e.g., `["Christian Schmitt", "Dr. Tim Frey"]`).
   - `--publisher <JSON-LD>`: Set publisher details (e.g., `{"@type": "Organization", "name": "Iunera", "@id": "https://www.iunera.com"}`).
   - `--date <ISO date>`: Set publication date (e.g., `2025-06-01`).
   - `--base-url <url>`: Set base URL (e.g., `https://www.iunera.com/blog/`).
   - `--keywords <list>`: Set keywords.
   - `--categories <list>`: Set categories. 
   (- `-- extensions)
   
2. **Default Values**:
   - **Type**: `Article` if not specified.
   - **Schema**: `https://schema.org` if not specified.
   - **Author**: Configurable default (e.g., `["Unknown Author"]`) or empty.
   - **Publisher**: Configurable default (e.g., `{"@type": "Organization", "name": "Unknown Publisher", "@id": "https://example.com"}`) or empty.
   - **Date**: Current date (e.g., `2025-06-01`) or empty.
   - **Base URL**: Configurable default (e.g., `https://www.iunera.com/blog/`) with `{{filename}}` for URL generation.
   - **Keywords**, **Categories**: Empty lists if not specified.

3. **Empty Fields**:
   - Fields like `keywords`, `categories`, `author`, `publisher`, and `date` can be omitted, resulting in empty or null values in JSON-LD where Schema.org allows (e.g., `keywords: []`, `author: null`).


## How It Works: Abstract Level

The transformation converts non-annotated Markdown into JSON-LD by analyzing YAML front matter and document structure, or inferring minimal metadata for plain Markdown. Key components include:

1. **YAML Front Matter**: Defines metadata such as type, schema, author(s), publisher, keywords, categories, and URL template. If absent, defaults or transformer options apply.
2. **Document Structure**: Maps Markdown elements to JSON-LD:
   - H1 headers set the `name`.
   - First paragraph sets the `description`.
   - Paragraphs, lists, and blockquotes form the `articleBody`.
   - H2 headers like `FAQ` or `Frequently Asked Questions` trigger a `FAQPage`.
3. **FAQ Handling**: FAQ sections are identified by an H2 header (`FAQ`, `Frequently Asked Questions`, case-insensitive, with optional trailing text) or `is_faq: true` in YAML for standalone FAQs. FAQs in articles generate a linked `FAQPage`, reusing article metadata.
4. **Extendable Types**: A `---` separator defines new JSON-LD sections, each with its own type and schema, reusing main article metadata unless overridden.
5. **Metadata Reuse**: Secondary entities (e.g., `FAQPage`, custom types) inherit metadata from the main article.
6. **Links**: `mailto` links are transformed into `email` properties.

The transformer uses configuration options to ensure flexibility, producing valid JSON-LD for any Markdown input.

## How It Works: Example-Based Explanation

Below, we use an example article on **License Token: Pioneering Fair Code and Combating Open Source Exploitation** to illustrate the transformation, followed by variants showing default behavior and minimal Markdown.

### Example Markdown Document (With Type and Schema)
```markdown
---
type: Article
schema: https://schema.org
base_url: {{base_url}}/blog/{{slug}}
date: 2025-06-01
author: [Dr. Tim Frey,Christian Schmitt]
publisher.name: Iunera
publisher.url: https://www.iunera.com/
publisher.id: https://www.iunera.com
publisher.address.type: PostalAddress
publisher.address.streetAddress: Altrottstraße 31
publisher.address.addressLocality: Walldorf
publisher.address.postalCode: 69190
publisher.telephone: +49 6227 381350
slug: {{slug}}
keywords: [open source, fair code, license token, blockchain, AI]
categories: [Technology, Software Licensing, Blockchain Innovation]
---

# License Token: Pioneering Fair Code and Combating Open Source Exploitation

[Iunera](https://www.iunera.com/) is  [revolutionizing open software with the **License Token** model](license-token.com), specifically the [Open Compensation Token License (OCTL)](https://github.com/open-compensation-token-license/octl). This article explores how [OCTL tackles exploitation, promotes fair code principles, and leverages blockchain and AI for a sustainable developer ecosystem](https://github.com/open-compensation-token-license/octl/blob/main/octl-whitepaper.md).

## The Open Source Exploitation Crisis
Open source software powers 90% of modern applications, from cloud platforms to AI models. Yet, a 2025 study reveals 70% of maintainers receive no financial support, despite corporate exploitation. This imbalance causes burnout, underfunded projects, and vulnerabilities like Heartbleed (2014). Without change, open source sustainability is at risk.

## OCTL: A Fair Code Solution
The OCTL ensures fair compensation via blockchain. Features include:
- **NFT Royalties**: OCTL NFTs track usage and automate royalty payments.
- **Fair Code**: Balances freedoms with rewards.
- **AI Attribution**: Allows to license AI training data with equitable rewards.
- **Transparency**: Blockchain provides an audit trail.

## How OCTL Works
1. **License Creation**: Developers or training set creators mint an OCTL NFT with royalty terms for their software.
2. **Code Usage**: Enterprises register usage. 
3. **Distribution**: Smart contracts distribute royalties to the NFT holders and creators..

## Future of Fair Code
OCTL shifts open source licensing, fostering equity and collaboration. Adoption could transform the open source ecosystem to more fair licenses, preventing exploitation.

## About the Authors
Christian Schmitt and Dr. Tim Frey, specialize in blockchain, big data and AI. Contact them at [contact iunera.com](mailto:contact iunera.com).

## Frequently Asked Questions
### What is OCTL?
A blockchain-based license ensuring fair compensation via NFT royalties.

### How does OCTL prevent exploitation?
NFTs and smart contracts track usage, requiring royalties.
```
---

### Transformation Process
1. **YAML Parsing**:
   - `type: Article` and `schema: https://schema.org` define a Schema.org `Article`.
   - `author: [Dr. Tim Frey, Christian Schmitt]` maps to:
     ```json
     [
       { "@type": "Person", "name": "Dr. Tim Frey", "@id": "#tim-frey" },
       { "@type": "Person", "name": "Christian Schmitt", "@id": "#christian-schmitt" }
    
     ]
     ```
   - `publisher` uses dot notation, generating nested JSON-LD with `@id: https://www.iunera.com`.
   - `base_url` and `slug: {{slug}}` form the URL.
   - `keywords` and `categories` map to `keywords` and `about`.
2. **Main Article**:
   - H1 sets `name`.
   - First paragraph sets `description`.
   - Content before `---` forms `articleBody`.
   - `mailto:info@iunera.com` becomes `email` for `author`.
3. **FAQ Section**:
   - Triggered by `## Frequently Asked Questions`, generating a `FAQPage`.
   - H3 headers become `Question` objects, paragraphs become `acceptedAnswer.text`.
   - Linked via `mainEntityOfPage`.
   - Reuses article metadata.
4. **Output**:
   - Two JSON-LD objects: `Article`, `FAQPage`

### Example Without Type, Schema, or YAML
```markdown
# License Token: Pioneering Fair Code and Combating Open Source Exploitation

[... rest of the content identical to the first example, without FAQ or custom type ...]
```

### Transformation Process (Minimal Markdown)
- **No YAML**: Transformer infers metadata:
  - `type`: `Article` (default).
  - `schema`: `https://schema.org` (default).
  - `name`: From H1 (`License Token...`).
  - `description`: From first paragraph.
  - `articleBody`: All content.
  - `url`: Default base URL with filename (e.g., `https://www.iunera.com/blog/license-token-article`).
  - `author`, `publisher`, `date`, `keywords`, `categories`: Use transformer defaults (e.g., `author: ["Unknown Author"]`, `publisher: {"@type": "Organization", "name": "Unknown Publisher"}`, `date: 2025-06-01`) or empty.
- **Output**: Single `Article` JSON-LD object with minimal metadata.

### Prompt for Compliant Markdown Articles
To ensure generated Markdown articles produce compliant JSON-LD when processed by the **markdown-to-structured-jsonld** transformer, include the following directive in your article generation prompts:

```
Generate a Markdown article compliant with the markdown-to-structured-jsonld project’s Default Markdown to Structured JSON-LD Transformation. Include:

1. **YAML Front Matter**:
   - `type`: A Schema.org type (e.g., `Article`, `NewsArticle`); omit to default to `Article`.
   - `schema`: A schema URL (e.g., `https://schema.org`); omit to default to `https://schema.org`.
   - `base_url`: Set to `{{base_url}}/blog/{{slug}}` for dynamic URL generation.
   - `date`: Current date in ISO 8601 format (e.g., `2025-06-01`).
   - `author`: A list of author names (e.g., `[Author One, Author Two]`) or JSON-LD.
   - `publisher.name`: Publisher name (e.g., `Iunera`).
   - `publisher.url`: Publisher URL (e.g., `https://www.iunera.com/`).
   - `publisher.id`: Publisher identifier (e.g., `https://www.iunera.com`).
   - `publisher.address.type`: `PostalAddress`.
   - `publisher.address.streetAddress`, `publisher.address.addressLocality`, `publisher.address.postalCode`: Address details.
   - `publisher.telephone`: Contact number.
   - `slug`: Set to `{{slug}}` for parameterization.
   - `keywords`: List of relevant keywords; optional.
   - `categories`: List of categories as topics; optional.

Ensure a FAQ section is named FAQ or Frequently asked questions. 

Ensure the Markdown is compatible with traditional renderers, uses standard syntax, and produces valid Schema.org JSON-LD when processed by the markdown-to-structured-jsonld transformer. 
```

### Purpose of the Prompt
This prompt ensures that generated Markdown articles adhere to the transformation rules of the **markdown-to-structured-jsonld** project, producing valid Schema.org JSON-LD output. It enforces a consistent structure with YAML front matter, article content, an FAQ section, and an optional custom type section, while allowing flexibility (e.g., omitting `type`, `schema`, `keywords`, or `categories` for defaults). The prompt guarantees compatibility with traditional Markdown renderers and supports semantic data extraction for NLWeb’s AI applications, even for minimal Markdown files. By including this directive in any article generation prompt, you ensure compliance with the project’s requirements, as shown in the examples above.

## Syntax and Mapping Rules
### 1. YAML Front Matter
- **Purpose**: Defines metadata for the main document and sections.
- **Syntax**:
  ```yaml
  ---
  type: <string>
  schema: <url>
  base_url: <url_template>
  date: <ISO date>
  author: <string | [string, ...] | JSON-LD>
  publisher.<property>: <value>
  slug: <string>
  keywords: [<string>, ...]
  categories: [<string>, ...]
  ---
  ```
  - `title`: Maps to `name`.
  - `type`: Schema.org type (e.g., `Article`, `FAQPage`); defaults to `Article`.
  - `schema`: Vocabulary URL (default `https://schema.org`).
  - `base_url`, `slug`: Form the URL; `slug` optional with transformer default.
  - `date`: Maps to `datePublished`; optional with transformer default.
  - `author`: String, list, or JSON-LD; lists map to multiple `Person` objects; optional.
  - `publisher.<property>`: Dot notation for JSON-LD; optional.
  - `keywords`: Maps to `keywords`; optional.
  - `categories`: Maps to `about`; optional.
- **Behavior**:
  - Parsed as metadata for the main document.
  - Dot notation generates nested JSON-LD.
  - Metadata reused for secondary entities.
  - Ignored by non-YAML renderers.

### 2. Document-Level Mapping
- **Default Type**: `Article` (Schema.org)
- **Trigger**: No YAML `type` or specific structure.
- **Properties**:
  - `name`: YAML `title`, H1, or file name.
  - `description`: First paragraph or 200-character excerpt.
  - `url`: YAML `base_url` with `slug`, or default base URL with filename.
  - `@context`: YAML `schema` or `https://schema.org`.
  - `author`, `publisher`, `datePublished`, `keywords`, `about`: From YAML, transformer defaults, or empty.

### 3. Article Mapping
- **Type**: `Article` or specified type
- **Trigger**: YAML `type` or H1 with paragraphs.
- **Properties**:
  - `name`: YAML `title` or H1.
  - `description`: First paragraph or excerpt.
  - `articleBody`: Concatenated paragraphs, lists, blockquotes.
  - `datePublished`: YAML `date` or default.
  - `author`, `publisher`: From YAML, defaults, or empty.
  - `url`: YAML `base_url` with `slug` or default.
  - `keywords`, `about`: From YAML or empty.

### 4. FAQPage Mapping
- **Type**: `FAQPage`
- **Trigger**:
  - H2 header matching `FAQ` or `Frequently Asked Questions` (case-insensitive, optional trailing text).
- **Properties**:
  - `name`: Article `name` with “FAQ: ” prefix, or YAML `title`.
  - `mainEntity`: `Question` objects from H3 headers and paragraphs.
  - `url`: Article URL or YAML `base_url` with `slug`.
  - Reuses article metadata.
- **Behavior**: Generates a separate `FAQPage` JSON-LD object, linked via `mainEntityOfPage`.

### 5. Custom Type Mapping
- **Trigger**: `---` separator followed by YAML metadata (e.g., `type`, `schema`).
- **Properties**:
  - Defined by YAML metadata in the section.
  - Reuses main document metadata unless overridden.
- **Behavior**: Generates a new JSON-LD object, treated as a separate document.

### 6. Compatibility
- Renders normally in traditional renderers.
- YAML and `---` are ignored by non-YAML renderers.
- H2/H3 headers are standard Markdown.

### Formal Specification
#### Grammar (EBNF)
```
document        ::= yaml_front_matter? content (section_separator yaml_front_matter? content)*
yaml_front_matter ::= "---" NL yaml_content "---" NL
yaml_content    ::= (yaml_key_value NL)*
yaml_key_value  ::= key ":" WS (string | json_ld | yaml_array)
key             ::= "title" | "type" | "schema" | "base_url" | "date" | "author" | "publisher" | [A-Za-z]+ ("." [A-Za-z]+)* | "slug" | "keywords" | "categories" | "is_faq"
yaml_array      ::= "- " string (NL "- " string)*
json_ld         ::= "{" json_key_value ("," json_key_value)* "}"
json_key_value  ::= "\"" key "\"" ":" (string | url | json_ld | reference)
content         ::= (line | heading | paragraph | list | link)*
heading         ::= ("#" | "##" | "###") WS string NL
paragraph       ::= string NL
list            ::= ("-" | [0-9]+".") WS string NL
link            ::= "[" string "]" "(" url ")"
section_separator ::= "---" NL
string          ::= [^\n]+
url             ::= "http://" | "https://" | "mailto:" [^ \n]+
reference       ::= "#" [A-Za-z0-9_-]+
WS              ::= [ \t]*
NL              ::= "\n"
```

#### Parsing Algorithm
1. **Initialize**:
   - Set `defaultContext` to `https://schema.org`.
   - Set `defaultType` to `Article`.
   - Initialize `jsonLdList` for JSON-LD objects.
   - Set `baseUrl` (configurable, e.g., `https://www.iunera.com`).

2. **Parse YAML**:
   - Extract `title`, `type` (default `Article`), `schema` (default `https://schema.org`), `base_url`, `date`, `author`, `publisher`, `slug`, `keywords`, `categories`, `is_faq`.
   - Parse dot notation into nested JSON-LD.
   - Parse `author` as string, list, or JSON-LD.
   - Replace `slug` placeholder or use default.

3. **Detect Structure**:
   - Identify H1 for `name` or use file name.
   - Extract first paragraph for `description` or excerpt.
   - Concatenate paragraphs, lists, blockquotes for `articleBody`.
   - Check for H2 headers matching `FAQ` or `Frequently Asked Questions`.

4. **Infer Types**:
   - Use YAML `type` or `defaultType`.
   - Trigger `FAQPage` with H2 FAQ headers or `is_faq: true`.
   - Parse new sections after `---` with their own `type` and `schema`.

5. **Map Properties**:
   - Common: `name`, `description`, `url`, `keywords`, `about`.
   - Type-specific: `articleBody`, `mainEntity`.
   - Set `@context` from `schema` or `defaultContext`.
   - Reuse metadata or use defaults for secondary entities.

6. **Output**:
   - HTML: Render Markdown, embed JSON-LD in `<script>`.
   - JSON-LD: Array of objects with multiple `@context`.

