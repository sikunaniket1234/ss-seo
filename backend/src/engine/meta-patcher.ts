import * as cheerio from 'cheerio';
import fs from 'fs-extra';

export interface MetaPatch {
    title?: string;
    description?: string;
    robots?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogType?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterCard?: string;
}

export class MetaPatcher {
    public static async applyPatch(filePath: string, patch: MetaPatch): Promise<void> {
        const html = await fs.readFile(filePath, 'utf8');
        const updatedHtml = this.patchHtml(html, patch);
        await fs.writeFile(filePath, updatedHtml, 'utf8');
    }

    public static patchHtml(html: string, patch: MetaPatch): string {
        const $ = cheerio.load(html);

        if (patch.title) {
            if ($('title').length > 0) {
                $('title').text(patch.title);
            } else {
                $('head').prepend(`<title>${patch.title}</title>`);
            }
        }

        if (patch.description) {
            this.updateOrAddMeta($, 'description', patch.description);
        }

        if (patch.robots) {
            this.updateOrAddMeta($, 'robots', patch.robots);
        }

        if (patch.canonical) {
            if ($('link[rel="canonical"]').length > 0) {
                $('link[rel="canonical"]').attr('href', patch.canonical);
            } else {
                $('head').append(`<link rel="canonical" href="${patch.canonical}">`);
            }
        }

        if (patch.ogTitle) {
            this.updateOrAddPropertyMeta($, 'og:title', patch.ogTitle);
        }

        if (patch.ogDescription) {
            this.updateOrAddPropertyMeta($, 'og:description', patch.ogDescription);
        }

        if (patch.ogType) {
            this.updateOrAddPropertyMeta($, 'og:type', patch.ogType);
        }

        if (patch.twitterTitle) {
            this.updateOrAddMeta($, 'twitter:title', patch.twitterTitle);
        }

        if (patch.twitterDescription) {
            this.updateOrAddMeta($, 'twitter:description', patch.twitterDescription);
        }

        if (patch.twitterCard) {
            this.updateOrAddMeta($, 'twitter:card', patch.twitterCard);
        }

        return $.html();
    }

    private static updateOrAddMeta($: cheerio.CheerioAPI, name: string, content: string) {
        if ($(`meta[name="${name}"]`).length > 0) {
            $(`meta[name="${name}"]`).attr('content', content);
        } else {
            $('head').append(`<meta name="${name}" content="${content}">`);
        }
    }

    private static updateOrAddPropertyMeta($: cheerio.CheerioAPI, property: string, content: string) {
        if ($(`meta[property="${property}"]`).length > 0) {
            $(`meta[property="${property}"]`).attr('content', content);
        } else {
            $('head').append(`<meta property="${property}" content="${content}">`);
        }
    }
}
