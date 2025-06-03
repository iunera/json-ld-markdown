# Extended Schema.org Markdown Annotation Format
A key challenge in exposing stuctured Json-LD data is the effort to create it. 
We think a key compontent how more semantic data can be exposed for ai training is a simple format howto annotate normal markdown text with stuctured data. 
 
## Overview
The **Extended Schema.org Markdown Annotation Format** is a proposal of a lightweight extension to Markdown, designed to embed additional Schema.org JSON-LD structured data inline within Markdown documents. It enables semantic tagging of text with Schema.org types for AI-driven applications like NLWeb’s conversational AI. The format supports standard Markdown hyperlinks, nested properties, and entity references. It is compatible with traditional Markdown renderers, which ignore annotations. Specialized renderers generates JSON-LD output for SEO and AI processing.

This document provides a detailed description of the syntax, formal specification, and examples, enabling developers and AI systems to create parsers or transformers for the format.

## Syntax Components

### 1. Vocabulary Definition
- **Purpose**: Specifies the JSON-LD context for all annotations in the document, defining the Schema.org vocabulary.
- **Syntax**: `@context: <url>` on a single line, typically at the document’s start.
  - `<url>`: A valid URL (e.g., `https://schema.org`).
  - Example: `@context: https://schema.org`.
- **Behavior**:
  - Sets the `@context` field for all JSON-LD objects generated from annotations.
  - Defaults to `https://schema.org` if absent.
  - Ignored by traditional Markdown renderers as a comment-like line, rendering as plain text in HTML (e.g., `<p>@context: https://schema.org</p>`).
- **Constraints**:
  - Only the first `@context` directive is used; subsequent ones are ignored.
  - The `<url>` must be a valid absolute URL starting with `http://` or `https://`.

### 2. Inline Annotation
- **Purpose**: Tags a word, phrase, or hyperlinked text with a Schema.org type and associated properties.
- **Syntax**:
  - **With Hyperlink**: `[text](url)@{Type,property1=value1,property2=value2}`
  - **Without Hyperlink**: `[text]@{Type,property1=value1,property2=value2}`
  - `<text>`: The text to annotate (e.g., `John Doe`, `NLWeb`), rendered as plain text or a hyperlink in HTML.
  - `<url>`: An optional URL for hyperlinks (e.g., `https://www.iunera.com/nlweb`), enclosed in parentheses.
  - `<Type>`: A Schema.org type (e.g., `Person`, `CreativeWork`, `SoftwareApplication`).
  - `<property=value>`: Comma-separated key-value pairs representing Schema.org properties (e.g., `givenName=John Doe`).
- **Name Inference**:
  - If the `name` property is not specified in the properties list, it is inferred from `<text>`.
  - Example: `[NLWeb]@{SoftwareApplication,softwareVersion=1.0}` infers `name=NLWeb`.
- **Behavior**:
  - Generates a JSON-LD object with `@context`, `@type`, and properties.
  - Traditional renderers:
    - Render `[text](url)` as `<a href="url">text</a>`.
    - Render `[text]` as plain text.
    - Treat `@{Type,...}` as plain text (e.g., `<p>NLWeb@{...}</p>`).
- **Constraints**:
  - `<Type>` must be a valid Schema.org type.
  - Properties must be valid for the type (e.g., `givenName` for `Person`).
  - Values are strings, URLs, or `#reference` for internal `@id`.
  - `<text>` cannot be empty; `<url>` must be a valid absolute URL if present.

### 3. Nested Properties (Dot Notation)
- **Purpose**: Defines nested Schema.org objects within an annotation (e.g., a `Person`’s `address` as a `PostalAddress`).
- **Syntax**: Use dot notation in property keys to specify nested properties (e.g., `address.streetAddress=value`).
  - Example: `[John Doe]@{Person,givenName=John Doe,address.streetAddress=123 Main St,address.addressLocality=Springfield}`.
