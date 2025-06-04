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

// Configuration Management
export class Config {
    static DEFAULT_TYPE = 'Article';
    static DEFAULT_SCHEMA = 'https://schema.org';
    static DEFAULT_BASE_URL = 'https://www.iunera.com/blog/';
    static DEFAULT_DATE = '2025-06-01';
    static DEFAULT_AUTHOR = ['Christian Schmitt', 'Dr. Tim Frey'];
    static DEFAULT_PUBLISHER = {
        '@type': 'Organization',
        name: 'Iunera',
        '@id': 'https://www.iunera.com',
        url: 'https://www.iunera.com/',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Altrottstraße 31',
            addressLocality: 'Walldorf',
            postalCode: '69190'
        },
        telephone: '+49 6227 381350'
    };
    static DEFAULT_SLUG = 'license-token-fair-code';
    static DEFAULT_KEYWORDS = ['open source', 'fair code', 'license token', 'blockchain', 'AI'];
    static DEFAULT_CATEGORIES = ['Technology', 'Software Licensing', 'Blockchain Innovation'];
    static DEFAULT_DESCRIPTION_LENGTH = 300;

    constructor(options = {}) {
        this.type = options.type || Config.DEFAULT_TYPE;
        this.schema = options.schema || Config.DEFAULT_SCHEMA;
        this.baseUrl = options.baseUrl || Config.DEFAULT_BASE_URL;
        this.date = options.date || Config.DEFAULT_DATE;
        this.author = options.author || [...Config.DEFAULT_AUTHOR];
        this.publisher = options.publisher || {...Config.DEFAULT_PUBLISHER};
        this.slug = options.slug || Config.DEFAULT_SLUG;
        this.keywords = options.keywords || [...Config.DEFAULT_KEYWORDS];
        this.categories = options.categories || [...Config.DEFAULT_CATEGORIES];
        this.descriptionLength = options.descriptionLength || Config.DEFAULT_DESCRIPTION_LENGTH;
    }
}