// UI Controller
import { Config } from './config.js';
import { EnhancedMarkdownParser } from './enhanced-markdown-parser.js';
import { JsonLDTransformer } from './json-ld-transformer.js';

export class UIController {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setDefaultDate();
        this.updateTransformation();
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
    }

    initializeElements() {
        this.markdownInput = document.getElementById('markdownInput');
        this.output = document.getElementById('output');
        this.typeInput = document.getElementById('type');
        this.authorInput = document.getElementById('author');
        this.publisherNameInput = document.getElementById('publisherName');
        this.publisherUrlInput = document.getElementById('publisherUrl');
        this.baseUrlInput = document.getElementById('baseUrl');
        this.slugInput = document.getElementById('slug');
        this.dateInput = document.getElementById('date');
        this.categoriesInput = document.getElementById('categories');
        this.descLengthInput = document.getElementById('descLength');
        this.copyButton = document.getElementById('copyButton');
        this.formatButton = document.getElementById('formatButton');
        this.loadSampleButton = document.getElementById('loadSample');
        this.loadHowToSampleButton = document.getElementById('loadHowToSample');
        this.loadTableSampleButton = document.getElementById('loadTableSample');
        this.charCount = document.getElementById('charCount');
        this.outputInfo = document.getElementById('outputInfo');
        
        this.annotationCount = document.getElementById('annotationCount');
        this.faqCount = document.getElementById('faqCount');
        this.sectionCount = document.getElementById('sectionCount');
        this.entityCount = document.getElementById('entityCount');
        
        this.inputStatus = document.getElementById('inputStatus');
        this.outputStatus = document.getElementById('outputStatus');
    }

    setupEventListeners() {
        const debounce = (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), wait);
            };
        };

        const inputs = [
            this.markdownInput, this.typeInput, this.authorInput,
            this.publisherNameInput, this.publisherUrlInput, this.baseUrlInput,
            this.slugInput, this.dateInput, this.categoriesInput, this.descLengthInput
        ].filter(input => input !== null);

        inputs.forEach(input => {
            if (input) {
                input.addEventListener('input', debounce(() => this.updateTransformation(), 150));
                input.addEventListener('change', () => this.updateTransformation());
            }
        });

        if (this.markdownInput) {
            this.markdownInput.addEventListener('input', () => this.updateCharCount());
        }
        if (this.copyButton) {
            this.copyButton.addEventListener('click', () => this.copyToClipboard());
        }
        if (this.formatButton) {
            this.formatButton.addEventListener('click', () => this.formatOutput());
        }
        if (this.loadSampleButton) {
            this.loadSampleButton.addEventListener('click', () => this.loadSampleContent());
        }
        if (this.loadHowToSampleButton) {
            this.loadHowToSampleButton.addEventListener('click', () => this.loadHowToSample());
        }
        if (this.loadTableSampleButton) {
            this.loadTableSampleButton.addEventListener('click', () => this.loadTableSample());
        }
    }

    updateCharCount() {
        if (this.charCount && this.markdownInput && this.markdownInput.value !== undefined) {
            this.charCount.textContent = this.markdownInput.value.length.toLocaleString();
        }
    }

    updateTransformation() {
        try {
            const markdown = (this.markdownInput && this.markdownInput.value) ? this.markdownInput.value : "";
            
            if (!markdown.trim()) {
                if (this.output) this.output.textContent = '// Enter markdown content to see JSON-LD output';
                this.setStatus(this.outputStatus, 'success');
                this.updateStats(0, 0, 0, 0);
                this.clearUIFields();
                return;
            }

            this.populateUIFromYAML(markdown);
            const config = this.buildConfig();
            const result = JsonLDTransformer.transform(markdown, config);
            
            const parser = new EnhancedMarkdownParser();
            const annotations = parser.extractAnnotations(markdown);
            const faqQuestions = parser.extractFaqQuestions(markdown);
            const sections = parser.extractSections(markdown);
            const tables = parser.extractTables(markdown);
            const lists = parser.extractLists(markdown);
            const links = parser.extractLinks(markdown);
            const wordCount = this.countWords(markdown);
            
            this.updateStats(annotations.length, faqQuestions.length, result.length, wordCount);
            
            if (this.output) {
                this.output.textContent = JSON.stringify(result, null, 2);
                if (window.hljs) {
                    window.hljs.highlightElement(this.output);
                }
            }
            
            if (this.outputInfo) {
                this.outputInfo.textContent = `Generated ${result.length} JSON-LD entities`;
            }
            this.setStatus(this.outputStatus, 'success');
            this.setStatus(this.inputStatus, 'success');
            
        } catch (error) {
            if (this.output) {
                this.output.textContent = `Error: ${error.message}\n\nStack trace:\n${error.stack}`;
            }
            if (this.outputInfo) {
                this.outputInfo.textContent = 'Error occurred during transformation';
            }
            this.setStatus(this.outputStatus, 'error');
            console.error('Transformation error:', error);
        }
    }

    clearUIFields() {
        if (this.authorInput && this.authorInput.value !== undefined) this.authorInput.value = "";
        if (this.publisherNameInput && this.publisherNameInput.value !== undefined) this.publisherNameInput.value = "";
        if (this.publisherUrlInput && this.publisherUrlInput.value !== undefined) this.publisherUrlInput.value = "";
        if (this.baseUrlInput && this.baseUrlInput.value !== undefined) this.baseUrlInput.value = "";
        if (this.slugInput && this.slugInput.value !== undefined) this.slugInput.value = "";
        if (this.categoriesInput && this.categoriesInput.value !== undefined) this.categoriesInput.value = "";
        if (this.typeInput && this.typeInput.value !== undefined) this.typeInput.value = "Article";
    }

    populateUIFromYAML(markdown) {
        const parser = new EnhancedMarkdownParser();
        const metadata = parser.extractMetadata(markdown);
        
        if (!metadata || Object.keys(metadata).length === 0) {
            return;
        }

        if (this.typeInput && this.typeInput.value !== undefined && (!this.typeInput.value || this.typeInput.value === "Article")) {
            this.typeInput.value = metadata.type || "Article";
        }
        
        if (this.authorInput && this.authorInput.value !== undefined && !this.authorInput.value.trim()) {
            if (metadata.author && Array.isArray(metadata.author)) {
                this.authorInput.value = metadata.author.join(', ');
            }
        }
        
        if (this.publisherNameInput && this.publisherNameInput.value !== undefined && !this.publisherNameInput.value.trim()) {
            if (metadata.publisher && metadata.publisher.name) {
                this.publisherNameInput.value = metadata.publisher.name;
            }
        }
        
        if (this.publisherUrlInput && this.publisherUrlInput.value !== undefined && !this.publisherUrlInput.value.trim()) {
            if (metadata.publisher && metadata.publisher.url) {
                this.publisherUrlInput.value = metadata.publisher.url;
            }
        }
        
        if (this.baseUrlInput && this.baseUrlInput.value !== undefined && !this.baseUrlInput.value.trim()) {
            if (metadata.base_url) {
                this.baseUrlInput.value = metadata.base_url;
            }
        }
        
        if (this.slugInput && this.slugInput.value !== undefined && !this.slugInput.value.trim()) {
            if (metadata.slug) {
                this.slugInput.value = metadata.slug;
            }
        }
        
        if (this.dateInput && this.dateInput.value !== undefined && !this.dateInput.value) {
            if (metadata.date) {
                this.dateInput.value = metadata.date;
            }
        }
        
        if (this.categoriesInput && this.categoriesInput.value !== undefined && !this.categoriesInput.value.trim()) {
            if (metadata.categories && Array.isArray(metadata.categories)) {
                this.categoriesInput.value = metadata.categories.join(', ');
            }
        }
    }

    buildConfig() {
        const markdown = this.markdownInput && this.markdownInput.value ? this.markdownInput.value : "";
        const parser = new EnhancedMarkdownParser();
        const metadata = parser.extractMetadata(markdown);

        let authors;
        const uiAuthors = this.authorInput && this.authorInput.value
            ? this.authorInput.value.split(',').map(a => a.trim()).filter(a => a)
            : [];
        
        if (uiAuthors.length > 0) {
            authors = uiAuthors;
        } else if (metadata.author && Array.isArray(metadata.author)) {
            authors = metadata.author;
        } else {
            authors = Config.DEFAULT_AUTHOR;
        }

        const publisherName = this.publisherNameInput && this.publisherNameInput.value
            ? this.publisherNameInput.value
            : (metadata.publisher && metadata.publisher.name) || Config.DEFAULT_PUBLISHER.name;
        
        const publisherUrl = this.publisherUrlInput && this.publisherUrlInput.value
            ? this.publisherUrlInput.value
            : (metadata.publisher && metadata.publisher.url) || Config.DEFAULT_PUBLISHER.url;

        const publisher = {
            '@type': 'Organization',
            name: publisherName,
            url: publisherUrl,
            '@id': (metadata.publisher && metadata.publisher.id) || publisherUrl
        };

        if (metadata.publisher && metadata.publisher.address) {
            publisher.address = {
                '@type': 'PostalAddress',
                streetAddress: metadata.publisher.address.streetAddress || '',
                addressLocality: metadata.publisher.address.addressLocality || '',
                postalCode: metadata.publisher.address.postalCode || ''
            };
        }
        if (metadata.publisher && metadata.publisher.telephone) {
            publisher.telephone = metadata.publisher.telephone;
        }

        return new Config({
            type: (this.typeInput && this.typeInput.value) || metadata.type || Config.DEFAULT_TYPE,
            author: authors,
            publisher: publisher,
            baseUrl: (this.baseUrlInput && this.baseUrlInput.value) || metadata.base_url || Config.DEFAULT_BASE_URL,
            date: (this.dateInput && this.dateInput.value) || metadata.date || Config.DEFAULT_DATE,
            slug: (this.slugInput && this.slugInput.value) || metadata.slug || Config.DEFAULT_SLUG,
            keywords: metadata.keywords || Config.DEFAULT_KEYWORDS,
            categories: (this.categoriesInput && this.categoriesInput.value)
                ? this.categoriesInput.value.split(',').map(c => c.trim()).filter(c => c)
                : metadata.categories || Config.DEFAULT_CATEGORIES,
            descriptionLength: parseInt(this.descLengthInput && this.descLengthInput.value) || Config.DEFAULT_DESCRIPTION_LENGTH
        });
    }

    updateStats(annotations, faqs, entities, words) {
        const parser = new EnhancedMarkdownParser();
        const markdownValue = (this.markdownInput && this.markdownInput.value) ? this.markdownInput.value : "";
        const sections = parser.extractSections(markdownValue);
        const tables = parser.extractTables(markdownValue);
        const lists = parser.extractLists(markdownValue);
        
        if (this.annotationCount) this.annotationCount.textContent = annotations;
        if (this.faqCount) this.faqCount.textContent = faqs;
        if (this.sectionCount) this.sectionCount.textContent = sections.length;
        if (this.entityCount) this.entityCount.textContent = entities;
        
        const tableCountElement = document.getElementById('tableCount');
        const listCountElement = document.getElementById('listCount');
        
        if (tableCountElement) tableCountElement.textContent = tables.length;
        if (listCountElement) listCountElement.textContent = lists.length;
    }

    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    setStatus(element, status) {
        if (element) {
            element.className = `status-indicator status-${status}`;
        }
    }

    copyToClipboard() {
        if (this.output && this.output.textContent) {
            navigator.clipboard.writeText(this.output.textContent)
                .then(() => {
                    this.showNotification('JSON-LD copied to clipboard!', 'success');
                })
                .catch(() => {
                    this.showNotification('Failed to copy to clipboard', 'error');
                });
        }
    }

    formatOutput() {
        try {
            if (this.output && this.output.textContent) {
                const parsed = JSON.parse(this.output.textContent);
                this.output.textContent = JSON.stringify(parsed, null, 2);
                if (window.hljs) {
                    window.hljs.highlightElement(this.output);
                }
            }
        } catch (error) {
            this.showNotification('Invalid JSON format', 'error');
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 fade-in ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    loadSampleContent() {
        const sampleMarkdown = `---
type: "Article"
schema: "https://schema.org"
base_url: "https://www.iunera.com/blog/"
date: "2025-06-01"
author:
  - Christian Schmitt
  - Dr. Tim Frey
publisher:
  name: Iunera
  url: "https://www.iunera.com/"
  id: "https://www.iunera.com"
  address:
    type: PostalAddress
    streetAddress: "Altrottstraße 31"
    addressLocality: Walldorf
    postalCode: "69190"
  telephone: "+49 6227 381350"
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
---

# License Token: Pioneering Fair Code and Combating Open Source Exploitation

At [Iunera](https://www.iunera.com/)@{Organization,name=Iunera,@id=#iunera}, we are revolutionizing open source software with the **License Token** model, specifically the [Open Compensation Token License (OCTL)](https://github.com/open-compensation-token-license/octl)@{CreativeWork,license=https://github.com/open-compensation-token-license/octl/blob/main/LICENSE.md,@id=#octl}. This article explores how OCTL tackles exploitation through innovative blockchain technology.

## Understanding the Problem

Traditional open source licenses fail to ensure fair compensation for developers. Key issues include:

- Lack of revenue mechanisms for creators
- Corporate exploitation without giving back
- Unsustainable development models
- No tracking of actual usage and value

## OCTL License Comparison

| License Type | Revenue Model | Usage Tracking | Fair Compensation |
|--------------|---------------|----------------|-------------------|
| MIT/GPL      | None          | No             | No                |
| Commercial   | Fixed Fee     | Limited        | Partial           |
| OCTL         | NFT Royalties | Blockchain     | Yes               |

## Implementation Benefits

The OCTL solution provides several advantages:

1. **Automated royalty distribution** through smart contracts
2. **Transparent usage tracking** via blockchain technology  
3. **Sustainable developer income** from ongoing usage
4. **Community-driven governance** for license parameters

Visit the [OCTL GitHub repository](https://github.com/open-compensation-token-license/octl) for detailed implementation guides and source code access.

## Frequently Asked Questions

### What is OCTL?
A blockchain-based license ensuring fair compensation via NFT royalties and smart contract automation.

### How does OCTL prevent exploitation?
NFTs and smart contracts track usage, requiring automatic royalty payments to developers based on actual usage metrics.

### Which blockchains are supported?
Currently supports Ethereum, Polygon, and other EVM-compatible networks with plans for multi-chain expansion.

--- end of article`;

        this.clearUIFields();
        if (this.markdownInput && this.markdownInput.value !== undefined) {
            this.markdownInput.value = sampleMarkdown;
        }
        this.updateCharCount();
        this.updateTransformation();
    }

    loadHowToSample() {
        const howToMarkdown = `---
type: "HowTo"
schema: "https://schema.org"
base_url: "https://www.iunera.com/guides/"
date: "2025-06-01"
author:
  - Technical Team
publisher:
  name: Iunera
  url: "https://www.iunera.com/"
  id: "https://www.iunera.com"
slug: how-to-implement-octl
keywords:
  - implementation
  - license
  - blockchain
  - tutorial
categories:
  - Tutorial
  - Implementation
  - Blockchain
---

# How to Implement OCTL in Your Project

Learn how to integrate the Open Compensation Token License into your software project for fair compensation.

## Prerequisites

Before starting, ensure you have the following requirements:

- Node.js version 16 or higher
- Access to an Ethereum-compatible blockchain
- Basic understanding of smart contracts
- Git for version control

## Supported Networks

| Network | Chain ID | Gas Cost | Recommended |
|---------|----------|----------|-------------|
| Ethereum | 1 | High | Production |
| Polygon | 137 | Low | Development |
| Arbitrum | 42161 | Medium | Scaling |

## Prepare Your Environment

First, set up your development environment with the necessary tools and dependencies.

1. Install Node.js and npm
2. Clone the OCTL repository
3. Install project dependencies
4. Configure environment variables

## Configure the License

Download the OCTL template and customize it with your project details:

- Set royalty percentages (recommended 2-5%)
- Configure payment addresses
- Define usage tracking parameters
- Specify license terms and conditions

## Deploy Smart Contracts

Use the provided deployment scripts to publish your license smart contracts:

1. **Compile contracts** using Hardhat or Truffle
2. **Test locally** on development network
3. **Deploy to testnet** for integration testing
4. **Deploy to mainnet** for production use

## Verify Implementation

Test your OCTL integration with these verification steps:

- Run automated test suite
- Check royalty distribution functionality
- Verify usage tracking accuracy
- Test license compliance monitoring

## Frequently Asked Questions

### How long does implementation take?
Typically 2-4 hours for a standard project setup with existing blockchain infrastructure.

### Which blockchains are supported?
Ethereum, Polygon, Arbitrum, and other EVM-compatible networks are fully supported.

### What are the gas costs?
Deployment costs vary by network. Check current rates on blockchain explorer websites like [Etherscan](https://etherscan.io/) for Ethereum or [Polygonscan](https://polygonscan.com/) for Polygon.

--- end of article`;

        this.clearUIFields();
        if (this.markdownInput && this.markdownInput.value !== undefined) {
            this.markdownInput.value = howToMarkdown;
        }
        this.updateCharCount();
        this.updateTransformation();
    }

    loadTableSample() {
        const tableMarkdown = `---
type: "Article"
schema: "https://schema.org"
base_url: "https://www.iunera.com/blog/"
date: "2025-06-01"
author:
  - Data Team
publisher:
  name: Iunera
  url: "https://www.iunera.com/"
  id: "https://www.iunera.com"
slug: comprehensive-table-examples
keywords:
  - tables
  - data
  - comparison
  - pricing
categories:
  - Data Analysis
  - Technology Comparison
---

# Comprehensive Table Examples for Schema.org Mapping

This article demonstrates various table types and how they map to schema.org structured data.

## Cloud Service Pricing Comparison

| Plan | Price | Storage | Users | Support |
|------|-------|---------|-------|---------|
| Basic | $10/month | 10GB | 5 | Email |
| Pro | $25/month | 100GB | 25 | Priority |
| Enterprise | $100/month | 1TB | Unlimited | 24/7 Phone |

## Product Specifications

| Property | Value | Unit | Range |
|----------|-------|------|-------|
| Weight | 2.5 | kg | 2.0-3.0 |
| Dimensions | 30x20x5 | cm | Standard |
| Battery Life | 12 | hours | 10-14 |
| Operating Temperature | -10 to 50 | °C | Extended |

## Network Performance Dataset

| Region | Latency | Bandwidth | Uptime | Users |
|--------|---------|-----------|--------|-------|
| US-East | 15ms | 1000Mbps | 99.9% | 150000 |
| EU-West | 22ms | 800Mbps | 99.8% | 95000 |
| Asia-Pacific | 35ms | 600Mbps | 99.7% | 75000 |
| South America | 45ms | 400Mbps | 99.5% | 25000 |

## Company Directory

| Company | Website | Industry | Founded | Employees |
|---------|---------|----------|---------|-----------|
| GitHub | https://github.com | Software Development | 2008 | 2000+ |
| Microsoft | https://microsoft.com | Technology | 1975 | 220000+ |
| Google | https://google.com | Technology | 1998 | 140000+ |

## Feature Comparison Matrix

| Feature | Basic Plan | Pro Plan | Enterprise |
|---------|------------|----------|------------|
| API Access | Limited | Full | Full |
| Custom Domains | ✗ | ✓ | ✓ |
| SSL Certificates | ✗ | ✗ | ✓ |
| 24/7 Support | ✗ | ✓ | ✓ |
| SLA Guarantee | ✗ | 99% | 99.9% |

Each table type will be automatically detected and mapped to appropriate schema.org types with semantic properties.

--- end of article`;

        this.clearUIFields();
        if (this.markdownInput && this.markdownInput.value !== undefined) {
            this.markdownInput.value = tableMarkdown;
        }
        this.updateCharCount();
        this.updateTransformation();
    }
}