- **Behavior**:
  - Creates nested JSON-LD objects, automatically inferring `@type` for known nested properties based on the parent type.
  - Mapping:
    - For `Person`, `address` → `{"@type": "PostalAddress"}`.
    - For other types, nested objects are plain unless explicitly defined.
  - Example JSON-LD:
    ```json
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "John Doe",
      "givenName": "John Doe",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Main St",
        "addressLocality": "Springfield"
      }
    }
    ```
- **Constraints**:
  - Nested properties are typically one level deep (e.g., `address.streetAddress`).
  - The parser infers `@type` only for predefined nested properties (e.g., `address` for `Person`).
  - Values must be strings, URLs, or `#reference`.

### 4. Entity References
- **Internal References**:
  - **Purpose**: Links entities within the same document to form a graph (e.g., a `Person` referencing a `CreativeWork` they created).
  - **Syntax**: Use `#reference` for the `@id` property or as a property value, where `reference` is a unique identifier (e.g., `#john-doe`, `#ai-training`).
    - Example: `[John Doe]@{Person,givenName=John Doe,@id=#john-doe,creator={@id=#ai-training}}`.
  - **Behavior**:
    - Assigns `@id` to entities for identification.
    - References other entities using `{@id: #reference}` in properties.
    - Generates JSON-LD with a graph structure, grouping entities in an array.
    - Example JSON-LD:
      ```json
      [
        {
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": "#john-doe",
          "name": "John Doe",
          "givenName": "John Doe",
          "creator": { "@id": "#ai-training" }
        },
        {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "@id": "#ai-training",
          "name": "AI Training Dataset"
        }
      ]
      ```
  - **Constraints**:
    - `reference` must be unique within the document (alphanumeric, hyphens, underscores).
    - Each `#reference` in a property must match an `@id` defined elsewhere in the document.
- **External References**:
  - **Purpose**: Links to external Schema.org entities (e.g., a dataset on a remote server).
  - **Syntax**: Use a URL as a property value (e.g., `relatedLink=https://data.iunera.com/nlweb`).
    - Example: `[NLWeb]@{SoftwareApplication,relatedLink=https://data.iunera.com/nlweb}`.
  - **Behavior**:
    - Generates JSON-LD with `{@id: url}` for the property.
    - Example JSON-LD:
      ```json
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "NLWeb",
        "relatedLink": { "@id": "https://data.iunera.com/nlweb" }
      }
      ```
  - **Constraints**:
    - URLs must start with `http://` or `https://`.
    - The referenced resource should be a valid Schema.org entity (not enforced by the parser).

### 5. Compatibility with Traditional Markdown Renderers
- **Behavior**:
  - **Vocabulary Definition**: `@context: <url>` is treated as plain text, rendering as `<p>@context: https://schema.org</p>`.
  - **Annotations**:
    - `[text](url)` renders as `<a href="url">text</a>`.
    - `[text]` renders as plain text (e.g., `<p>John Doe</p>`).
    - `@{Type,property=value}` is treated as plain text, rendering verbatim (e.g., `<p>NLWeb@{SoftwareApplication,...}</p>`).
  - **Ensured Compatibility**:
    - No special Markdown characters (e.g., `*`, `#`) are used in annotations, preventing parsing errors.
    - The syntax leverages square brackets and curly braces, which are safe in CommonMark and GitHub-Flavored Markdown.
    - Nested `[text](url)` within annotations (e.g., `[[NLWeb](url)]@{...}`) renders correctly as a link.

### Formal Specification for Parser/Transformer
The following specification enables an AI to create a parser or transformer for the format.

#### Grammar (EBNF)
```
document        ::= (context_directive? (line | annotation)*)
context_directive ::= "@context:" WS url NL
annotation       ::= "[" text "]" ("(" url ")")? "@{" type "," properties "}"
text            ::= ([^][] | "[" text "]")+
url             ::= "http://" | "https://" [^()]+
type            ::= [A-Za-z]+
properties      ::= property ("," property)*
property        ::= key "=" value
key             ::= [A-Za-z]+ ("." [A-Za-z]+)*
value           ::= #reference | url | string
#reference      ::= "#" [A-Za-z0-9_-]+
string          ::= [^,={}]+
WS              ::= [ \t]*
NL              ::= "\n"
```

