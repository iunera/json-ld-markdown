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
- **Description**: Taken from YAML `description`, the first paragraph, or a 200-character excerpt if no distinct paragraph is found.
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
   - `--description <string>`: Set description text; overrides YAML or inferred description.

2. **Default Values**:
   - **Type**: `Article` if not specified.
   - **Schema**: `https://schema.org` if not specified.
   - **Author**: Configurable default (e.g., `["Unknown Author"]`) or empty.
   - **Publisher**: Configurable default (e.g., `{"@type": "Organization", "name": "Unknown Publisher", "@id": "https://example.com"}`).
   - **Date**: Current date (e.g., `2025-06-01`) or empty.
   - **Base URL**: Configurable default (e.g., `https://www.iunera.com/blog/`) with `{{filename}}` for URL generation.
   - **Keywords**, **Categories**: Empty lists if not specified.
   - **Description**: First 200 characters of the article body if not specified.

3. **Empty Fields**:
   - Fields like `keywords`, `categories`, `author`, `publisher`, `description`, and `date` can be omitted, resulting in empty or null values in JSON-LD where Schema.org allows (e.g., `keywords: []`, `author: null`).

## How It Works: Abstract Level

The transformation converts non-annotated Markdown into JSON-LD by analyzing YAML front matter and document structure, or inferring minimal metadata for plain Markdown. Key components include:

1. **YAML Front Matter**: Defines metadata such as type, schema, author(s), publisher, keywords, categories, description, and URL template. If absent, defaults or transformer options apply.
2. **Document Structure**: Maps Markdown elements to JSON-LD:
   - H1 headers set the `name`.
   - First paragraph or YAML `description` sets the `description`.
   - Paragraphs, lists, and blockquotes form the `articleBody`.
   - H2 headers like `FAQ` or `Frequently Asked Questions` trigger a `FAQPage`.
3. **Table Extraction**: Markdown tables are extracted and mapped to Schema.org `Table` or `Dataset` types. The transformer analyzes headers and content to classify tables as:
   - **Pricing**: Contains price-related terms (e.g., `price`, `$`, `€`) or plan names; mapped to `Table` with `PriceSpecification`.
   - **Comparison**: Includes comparison terms (e.g., `vs`, `feature`, `✓`, `✗`); mapped to `Table` with feature descriptions.
   - **Specification**: Contains technical terms (e.g., `spec`, `property`, `value`); mapped to `Table` with `Product` properties.
   - **Listing**: Lists items or organizations (e.g., `name`, `company`); mapped to `Table` with directory entries.
   - **Dataset**: Large tables with numeric data (e.g., `metric`, `count`); mapped to `Dataset` with statistical summaries.
4. **List Extraction**: Ordered and unordered lists are mapped to `ItemList` with `ListItem` elements, capturing item text and position.
5. **Link Extraction**: Non-annotated links are mapped to `WebPage`, `SoftwareSourceCode` (e.g., GitHub URLs), `VideoObject` (e.g., YouTube), `DigitalDocument` (e.g., PDFs), or `ImageObject` (e.g., images), included as `mentions`.
6. **Section Extraction**: H2 and higher headers are mapped to `WebPageElement`, representing article sections with `name`, `text`, and `cssSelector`.
7. **FAQ Handling**: FAQ sections are identified by an H2 header (`FAQ`, `Frequently Asked Questions`, case-insensitive, with optional trailing text) or `is_faq: true` in YAML for standalone FAQs. FAQs in articles generate a linked `FAQPage`, reusing article metadata.
8. **Extendable Types**: A `---` separator defines new JSON-LD sections, each with its own type and schema, reusing main article metadata unless overridden.
9. **Metadata Reuse**: Secondary entities (e.g., `FAQPage`, `Table`, `ItemList`) inherit metadata from the main article.
10. **Links**: `mailto` links are transformed into `email` properties.

The transformer uses configuration options to ensure flexibility, producing valid JSON-LD for any Markdown input.

## How It Works: Example-Based Explanation

Below, we use an example article on **License Token: Pioneering Fair Code and Combating Open Source Exploitation** to illustrate the transformation, followed by variants showing default behavior and minimal Markdown.

