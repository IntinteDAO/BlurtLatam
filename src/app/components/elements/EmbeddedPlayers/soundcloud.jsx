import React from 'react';

const regex = {
    sanitize: /^https:\/\/w\.soundcloud\.com\/player\/.*?url=(.+?)&.*/i,
    plainUrl: /https:\/\/soundcloud\.com\/([a-zA-z-_0-9]+)\/([a-zA-Z0-9-_]+)/i,
};

export default regex;
export const sandboxConfig = {
    useSandbox: true,
    sandboxAttributes: ['allow-scripts', 'allow-same-origin', 'allow-popups'],
};

// <iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/257659076&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>
export function validateIframeUrl(url) {
    const match = url.match(regex.sanitize);

    if (!match || match.length !== 2) {
        return false;
    }

    return `https://w.soundcloud.com/player/?url=${match[1]}&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`;
}

/**
 * Rewrites the embedded URL to a normalized format
 * @param url
 * @returns {string|boolean}
 */
export function normalizeEmbedUrl(url) {
    const match = url.match(regex.plainUrl);

    if (match && match.length >= 3) {
        return `https://soundcloud.com/${match[1]}/${match[2]}`;
    }

    return false;
}

/**
 * Extract the content ID and other metadata from the URL
 * @param data
 * @returns {null|{id: *, canonical: string, url: *}}
 */
function extractMetadata(data) {
    if (!data) return null;

    const m = data.match(regex.plainUrl);

    if (!m || m.length < 2) return null;

    return {
        id: `${m[1]}/${m[2]}`,
        url: m[0],
        canonical: m[0],
    };
}

export function embedNode(child, links /* images */) {
    try {
        const { data } = child;
        const soundcloud = extractMetadata(data);
        if (!soundcloud) return child;

        child.data = data.replace(
            soundcloud.url,
            `~~~ embed:${soundcloud.id} soundcloud ~~~`
        );

        if (links) links.add(soundcloud.canonical);
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
    const url = `https://soundcloud.com/${id}`;

    const iframeUrl = "https://w.soundcloud.com/player/?url="
        + url
        + '&amp;color=ff5500'
        + '&amp;auto_play=false'
        + '&amp;hide_related=true'
        + '&amp;show_reposts=false'
        + '&amp;show_user=true'
        + '&amp;show_comments=false';

    const iframeProps = {
        src: iframeUrl,
        width,
        height: '166px',
        frameBorder: '0',
        scrolling: 'no',
        allowFullScreen: false
    }

    return (
        <div
            key={`soundcloud-${id}-${idx}`}
            style={{
                position: 'relative',
                width: '100%',
                height: '166px',
                paddingBottom: '2%',
            }}
        >
            <iframe
                title="Soundcloud Embedded Player"
                {...iframeProps}
            />
        </div>
    );
}