#### Parsing Algorithm
1. **Initialize**:
   - Set `context` to `https://schema.org`.
   - Initialize an empty list `jsonLdList` for JSON-LD objects.

2. **Parse Context Directive**:
   - Scan the document’s first line for `@context: <url>`.
   - If found, set `context` to `<url>` and skip to the next line.
   - Ignore subsequent `@context` directives.

3. **Parse Annotations**:
   - Use a regular expression to match `[text](url)@{Type,property1=value1,...}` or `[text]@{Type,property1=value1,...}`:
     ```
     \[([^\]]*?)\](?:\(([^)]+)\))?@\{([^}]+)\}
     ```
   - For each match:
     - Extract `text`, `url` (optional), `Type`, and `properties`.
     - Create a JSON-LD object:
       - Set `@context` to `context`.
       - Set `@type` to `Type`.
       - If `name` is not in `properties`, set `name=text`.
     - Parse `properties`:
       - Split by commas to get `key=value` pairs.
       - For each pair:
         - Split `key` by dots (e.g., `address.streetAddress` → `["address", "streetAddress"]`).
         - Create nested objects, setting `@type` for known properties (e.g., `address` → `PostalAddress` for `Person`).
         - If `value` starts with `#`, set `{@id: value}`.
         - If `value` is a URL (starts with `http://` or `https://`), set `{@id: value}`.
         - Otherwise, set `value` as a string.
     - Add the object to `jsonLdList`.

4. **Validate**:
   - Check `Type` against a predefined Schema.org type list (e.g., `Person`, `CreativeWork`).
   - Warn if required properties (e.g., `name`) are missing (optional).
   - Ensure each `#reference` in properties matches an `@id` in `jsonLdList`.

5. **Output**:
   - **HTML**: Render `[text](url)` as `<a>`, `[text]` as text, and embed `jsonLdList` as `<script type="application/ld+json">` tags.
   - **JSON-LD**: Return `jsonLdList` as a JSON array.
   - **Java Objects**: Map `jsonLdList` to `com.iunera.jsonldjava.schemaorg.metadatatypes` classes using `FieldMapper`.

### Example Markdown Document
Below is an example Markdown document illustrating the format’s complete operation, including vocabulary definition, annotations with and without hyperlinks, nested properties, and internal/external references. It’s designed for an Iunera blog post or NLWeb documentation.

```markdown
EXTEND TO BE a complete article
@context: https://schema.org

# Semantic Data for NLWeb

At [Iunera](https://www.iunera.com/) we use [NLWeb](https://www.iunera.com/kraken/category/nlweb/)@{SoftwareApplication,softwareVersion=1.0,license=https://opensource.org/licenses/MIT,relatedLink=https://github.com/microsoft/NLWeb} to power conversational AI with structured data. The extended schema markdown for Json-LD alloes us to Tag entities like [Iunera]@{Organization,name=Iunera,url=https://www.iunera.com/,@id=#iunera},address.streetAddress=Altrottstraße 31,address.addressLocality=Walldorf,address.postalCode=69190,telephone=+49 6227 381350,openingHours=Monday 09:00-17:00}.

The founders of [iunera]@ADDREFERENCEToIUNERA also created solutions for [licensing open software and AI training data](https://license-token.com)@{CreativeWork,keywords=AI;machine learning,license=https://github.com/open-compensation-token-license/license/blob/main/LICENSE.md@id=#ai-training -- add here the authors Dr. tim Frey and christian schmitt} in a more sustainable way.

*Published on May 31, 2025*
```

### Example JSON-LD Output
The document generates the following JSON-LD when processed by a parser (e.g., updated `markdown-it-schemaorg`):

```json
show the complete article outout
```