### Example Markdown Document (With Type and Schema)
```markdown
---
type: Article
schema: https://schema.org
base_url: https://www.iunera.com/blog/
date: 2025-06-01
author:
  - Dr. Tim Frey
  - Christian Schmitt
publisher:
  name: Iunera
  url: https://www.iunera.com/
  id: https://www.iunera.com
  address:
    type: PostalAddress
    streetAddress: Altrottstraße 31
    addressLocality: Walldorf
    postalCode: 69190
  telephone: +49 6227 381350
slug: license-token-fair-code
keywords:
  - open source
  - fair code
  - license token
  - blockchain
  - AI
categories:
  - Technology
  - Software Licensing
  - Blockchain Innovation
description: Revolutionizing open source with the License Token model, tackling exploitation via blockchain.
---

# License Token: Pioneering Fair Code and Combating Open Source Exploitation

[Iunera](https://www.iunera.com/)@{Organization,name=Iunera,@id=#iunera} is revolutionizing open source software with the **License Token** model, specifically the [Open Compensation Token License (OCTL)](https://github.com/open-compensation-token-license/octl)@{CreativeWork,license=https://github.com/open-compensation-token-license/octl/blob/main/LICENSE.md,@id=#octl}. This article explores how OCTL tackles exploitation, promotes fair code principles, and leverages blockchain and AI for a sustainable developer ecosystem.

## The Open Source Exploitation Crisis

Open source software powers 90% of modern applications, from cloud platforms to AI models. Yet, a 2025 study reveals 70% of maintainers receive no financial support, despite corporate exploitation. This imbalance causes burnout, underfunded projects, and vulnerabilities like Heartbleed (2014). Without change, open source sustainability is at risk.

## OCTL License Comparison

| License Type | Revenue Model | Usage Tracking | Fair Compensation |
|--------------|---------------|----------------|-------------------|
| MIT/GPL      | None          | No             | No                |
| Commercial   | Fixed Fee     | Limited        | Partial           |
| OCTL         | NFT Royalties | Blockchain     | Yes               |

## How OCTL Works

1. License Creation: Developers mint an OCTL NFT with royalty terms.
2. Code Usage: Enterprises register usage.
3. Distribution: Smart contracts distribute royalties.

## Frequently Asked Questions

### What is OCTL?
A blockchain-based license ensuring fair compensation via NFT royalties.

### How does OCTL prevent exploitation?
NFTs and smart contracts track usage, requiring royalties.
```

### Transformation Process
1. **YAML Parsing**:
   - `type: Article` and `schema: https://schema.org` define a Schema.org `Article`.
   - `author: [Dr. Tim Frey, Christian Schmitt]` maps to multiple `Person` objects.
   - `publisher` generates nested JSON-LD with `@id: https://www.iunera.com`.
   - `base_url` and `slug` form the URL.
   - `keywords` and `categories` map to `keywords` and `about`.
   - `description` is taken from YAML.
2. **Main Article**:
   - H1 sets `name`.
   - YAML `description` sets `description`.
   - Content forms `articleBody`.
3. **Table Extraction**:
   - The table under `OCTL License Comparison` is classified as a comparison table (due to terms like `License Type`, `Fair Compensation`) and mapped to a `Table` with feature descriptions.
4. **List Extraction**:
   - The ordered list under `How OCTL Works` is mapped to an `ItemList` with three `ListItem` elements.
5. **FAQ Section**:
   - Triggered by `## Frequently Asked Questions`, generating a `FAQPage` with `Question` objects.
   - Reuses article metadata.
6. **Link Extraction**:
   - Links like `[Iunera](https://www.iunera.com/)` and `[OCTL](https://github.com/.../octl)` are mapped to `WebPage` and `SoftwareSourceCode`, included as `mentions`.
7. **Section Extraction**:
   - H2 headers (e.g., `The Open Source Exploitation Crisis`) are mapped to `WebPageElement` with `name`, `text`, and `cssSelector`.
8. **Output**:
   - Multiple JSON-LD objects: `Article`, `FAQPage`, `Table`, `ItemList`, `WebPageElement`, and link entities.

### Example Without Type, Schema, or YAML
```markdown
# License Token: Pioneering Fair Code and Combating Open Source Exploitation

[... rest of the content identical to the first example, without FAQ or YAML ...]
```

### Transformation Process (Minimal Markdown)
- **No YAML**: Infers metadata:
  - `type`: `Article`.
  - `schema`: `https://schema.org`.
  - `name`: From H1.
  - `description`: First 200 characters of the article body.
  - `articleBody`: All content.
  - `url`: Default base URL with filename.
  - `author`, `publisher`, `date`, `keywords`, `categories`: Defaults or empty.
- **Table and List Extraction**: Tables and lists are still extracted and mapped to `Table` and `ItemList`.
- **Section Extraction**: H2 headers are mapped to `WebPageElement`.
- **Link Extraction**: Links are mapped to appropriate types.
- **Output**: `Article`, `Table`, `ItemList`, `WebPageElement`, and link entities.

