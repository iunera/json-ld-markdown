// Enhanced Markdown Parser
import jsyaml from 'js-yaml';

export class EnhancedMarkdownParser {
    extractMetadata(content) {
        const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
        if (!frontMatterMatch) return {};

        try {
            const yamlContent = frontMatterMatch[1].trim();
            const metadata = jsyaml.load(yamlContent) || {};
            return metadata;
        } catch (error) {
            console.error('YAML parsing error:', error);
            return {};
        }
    }

    extractContext(content) {
        const contextMatch = content.match(/^@context:\s*(https?:\/\/[^\s]+)$/m);
        return contextMatch ? contextMatch[1] : 'https://schema.org';
    }

    extractTables(content) {
        const tables = [];
        const cleanContent = this.removeYamlAndContext(content);
        const lines = cleanContent.split('\n');
        
        let currentTable = null;
        let headers = [];
        let tableData = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.match(/^\|.*\|$/)) {
                const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
                
                if (!currentTable) {
                    headers = cells.map(cell => this.cleanText(cell));
                    currentTable = {
                        '@type': 'Table',
                        name: `Table ${tables.length + 1}`,
                        description: `Data table with columns: ${headers.join(', ')}`
                    };
                } else {
                    if (!cells.every(cell => cell.match(/^[-:\s]*$/))) {
                        const cleanCells = cells.map(cell => this.cleanText(cell));
                        if (cleanCells.some(cell => cell.length > 0)) {
                            tableData.push(cleanCells);
                        }
                    }
                }
            } else if (line.match(/^\|[-:\s|]+\|$/)) {
                continue;
            } else if (currentTable && (headers.length > 0 || tableData.length > 0)) {
                const processedTable = this.processTableToSchema(headers, tableData, tables.length + 1);
                tables.push(processedTable);
                currentTable = null;
                headers = [];
                tableData = [];
            }
        }
        
        if (currentTable && (headers.length > 0 || tableData.length > 0)) {
            const processedTable = this.processTableToSchema(headers, tableData, tables.length + 1);
            tables.push(processedTable);
        }
        
        return tables;
    }

    processTableToSchema(headers, tableData, tableNumber) {
        const tableType = this.analyzeTableType(headers, tableData);
        
        const baseTable = {
            '@type': tableType.type,
            name: tableType.name || `Table ${tableNumber}`,
            description: this.generateTableDescription(headers, tableData, tableType)
        };

        switch (tableType.category) {
            case 'pricing':
                return this.createPricingTable(baseTable, headers, tableData);
            case 'comparison':
                return this.createComparisonTable(baseTable, headers, tableData);
            case 'specification':
                return this.createSpecificationTable(baseTable, headers, tableData);
            case 'listing':
                return this.createListingTable(baseTable, headers, tableData);
            case 'dataset':
                return this.createDatasetTable(baseTable, headers, tableData);
            default:
                return this.createGenericTable(baseTable, headers, tableData);
        }
    }

    analyzeTableType(headers, tableData) {
        const headerText = headers.join(' ').toLowerCase();
        const allData = tableData.flat().join(' ').toLowerCase();
        
        if (headerText.match(/price|cost|plan|tier|subscription|fee|rate/) || 
            allData.match(/\$|€|£|¥|₹|\d+\.\d{2}|free|premium|basic|pro/)) {
            return {
                type: 'Table',
                category: 'pricing',
                name: 'Pricing Comparison Table'
            };
        }
        
        if (headerText.match(/vs|versus|compare|feature|support|included|type|model/) ||
            headers.length > 2 && tableData.some(row => 
                row.some(cell => cell && cell.toString().toLowerCase().match(/yes|no|✓|✗|included|supported|available|none|limited|partial/)))) {
            return {
                type: 'Table', 
                category: 'comparison',
                name: 'Feature Comparison Table'
            };
        }
        
        if (headerText.match(/spec|specification|property|attribute|parameter|value|requirement/) ||
            headers.some(h => h.match(/spec|model|version|size|weight|dimension/))) {
            return {
                type: 'Table',
                category: 'specification', 
                name: 'Specifications Table'
            };
        }
        
        if (headerText.match(/name|title|item|product|service|company|organization/) &&
            tableData.length > 3) {
            return {
                type: 'Table',
                category: 'listing',
                name: 'Directory Listing Table'
            };
        }
        
        if (headers.length > 3 && tableData.length > 5 &&
            headers.some(h => h.match(/data|metric|value|count|number|amount/))) {
            return {
                type: 'Dataset',
                category: 'dataset',
                name: 'Data Table'
            };
        }
        
        return {
            type: 'Table',
            category: 'generic',
            name: `Data Table`
        };
    }

    generateTableDescription(headers, tableData, tableType) {
        const rowCount = tableData.length;
        const columnCount = headers.length;
        
        let description = `A ${tableType.category} table with ${columnCount} columns and ${rowCount} rows`;
        
        switch (tableType.category) {
            case 'pricing':
                description += ' containing pricing information and plan comparisons';
                break;
            case 'comparison':
                description += ' comparing features and capabilities across different options';
                break;
            case 'specification':
                description += ' listing technical specifications and properties';
                break;
            case 'listing':
                description += ' providing a directory of items, companies, or resources';
                break;
            case 'dataset':
                description += ' containing structured data for analysis';
                break;
            default:
                description += ' with structured tabular data';
        }
        
        if (headers.length > 0) {
            description += `. Columns: ${headers.slice(0, 3).join(', ')}`;
            if (headers.length > 3) {
                description += ` and ${headers.length - 3} more`;
            }
        }
        
        return description + '.';
    }

    createPricingTable(baseTable, headers, tableData) {
        const priceColumnIndex = headers.findIndex(h => 
            h.toLowerCase().match(/price|cost|fee|rate/));
        const nameColumnIndex = headers.findIndex(h => 
            h.toLowerCase().match(/plan|tier|name|package/));
        
        baseTable.about = {
            '@type': 'PriceSpecification',
            description: 'Pricing information and plan comparisons'
        };
        
        let pricingText = 'Pricing table containing: ';
        if (tableData.length > 0) {
            const priceDescriptions = tableData.map(row => {
                const name = nameColumnIndex >= 0 ? row[nameColumnIndex] : 'Plan';
                const price = priceColumnIndex >= 0 ? row[priceColumnIndex] : 'Price not specified';
                return `${name}: ${price}`;
            });
            pricingText += priceDescriptions.join(', ');
        }
        
        baseTable.text = pricingText;
        return baseTable;
    }

    createComparisonTable(baseTable, headers, tableData) {
        baseTable['@type'] = 'Table';
        baseTable.about = {
            '@type': 'Thing',
            name: 'Feature Comparison',
            description: 'Comparison of features, capabilities, or characteristics'
        };
        
        let comparisonText = '';
        if (headers.length > 0) {
            comparisonText = `Comparison table with columns: ${headers.join(', ')}. `;
        }
        
        if (tableData.length > 0) {
            const summaryRows = tableData.slice(0, 3).map(row => {
                return headers.map((header, index) => 
                    `${header}: ${row[index] || 'N/A'}`
                ).join(', ');
            });
            comparisonText += `Data includes: ${summaryRows.join('; ')}.`;
            if (tableData.length > 3) {
                comparisonText += ` (${tableData.length - 3} more rows)`;
            }
        }
        
        baseTable.text = comparisonText.trim();
        
        return baseTable;
    }

    createSpecificationTable(baseTable, headers, tableData) {
        baseTable.about = {
            '@type': 'Product',
            description: 'Technical specifications and properties'
        };
        
        const propertyColumn = headers.findIndex(h => 
            h.toLowerCase().match(/property|spec|feature|attribute/));
        const valueColumn = headers.findIndex(h => 
            h.toLowerCase().match(/value|specification|detail/));
        
        let specText = 'Specification table with properties: ';
        if (tableData.length > 0) {
            const specDescriptions = tableData.slice(0, 5).map(row => {
                const prop = propertyColumn >= 0 ? row[propertyColumn] : `Property ${tableData.indexOf(row) + 1}`;
                const val = valueColumn >= 0 ? row[valueColumn] : 'Value not specified';
                return `${prop}: ${val}`;
            });
            specText += specDescriptions.join(', ');
            if (tableData.length > 5) {
                specText += ` and ${tableData.length - 5} more specifications`;
            }
        }
        
        baseTable.text = specText;
        return baseTable;
    }

    createListingTable(baseTable, headers, tableData) {
        const nameColumn = headers.findIndex(h => 
            h.toLowerCase().match(/name|title|company|organization|item/));
        const urlColumn = headers.findIndex(h => 
            h.toLowerCase().match(/url|website|link/));
        
        let listingText = 'Directory listing with entries: ';
        if (tableData.length > 0) {
            const listingDescriptions = tableData.slice(0, 3).map(row => {
                const name = nameColumn >= 0 ? row[nameColumn] : `Item ${tableData.indexOf(row) + 1}`;
                let url = '';
                if (urlColumn >= 0 && row[urlColumn]) {
                    const urlValue = row[urlColumn];
                    if (urlValue.startsWith('http') && 
                        !urlValue.includes('example.com') &&
                        !urlValue.includes('docs.octl.org') &&
                        !urlValue.match(/\.(test|invalid|local)($|\/)/)) {
                        url = ` (${urlValue})`;
                    }
                }
                return name + url;
            });
            listingText += listingDescriptions.join(', ');
            if (tableData.length > 3) {
                listingText += ` and ${tableData.length - 3} more items`;
            }
        }
        
        baseTable.text = listingText;
        return baseTable;
    }

    createDatasetTable(baseTable, headers, tableData) {
        baseTable['@type'] = 'Dataset';
        baseTable.description = `Dataset with ${headers.length} variables and ${tableData.length} observations`;
        
        let datasetText = `Dataset containing ${tableData.length} rows of data with variables: ${headers.join(', ')}.`;
        
        const numericColumns = this.detectNumericColumns(headers, tableData);
        if (numericColumns.length > 0) {
            datasetText += ` Includes ${numericColumns.length} numeric variables with statistical analysis available.`;
        }
        
        baseTable.text = datasetText;
        return baseTable;
    }

    createGenericTable(baseTable, headers, tableData) {
        return this.addTableStructure(baseTable, headers, tableData);
    }

    addTableStructure(table, headers, tableData) {
        let tableText = '';
        if (headers.length > 0) {
            tableText = `Table headers: ${headers.join(', ')}. `;
        }
        
        if (tableData.length > 0) {
            const rowTexts = tableData.slice(0, 3).map(row => {
                return headers.map((header, index) => 
                    `${header}: ${row[index] || 'N/A'}`
                ).join(', ');
            });
            tableText += `Sample data: ${rowTexts.join('; ')}.`;
            if (tableData.length > 3) {
                tableText += ` (${tableData.length - 3} more rows)`;
            }
        }
        
        table.text = tableText.trim();
        
        table.description = table.description || `Data table with ${headers.length} columns and ${tableData.length} rows`;
        
        return table;
    }

    extractPrice(text) {
        const currencySymbols = { '$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR' };
        const priceMatch = text.match(/([$€£¥₹])\s*(\d+(?:\.\d{2})?)|(\d+(?:\.\d{2})?)\s*(USD|EUR|GBP|JPY|INR)/i);
        
        if (priceMatch) {
            const symbol = priceMatch[1];
            const amount = priceMatch[2] || priceMatch[3];
            const currency = symbol ? currencySymbols[symbol] : priceMatch[4];
            
            return {
                amount: parseFloat(amount),
                currency: currency
            };
        }
        
        return null;
    }

    detectNumericColumns(headers, tableData) {
        const numericColumns = [];
        
        headers.forEach((header, columnIndex) => {
            const columnValues = tableData.map(row => row[columnIndex])
                .filter(value => value && !isNaN(parseFloat(value)))
                .map(value => parseFloat(value));
            
            if (columnValues.length > tableData.length * 0.5) {
                numericColumns.push({
                    name: header,
                    index: columnIndex,
                    count: columnValues.length,
                    min: Math.min(...columnValues),
                    max: Math.max(...columnValues),
                    average: columnValues.reduce((a, b) => a + b, 0) / columnValues.length
                });
            }
        });
        
        return numericColumns;
    }

    extractLists(content) {
        const lists = [];
        const cleanContent = this.removeYamlAndContext(content);
        const lines = cleanContent.split('\n');
        
        let currentList = null;
        let listItems = [];
        let listType = null;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);
            const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
            
            if (unorderedMatch || orderedMatch) {
                const itemText = unorderedMatch ? unorderedMatch[1] : orderedMatch[1];
                const currentListType = unorderedMatch ? 'unordered' : 'ordered';
                
                if (!currentList || listType !== currentListType) {
                    if (currentList && listItems.length > 0) {
                        currentList.itemListElement = listItems;
                        currentList.numberOfItems = listItems.length;
                        lists.push(currentList);
                    }
                    
                    currentList = {
                        '@type': 'ItemList',
                        name: `${unorderedMatch ? 'Bulleted' : 'Numbered'} List ${lists.length + 1}`,
                        description: `A ${unorderedMatch ? 'bulleted' : 'numbered'} list of items`
                    };
                    listItems = [];
                    listType = currentListType;
                }
                
                listItems.push({
                    '@type': 'ListItem',
                    name: this.cleanText(itemText),
                    position: listItems.length + 1
                });
            } else if (currentList && trimmed === '') {
                continue;
            } else if (currentList && !trimmed.match(/^#/) && trimmed) {
                if (listItems.length > 0) {
                    currentList.itemListElement = listItems;
                    currentList.numberOfItems = listItems.length;
                    lists.push(currentList);
                    currentList = null;
                    listItems = [];
                    listType = null;
                }
            }
        }
        
        if (currentList && listItems.length > 0) {
            currentList.itemListElement = listItems;
            currentList.numberOfItems = listItems.length;
            lists.push(currentList);
        }
        
        return lists;
    }

    extractLinks(content, articleUrl = null) {
        const links = [];
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)(?!@\{)/g;
        let match;
        
        while ((match = linkRegex.exec(content)) !== null) {
            const [, linkText, url] = match;
            
            if (!url.startsWith('http')) {
                continue;
            }
            
            let linkType = 'WebPage';
            if (url.includes('github.com')) linkType = 'SoftwareSourceCode';
            else if (url.includes('youtube.com') || url.includes('youtu.be')) linkType = 'VideoObject';
            else if (url.match(/\.(pdf|doc|docx)$/i)) linkType = 'DigitalDocument';
            else if (url.match(/\.(jpg|jpeg|png|gif|svg)$/i)) linkType = 'ImageObject';
            
            links.push({
                '@type': linkType,
                name: this.cleanText(linkText),
                url: url,
                '@id': url
            });
        }
        
        return links;
    }

    extractAnnotations(content) {
        const annotations = [];
        const annotationRegex = /\[([^\]]*?)\](?:\(([^)]+)\))?@\{([^}]+)\}/g;
        let match;

        while ((match = annotationRegex.exec(content)) !== null) {
            const [, text, url, annotationContent] = match;
            const annotation = this.parseAnnotation(text, url, annotationContent);
            if (annotation) {
                annotations.push(annotation);
            }
        }

        return annotations;
    }

    parseAnnotation(text, url, annotationContent) {
        const parts = annotationContent.split(',').map(part => part.trim());
        const type = parts[0];
        const properties = { '@type': type };

        for (let i = 1; i < parts.length; i++) {
            const [key, value] = parts[i].split('=').map(s => s.trim());
            if (key && value) {
                if (key === '@id') {
                    properties['@id'] = value;
                } else if (key.includes('.')) {
                    const [parent, child] = key.split('.');
                    properties[parent] = properties[parent] || {};
                    if (parent === 'publisher' && child === 'name') {
                        properties[parent][child] = value;
                    } else {
                        properties[parent][child] = this.processValue(value);
                    }
                } else {
                    properties[key] = this.processValue(value);
                }
            }
        }

        if (!properties.name && text) {
            properties.name = text;
        }

        if (url) {
            properties.url = url;
        }

        if (type === 'Person' && text && !properties.givenName) {
            properties.givenName = text;
        }

        if (properties.license && typeof properties.license === 'string') {
            if (properties.license.startsWith('http')) {
                properties.license = { '@id': properties.license };
            }
        }

        return {
            '@context': 'https://schema.org',
            ...properties
        };
    }

    processValue(value) {
        if (value.match(/^https?:\/\//)) {
            return value;
        }
        if (value.startsWith('#')) {
            return value;
        }
        return value;
    }

    extractTitle(content) {
        const cleanContent = this.removeYamlAndContext(content);
        const titleMatch = cleanContent.match(/^#\s+(.+)$/m);
        return titleMatch ? this.cleanText(titleMatch[1]) : null;
    }

    extractDescription(content, maxLength) {
        const cleanContent = this.removeYamlAndContext(content);
        const lines = cleanContent.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && 
                !trimmed.match(/^#+\s/) && 
                !trimmed.match(/^\|.*\|$/) && 
                !trimmed.match(/^\|[-:\s|]+\|$/) && 
                !trimmed.match(/^[-*+]\s/) && 
                !trimmed.match(/^\d+\.\s/) && 
                !trimmed.match(/^\[.*\]@\{/)) { 
                
                const cleaned = this.cleanText(trimmed);
                if (cleaned.length > 0) {
                    return cleaned.slice(0, maxLength);
                }
            }
        }
        return null;
    }

    extractArticleBody(content) {
        const cleanContent = this.removeYamlAndContext(content);
        const finalContent = this.cleanText(cleanContent);
        
        const result = finalContent.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.includes('--- end of article'))
            .join(' ');
            
        return result;
    }

    extractSections(content) {
        const sections = [];
        const cleanContent = this.removeYamlAndContext(content);
        const lines = cleanContent.split('\n');
        
        let currentSection = null;
        let currentContent = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.includes('--- end of article')) {
                continue;
            }
            
            const headingMatch = trimmed.match(/^(#{2,})\s+(.+)$/);
            
            if (headingMatch) {
                const headingText = headingMatch[2];
                
                if (currentSection && currentContent.length > 0) {
                    const sectionText = this.cleanText(currentContent.join('\n').trim());
                    if (sectionText) {
                        sections.push({
                            '@type': 'WebPageElement',
                            name: this.cleanText(currentSection),
                            text: sectionText,
                            cssSelector: `#${this.cleanText(currentSection).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`,
                            position: sections.length + 1
                        });
                    }
                }
                
                currentSection = headingText;
                currentContent = [];
            } else if (currentSection && trimmed) {
                currentContent.push(trimmed);
            }
        }
        
        if (currentSection && currentContent.length > 0) {
            const sectionText = this.cleanText(currentContent.join('\n').trim());
            if (sectionText) {
                sections.push({
                    '@type': 'WebPageElement',
                    name: this.cleanText(currentSection),
                    text: sectionText,
                    cssSelector: `#${this.cleanText(currentSection).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`,
                    position: sections.length + 1
                });
            }
        }
        
        return sections;
    }

    extractFaqQuestions(content) {
        const faqQuestions = [];
        const cleanContent = this.removeYamlAndContext(content);
        const lines = cleanContent.split('\n');
        
        let inFaqSection = false;
        let currentQuestion = null;
        let currentAnswer = [];

        for (const line of lines) {
            if (line.match(/^##\s+(FAQ|Frequently Asked Questions)/i)) {
                inFaqSection = true;
                continue;
            }
            
            if (inFaqSection && line.match(/^###\s+/)) {
                if (currentQuestion && currentAnswer.length) {
                    faqQuestions.push({
                        '@type': 'Question',
                        name: this.cleanText(currentQuestion),
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: this.cleanText(currentAnswer.join(' ').trim())
                        }
                    });
                }
                currentQuestion = line.replace(/^###\s+/, '').trim();
                currentAnswer = [];
            } else if (inFaqSection && currentQuestion && line.trim() && !line.includes('--- end of article')) {
                currentAnswer.push(line.trim());
            }
        }

        if (currentQuestion && currentAnswer.length) {
            faqQuestions.push({
                '@type': 'Question',
                name: this.cleanText(currentQuestion),
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: this.cleanText(currentAnswer.join(' ').trim())
                }
            });
        }

        return faqQuestions;
    }

    removeYamlAndContext(content) {
        let cleaned = content.replace(/^@context:\s*https?:\/\/[^\n]+\n\n?/m, '');
        cleaned = cleaned.replace(/^---\n[\s\S]*?\n---\n/, '');
        return cleaned;
    }

    cleanText(text) {
        let cleaned = text;
        
        cleaned = cleaned.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
        cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
        cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
        cleaned = cleaned.replace(/___([^_]+)___/g, '$1');
        cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
        cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
        cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
        cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
            return match.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
        });
        cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1');
        cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)(?!@\{)/g, '$1');
        cleaned = cleaned.replace(/\[([^\]]*?)\](?:\(([^)]+)\))?@\{([^}]+)\}/g, '$1');
        cleaned = cleaned.replace(/^#+\s*/gm, '');
        cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');
        cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
        cleaned = cleaned.replace(/^\s*>\s+/gm, '');
        cleaned = cleaned.replace(/\|([^|\n]*)\|/g, (match, content) => {
            return content.split('|').map(cell => cell.trim()).join(' ');
        });
        cleaned = cleaned.replace(/\|/g, '');
        cleaned = cleaned.replace(/^\s*\|[-:\s|]+\|\s*$/gm, '');
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        cleaned = cleaned.replace(/[ \t]+/g, ' ');
        cleaned = cleaned.trim();
        
        return cleaned;
    }
}