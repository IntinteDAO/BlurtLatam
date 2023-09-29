/* global $STM_Config */
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

/**
 * Regular expressions for detecting and validating provider URLs
 * @type {{htmlReplacement: RegExp, main: RegExp, sanitize: RegExp}}
 */
const regex = {
    // sanitize:
    //       /^(https?:)?\/\/player\.twitch\.tv\/\?(channel|video)=([A-Za-z0-9]+)/i,
    // main: /https?:\/\/(?:www.)?twitch\.tv\/(?:(videos)\/)?([a-zA-Z0-9]+$)/i,
    code: /(```)(.+)((?:\n.+)+)\n(```)$/gim,
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
 * Rewrites the embedded URL to a normalized format
 * @param url
 * @returns {string|boolean}
 */
export function normalizeEmbedUrl(url) {
    const match = url.match(regex.code);

    console.log('Match', match);

    // if (match && match.length >= 3) {
    //   if (match[1] === undefined) {
    //     return `https://player.twitch.tv/?autoplay=false&channel=${
    //               match[2]
    //           }&parent=${getParentDomain()}`
    //   }

    //   return `https://player.twitch.tv/?autoplay=false&video=${
    //           match[2]
    //       }&parent=${getParentDomain()}`
    // }

    return false;
}

/**
 * Extract the code and language type from code block
 * @param data
 * @returns {null|{id: *, canonical: string, url: *}}
 */
function extractMetadata(data) {
    console.log('Data', data);
    if (!data) return null;

    const m = data.match(regex.code);

    console.log('M', m);

    if (!m || m.length < 4) return null;

    return {
        id: m[2] + m[3],
        code: m[0],
    };
}

export function embedNode(child, links /* images */) {
    console.log('child', child);
    try {
        const { data } = child;
        console.log('data', data);
        const codeBlock = extractMetadata(data);
        if (!codeBlock) return child;

        child.data = data.replace(
            codeBlock.code,
            `~~~ embed:${codeBlock.id} codeblock ~~~`
        );
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
    const codeBlockData = id.split('+');

    console.log('code blc', codeBlockData);

    const language = codeBlockData[0];
    const code = codeBlockData[1];

    return (
        <div id={`code-block-${code.trim().subString(0, 10)}`}>
            <SyntaxHighlighter language={language} style={docco}>
                {code}
            </SyntaxHighlighter>
        </div>
    );
}