### Prompt for Compliant Markdown Articles
To ensure generated Markdown articles produce compliant JSON-LD when processed by the **markdown-to-structured-jsonld** transformer, include the following directive in your article generation prompts:

```
Generate a Markdown article compliant with the markdown-to-structured-jsonld project’s Default Markdown to Structured JSON-LD Transformation. Include:

1. **YAML Front Matter**:
   - `type`: A Schema.org type (e.g., `Article`, `NewsArticle`); omit to default to `Article`.
   - `schema`: A schema URL (e.g., `https://schema.org`); omit to default to `https://schema.org`.
   - `base_url`: Set to `https://www.iunera.com/blog/` for dynamic URL generation.
   - `date`: Current date in ISO 8601 format (e.g., `2025-06-01`).
   - `author`: A list of author names (e.g., `[Author One, Author Two]`) or JSON-LD.
   - `publisher.name`: Publisher name (e.g., `Iunera`).
   - `publisher.url`: Publisher URL (e.g., `https://www.iunera.com/`).
   - `publisher.id`: Publisher identifier (e.g., `https://www.iunera.com`).
   - `publisher.address.type`: `PostalAddress`.
   - `publisher.address.streetAddress`, `publisher.address.addressLocality`, `publisher.address.postalCode`: Address details.
   - `publisher.telephone`: Contact number.
   - `slug`: A unique identifier for the article (e.g., `license-token-fair-code`).
   - `keywords`: List of relevant keywords; optional.
   - `categories`: List of categories as topics; optional.
   - `description`: A 200-character summary of the article; optional.

2. **Content Structure**:
   - Include an H1 header for the article title.
   - Use standard Markdown for paragraphs, lists, tables, and links.
   - Include a FAQ section with an H2 header named `FAQ` or `Frequently Asked Questions`.
   - Use H3 headers for FAQ questions, followed by answer paragraphs.
   - Optionally include tables for pricing, comparison, specifications, listings, or datasets.
   - Optionally include ordered or unordered lists for procedures or items.

Ensure the Markdown is compatible with traditional renderers, uses standard syntax, and produces valid Schema.org JSON-LD when processed by the markdown-to-structured-jsonld transformer.
```

### Purpose of the Prompt
This prompt ensures that generated Markdown articles adhere to the transformation rules of the **markdown-to-structured-jsonld** project, producing valid JSON-LD output. It enforces a consistent structure with YAML front matter, article content, an FAQ section, and optional tables and lists, while allowing flexibility (e.g., omitting `type`, `schema`, `keywords`, `categories`, or `description` for defaults). The prompt guarantees compatibility with traditional Markdown renderers and supports semantic data extraction for NLWeb’s AI applications, even for minimal Markdown files.

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
  description: <string>
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
  - `description`: Maps to `description`; optional, defaults to article body excerpt.
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
  - `description`: YAML `description`, first paragraph, or 200-character excerpt.
  - `url`: YAML `base_url` with `slug`, or default base URL with filename.
  - `@context`: YAML `schema` or `https://schema.org`.
  - `author`, `publisher`, `datePublished`, `keywords`, `about`: From YAML, transformer defaults, or empty.

### 3. Article Mapping
- **Type**: `Article` or specified type
- **Trigger**: YAML `type` or H1 with paragraphs.
- **Properties**:
  - `name`: YAML `title` or H1.
  - `description`: YAML `description` or excerpt.
  - `articleBody`: Concatenated paragraphs, lists, blockquotes.
  - `datePublished`: YAML `date` or default.
  - `author`, `publisher`: From YAML, defaults, or empty.
  - `url`: Generated from `base_url` and `slug`.
  - `keywords`, `about`: From YAML or empty.
  - `hasPart`: Includes tables, lists, and sections.
  - `mentions`: Includes extracted links.

### 4. FAQPage Mapping
- **Type**: `FAQPage`
- **Trigger**:
  - H2 header matching `FAQ` or `Frequently Asked Questions` (case-insensitive, optional trailing text).
  - YAML `is_faq: true` for standalone FAQs.
- **Properties**:
  - `name`: Article `name` with “FAQ: ” prefix, or YAML `title`.
  - `mainEntity`: `Question` objects from H3 headers and paragraphs.
  - `url`: Article URL or generated from `base_url`.
  - Reuses article metadata.
- **Behavior**: Generates a separate `FAQPage` JSON-LD object, linked via `mainEntityOfPage`.

### 5. Table Mapping
- **Type**: `Table` or `Dataset`
- **Trigger**: Markdown table syntax (`| ... |`).
- **Properties**:
  - `name`: Auto-generated (e.g., `Table 1`) or from preceding header.
  - `description`: Based on table type (pricing, comparison, etc.).
  - `text`: Summarized table content (headers and sample rows).
  - `about`: Contextual type (e.g., `PriceSpecification`, `Product`) for specific table types.
