/*
 * Copyright (C) 2025.  Tim Frey, Christian Schmitt
 *
 * Licensed under the OPEN COMPENSATION TOKEN LICENSE (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at <a href="https://www.license-token.com/license/text">https://www.license-token.com/license/text</a>
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either expressed or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @octl.sid: 5fecd757-5fec-d757-d757-00005fb33b80
 *
 */

// JSON-LD Transformer
import {EnhancedMarkdownParser} from './enhanced-markdown-parser.js';

export class JsonLDTransformer {
    static transform(markdownContent, config) {
        const parser = new EnhancedMarkdownParser();
        const context = parser.extractContext(markdownContent);

        const articleUrl = `${config.baseUrl.replace(/\/$/, '')}/${config.slug}`;

        const annotations = parser.extractAnnotations(markdownContent);
        const title = parser.extractTitle(markdownContent);
        const description = parser.extractDescription(markdownContent, config.descriptionLength);
        const articleBody = parser.extractArticleBody(markdownContent);
        const faqQuestions = parser.extractFaqQuestions(markdownContent);
        const sections = parser.extractSections(markdownContent);
        const tables = parser.extractTables(markdownContent);
        const lists = parser.extractLists(markdownContent);
        const links = parser.extractLinks(markdownContent, articleUrl);

        const isHowTo = config.type === 'HowTo' ||
            (title && title.toLowerCase().includes('how to')) ||
            (title && title.toLowerCase().startsWith('how '));

        const mainEntity = {
            '@context': context,
            '@type': isHowTo ? 'HowTo' : config.type,
            name: title || 'Untitled Article',
            description: description || articleBody.slice(0, config.descriptionLength),
            datePublished: config.date,
            author: this.processAuthors(config.author, articleUrl),
            publisher: this.processPublisher(config.publisher),
            keywords: config.keywords,
            about: config.categories.map(c => ({
                '@type': 'Thing',
                name: c
            }))
        };

        if (isHowTo) {
            if (sections.length > 0) {
                mainEntity.step = sections.map((section, index) => ({
                    '@type': 'HowToStep',
                    name: section.name,
                    text: section.text,
                    position: index + 1,
                    url: `${articleUrl}#${section.cssSelector.replace('#', '')}`
                }));
            }
            mainEntity.totalTime = 'PT30M';
        } else {
            mainEntity.articleBody = articleBody;
            mainEntity.url = articleUrl;

            const validParts = [];

            if (sections.length > 0) {
                validParts.push(...sections);
            }

            if (tables.length > 0) {
                validParts.push(...tables);
            }

            if (validParts.length > 0) {
                mainEntity.hasPart = validParts;
            }
        }

        if (links.length > 0) {
            const realLinks = links.filter(link => link.url && link.url.startsWith('http'));
            if (realLinks.length > 0) {
                mainEntity.mentions = realLinks.map(link => ({
                    '@id': link.url
                }));
            }
        }

        const result = [mainEntity];

        if (faqQuestions.length > 0) {
            result.push({
                '@context': context,
                '@type': 'FAQPage',
                name: `FAQ: ${mainEntity.name}`,
                mainEntity: faqQuestions,
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': articleUrl
                },
                datePublished: mainEntity.datePublished,
                author: mainEntity.author,
                publisher: mainEntity.publisher
            });
        }

        lists.forEach(list => {
            list['@context'] = context;
            result.push(list);
        });

        links.forEach(link => {
            link['@context'] = context;
            if (link.url && link.url.startsWith('http')) {
                result.push(link);
            }
        });

        annotations.forEach((annotation, index) => {
            annotation['@context'] = context;

            if (annotation['@id'] && !annotation['@id'].startsWith('http')) {
                delete annotation['@id'];
            }

            result.push(annotation);
        });

        return result;
    }

    static processAuthors(authors, articleUrl) {
        return authors.map(author => ({
            '@type': 'Person',
            name: author
        }));
    }

    static processPublisher(publisher) {
        return {
            '@type': 'Organization',
            ...publisher
        };
    }
}