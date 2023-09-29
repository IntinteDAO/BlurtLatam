/* global $STM_Config */
import React from 'react';

/**
 * Regular expressions for detecting and validating provider URLs
 * @type {{htmlReplacement: RegExp, main: RegExp, sanitize: RegExp}}
 */
const regex = {
    frame: /^https:\/\/www.vimm.tv\/([a-zA-Z]+)\/embed\?autoplay=0/i,
    embedView:
        /^https:\/\/www.vimm\.tv\/(embedview)\/([a-zA-Z0-9-_]+)\?autoplay=1&mute=1/i,
    url: /^https:\/\/www.vimm.tv\/(c|view)\/([a-zA-Z0-9-_]+)/i,
};
export default regex;

/**
 * Configuration for HTML iframe's `sandbox` attribute
 * @type {useSandbox: boolean, sandboxAttributes: string[]}
 */
export const sandboxConfig = {
    useSandbox: false,
    sandboxAttributes: [],
};

/**
 * Check if the iframe code in the post editor is to an allowed URL
 * <iframe src="https://www.vimm.tv/chisdealhd/embed?autoplay=0" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe>
 *
 * @param url
 * @returns {boolean|*}
 */
export function validateIframeUrl(url) {
    const match = url.match(regex.frame);

    const matchEmbed = url.match(regex.embedView);

    if (match) {
        return `https://www.vimm.tv/${match[1]}/embed?autoplay=0`;
    }

    if (matchEmbed) {
        return `https://www.vimm.tv/embedview/${matchEmbed[2]}?autoplay=1&mute=1`;
    }

    return false;
}

/**
 * Rewrites the embedded URL to a normalized format
 * @param url
 * @returns {string|boolean}
 */
export function normalizeEmbedUrl(url) {
    const match = url.match(regex.frame);

    if (match) {
        return `https://www.vimm.tv/${match[1]}/embed?autoplay=0`;
    }

    const matchEmbed = url.match(regex.embedView);

    if (matchEmbed) {
        return `https://www.vimm.tv/embedview/${matchEmbed[2]}?autoplay=1&mute=1`;
    }

    return false;
}

/**
 * Extract the code and language type from code block
 * @param data
 * @returns {null|{id: *, canonical: string, url: *}}
 */
function extractMetadata(data) {
    if (!data) return null;

    const m = data.match(regex.url);

    if (!m) return null;

    return {
        id: `${m[1]}/${m[2]}`,
        url: m[0],
    };
}

export function embedNode(child, links /* images */) {
    try {
        const { data } = child;
        const vimm = extractMetadata(data);
        if (!vimm) return child;

        child.data = data.replace(vimm.url, `~~~ embed:${vimm.id} vimm ~~~`);
    } catch (error) {
        console.error(error);
    }

    return child;
}

/**
 * Generates the Markdown/HTML code to override the detected URL with an iFrame
 * @param idx
 * @param id
 * @param width
 * @param height
 * @returns {*}
 */
export function genIframeMd(idx, id, width, height) {
    let url = '';
    if (id.startsWith('c/')) {
        id = id.replace('c/', '');
        url = `https://www.vimm.tv/${id}/embed?autoplay=0`;
    } else if (id.startsWith('view/')) {
        url = `https://www.vimm.tv/embed${id}?autoplay=1&mute=1`;
    }

    let sandbox = sandboxConfig.useSandbox;
    if (sandbox) {
        if (
            Object.prototype.hasOwnProperty.call(
                sandboxConfig,
                'sandboxAttributes'
            )
        ) {
            sandbox = sandboxConfig.sandboxAttributes.join(' ');
        }
    }
    const aspectRatioPercent = (height / width) * 100;
    const iframeProps = {
        src: url,
        width,
        height,
        frameBorder: '0',
        allowFullScreen: 'allowFullScreen',
    };
    if (sandbox) {
        iframeProps.sandbox = sandbox;
    }

    return (
        <div
            key={`vimm-${id}-${idx}`}
            className="videoWrapper"
            style={{
                position: 'relative',
                width: '100%',
                height: 0,
                paddingBottom: `${aspectRatioPercent}%`,
            }}
        >
            <iframe
                title="Vimm embedded player"
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...iframeProps}
            />
        </div>
    );
}