- **Behavior**: Included in `hasPart` for articles or as standalone entities.

### 6. List Mapping
- **Type**: `ItemList`
- **Trigger**: Ordered (`1.`) or unordered (`-`, `*`, `+`) lists.
- **Properties**:
  - `name`: Auto-generated (e.g., `Bulleted List 1`).
  - `itemListElement`: Array of `ListItem` with `name` and `position`.
  - `numberOfItems`: Count of items.
- **Behavior**: Included as separate entities.

### 7. Link Mapping
- **Types**: `WebPage`, `SoftwareSourceCode`, `VideoObject`, `DigitalDocument`, `ImageObject`
- **Trigger**: `[text](url)` syntax with HTTP URLs.
- **Properties**:
  - `name`: Link text.
  - `url`, `@id`: URL.
- **Behavior**: Included as `mentions`.

### 8. Section Mapping
- **Type**: `WebPageElement`
- **Trigger**: H2+ headers.
- **Properties**:
  - `name`: Header text.
  - `text`: Section content.
  - `cssSelector`: Generated ID.
- **Behavior**: Included in `hasPart`.

### 9. Custom Type Mapping
- **Trigger**: `---` separator followed by YAML metadata (e.g., `type`, `schema`).
- **Properties**:
  - Defined by YAML metadata in the section.
  - Reuses main document metadata unless overridden.
- **Behavior**: Generates a new JSON-LD object.

### 10. Compatibility
- Renders normally in traditional Markdown renderers.
- YAML and `---` are ignored by non-YAML renderers.
- H2/H3 headers, tables, and lists are standard Markdown.

### Formal Specification
#### Grammar (EBNF)
```
document        ::= yaml_front_matter? content (section_separator yaml_front_matter? content)*
yaml_front_matter ::= "---" NL yaml_content "---" NL
yaml_content    ::= (yaml_key_value NL)*
yaml_key_value  ::= key ":" WS (string | json_ld | yaml_array)
key             ::= "title" | "type" | "schema" | "base_url" | "date" | "author" | "publisher" | [A-Za-z]+ ("." [A-Za-z]+)* | "slug" | "keywords" | "categories" | "is_faq" | "description"
yaml_array      ::= "- " string (NL "- " string)*
json_ld         ::= "{" json_key_value ("," json_key_value)* "}"
json_key_value  ::= "\"" key "\"" ":" (string | url | json_ld | reference)
content         ::= (line | heading | paragraph | list | table | link)*
heading         ::= ("#" | "##" | "###") WS string NL
paragraph       ::= string NL
list            ::= ("-" | [0-9]+".") WS string NL
table           ::= table_row (NL table_row)*
table_row       ::= "|" (WS string WS "|")+
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
   - Extract `title`, `type` (default `Article`), `schema` (default `https://schema.org`), `base_url`, `date`, `author`, `publisher`, `slug`, `keywords`, `categories`, `is_faq`, `description`.
   - Parse dot notation into nested JSON-LD.
   - Parse `author` as string, list, or JSON-LD.
   - Replace `slug` placeholder or use default.

3. **Detect Structure**:
   - Identify H1 for `name` or use file name.
   - Extract YAML `description`, first paragraph, or 200-character excerpt for `description`.
   - Concatenate paragraphs, lists, blockquotes for `articleBody`.
   - Check for H2 headers matching `FAQ` or `Frequently Asked Questions`.
   - Identify tables, lists, and links.

4. **Infer Types**:
   - Use YAML `type` or `defaultType`.
   - Trigger `FAQPage` with H2 FAQ headers or `is_faq: true`.
   - Map tables to `Table` or `Dataset` based on content analysis.
   - Map lists to `ItemList`.
   - Map links to appropriate types.
   - Map sections to `WebPageElement`.
   - Parse new sections after `---` with their own `type` and `schema`.

5. **Map Properties**:
   - Common: `name`, `description`, `url`, `keywords`, `about`.
   - Type-specific: `articleBody`, `mainEntity`, `hasPart`, `mentions`.
   - Set `@context` from `schema` or `defaultContext`.
   - Add tables to `hasPart` or as standalone `Table`/`Dataset`.
   - Add lists as `ItemList`.
   - Add links as `mentions`.
   - Add sections to `hasPart` as `WebPageElement`.
   - Reuse metadata or use defaults for secondary entities.

6. **Output**:
   - HTML: Render Markdown, embed JSON-LD in `<script>`.
   - JSON-LD: Array of objects with multiple `@context`.


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

