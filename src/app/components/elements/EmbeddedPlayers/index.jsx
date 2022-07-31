import React from 'react';

import {
    genIframeMd as genDtubeIframeMd,
    validateIframeUrl as validateDtubeIframeUrl,
    normalizeEmbedUrl as normalizeDtubeEmbedUrl,
    embedNode as embedDtubeNode,
    sandboxConfig as sandboxConfigDtube,
} from 'app/components/elements/EmbeddedPlayers/dtube';

import {
    genIframeMd as genTwitchIframeMd,
    validateIframeUrl as validateTwitchIframeUrl,
    normalizeEmbedUrl as normalizeTwitchEmbedUrl,
    embedNode as embedTwitchNode,
    sandboxConfig as sandboxConfigTwitch,
} from 'app/components/elements/EmbeddedPlayers/twitch';

import {
    genIframeMd as genVimmIframeMd,
    validateIframeUrl as validateVimmIframeUrl,
    normalizeEmbedUrl as normalizeVimmEmbedUrl,
    embedNode as embedVimmNode,
    sandboxConfig as sandboxConfigVimm,
} from 'app/components/elements/EmbeddedPlayers/vimm';

// import {
//   normalizeEmbedUrl as normalizeCodeBlockEmbedUrl,
//   genIframeMd as genCodeBlockIframeMd,
//   embedNode as embedCodeBlockNode
// } from 'app/components/elements/EmbeddedPlayers/codeblock'

import {
    genIframeMd as genTwitchClipsIframeMd,
    validateIframeUrl as validateTwitchIClipsframeUrl,
    normalizeEmbedUrl as normalizeTwitchClipsEmbedUrl,
    embedNode as embedTwitchClipsNode,
    sandboxConfig as sandboxConfigTwitchClips,
} from 'app/components/elements/EmbeddedPlayers/twitch-clips';

import {
    validateIframeUrl as validateLbryIframeUrl,
    sandboxConfig as sandboxConfigLbry,
} from 'app/components/elements/EmbeddedPlayers/lbry';

import {
    validateIframeUrl as validateWistiaIframeUrl,
    sandboxConfig as sandboxConfigWistia,
    genIframeMd as genWistiaIframeMd,
    normalizeEmbedUrl as normalizeWistiaEmbedUrl,
    embedNode as embedWistiaNode,
} from 'app/components/elements/EmbeddedPlayers/wistia';

import {
    genIframeMd as genYoutubeIframeMd,
    validateIframeUrl as validateYoutubeIframeUrl,
    normalizeEmbedUrl as normalizeYoutubeEmbedUrl,
    embedNode as embedYoutubeNode,
    sandboxConfig as sandboxConfigYoutube,
} from 'app/components/elements/EmbeddedPlayers/youtube';

import {
    genIframeMd as genVimeoIframeMd,
    validateIframeUrl as validateVimeoIframeUrl,
    normalizeEmbedUrl as normalizeVimeoEmbedUrl,
    embedNode as embedVimeoNode,
    sandboxConfig as sandboxConfigVimeo,
} from 'app/components/elements/EmbeddedPlayers/vimeo';
import {
    genIframeMd as genThreespeakIframeMd,
    validateIframeUrl as validateThreespeakIframeUrl,
    normalizeEmbedUrl as normalizeThreespeakEmbedUrl,
    embedNode as embedThreeSpeakNode,
    preprocessHtml as preprocess3SpeakHtml,
    sandboxConfig as sandboxConfigThreespeak,
} from 'app/components/elements/EmbeddedPlayers/threespeak';

import {
    genIframeMd as genTwitterIframeMd,
    validateIframeUrl as validateTwitterIframeUrl,
    normalizeEmbedUrl as normalizeTwitterEmbedUrl,
    embedNode as embedTwitterNode,
    preprocessHtml as preprocessTwitterHtml,
} from 'app/components/elements/EmbeddedPlayers/twitter';

import {
    genIframeMd as genAnchorFmIframeMd,
    validateIframeUrl as validateAnchorFMIframeUrl,
    normalizeEmbedUrl as normalizeAnchorFmEmbedUrl,
    embedNode as embedAnchorFmNode,
    sandboxConfig as sandboxConfigAnchorFm,
} from 'app/components/elements/EmbeddedPlayers/anchorfm';

import {
    validateIframeUrl as validateOdyseeIframeUrl,
    sandboxConfig as sandboxConfigOdysee,
} from 'app/components/elements/EmbeddedPlayers/odysee';

import {
    normalizeEmbedUrl as normalizeSoundCloudEmbedUrl,
    genIframeMd as genSoundcloudIframeMd,
    validateIframeUrl as validateSoundcloudIframeUrl,
    sandboxConfig as sandboxConfigSoundcloud,
    embedNode as embedSoundCloudNode,
} from 'app/components/elements/EmbeddedPlayers/soundcloud';

import {
    extractMetadata as validateGistIframeUrl,
    extractMetadataFromEmbedCode as normalizeGistEmbedUrl,
    embedNode as embedGistNode,
    genIframeMd as genGistIframeMd,
    preprocessHtml as preprocessGistHtml,
    sandboxConfig as sandboxConfigGist,
} from 'app/components/elements/EmbeddedPlayers/gist';

import {
    validateIframeUrl as validateArchiveIframeUrl,
    normalizeEmbedUrl as normalizeArchiveEmbedUrl,
    embedNode as embedArchiveNode,
    genIframeMd as genArchiveIframeMd,
    sandboxConfig as sandboxConfigArchive,
} from 'app/components/elements/EmbeddedPlayers/archiveorg';

import {
    validateIframeUrl as validateMixCloudIframeUrl,
    normalizeEmbedUrl as normalizeMixCloudEmbedUrl,
    embedNode as embedMixCloudNode,
    genIframeMd as genMixCloudIframeMd,
    sandboxConfig as sandboxConfigMixCloud,
} from 'app/components/elements/EmbeddedPlayers/mixcloud';

import {
    validateIframeUrl as validateSpotifyIframeUrl,
    embedNode as embedSpotifyNode,
    genIframeMd as genSpotifyIframeMd,
    sandboxConfig as sandboxConfigSpotify,
} from 'app/components/elements/EmbeddedPlayers/spotify';

const supportedProviders = [
    {
        id: 'dtube',
        validateIframeUrlFn: validateDtubeIframeUrl,
        normalizeEmbedUrlFn: normalizeDtubeEmbedUrl,
        embedNodeFn: embedDtubeNode,
        genIframeMdFn: genDtubeIframeMd,
        ...sandboxConfigDtube,
    },
    {
        id: 'twitch',
        validateIframeUrlFn: validateTwitchIframeUrl,
        normalizeEmbedUrlFn: normalizeTwitchEmbedUrl,
        embedNodeFn: embedTwitchNode,
        genIframeMdFn: genTwitchIframeMd,
        ...sandboxConfigTwitch,
    },
    {
        id: 'vimm',
        validateIframeUrlFn: validateVimmIframeUrl,
        normalizeEmbedUrlFn: normalizeVimmEmbedUrl,
        embedNodeFn: embedVimmNode,
        genIframeMdFn: genVimmIframeMd,
        ...sandboxConfigVimm,
    },
    // {
    //   id: 'codeblock',
    //   // validateIframeUrlFn: validateTwitchIframeUrl,
    //   normalizeEmbedUrlFn: normalizeCodeBlockEmbedUrl,
    //   embedNodeFn: embedCodeBlockNode,
    //   genIframeMdFn: genCodeBlockIframeMd,
    //   ...sandboxConfigTwitch
    // },
    {
        id: 'twclips',
        validateIframeUrlFn: validateTwitchIClipsframeUrl,
        normalizeEmbedUrlFn: normalizeTwitchClipsEmbedUrl,
        embedNodeFn: embedTwitchClipsNode,
        genIframeMdFn: genTwitchClipsIframeMd,
        ...sandboxConfigTwitchClips,
    },
    {
        id: 'anchorfm',
        validateIframeUrlFn: validateAnchorFMIframeUrl,
        normalizeEmbedUrlFn: normalizeAnchorFmEmbedUrl,
        embedNodeFn: embedAnchorFmNode,
        genIframeMdFn: genAnchorFmIframeMd,
        ...sandboxConfigAnchorFm,
    },
    {
        id: 'youtube',
        validateIframeUrlFn: validateYoutubeIframeUrl,
        normalizeEmbedUrlFn: normalizeYoutubeEmbedUrl,
        embedNodeFn: embedYoutubeNode,
        genIframeMdFn: genYoutubeIframeMd,
        ...sandboxConfigYoutube,
    },
    {
        id: 'vimeo',
        validateIframeUrlFn: validateVimeoIframeUrl,
        normalizeEmbedUrlFn: normalizeVimeoEmbedUrl,
        embedNodeFn: embedVimeoNode,
        genIframeMdFn: genVimeoIframeMd,
        ...sandboxConfigVimeo,
    },
    {
        id: 'threespeak',
        validateIframeUrlFn: validateThreespeakIframeUrl,
        normalizeEmbedUrlFn: normalizeThreespeakEmbedUrl,
        embedNodeFn: embedThreeSpeakNode,
        genIframeMdFn: genThreespeakIframeMd,
        ...sandboxConfigThreespeak,
    },
    {
        id: 'lbry',
        validateIframeUrlFn: validateLbryIframeUrl,
        normalizeEmbedUrlFn: null,
        embedNodeFn: null,
        genIframeMdFn: null,
        ...sandboxConfigLbry,
    },
    {
        id: 'twitter',
        validateIframeUrlFn: validateTwitterIframeUrl,
        normalizeEmbedUrlFn: normalizeTwitterEmbedUrl,
        embedNodeFn: embedTwitterNode,
        genIframeMdFn: genTwitterIframeMd,
    },
    {
        id: 'wistia',
        validateIframeUrlFn: validateWistiaIframeUrl,
        normalizeEmbedUrlFn: normalizeWistiaEmbedUrl,
        embedNodeFn: embedWistiaNode,
        genIframeMdFn: genWistiaIframeMd,
        ...sandboxConfigWistia,
    },
    {
        id: 'odysee',
        validateIframeUrlFn: validateOdyseeIframeUrl,
        normalizeEmbedUrlFn: null,
        embedNodeFn: null,
        genIframeMdFn: null,
        ...sandboxConfigOdysee,
    },
    {
        id: 'spotify',
        validateIframeUrlFn: validateSpotifyIframeUrl,
        normalizeEmbedUrlFn: null,
        embedNodeFn: embedSpotifyNode,
        genIframeMdFn: genSpotifyIframeMd,
        ...sandboxConfigSpotify,
    },
    {
        id: 'gist',
        validateIframeUrlFn: validateGistIframeUrl,
        normalizeEmbedUrlFn: normalizeGistEmbedUrl,
        embedNodeFn: embedGistNode,
        genIframeMdFn: genGistIframeMd,
        ...sandboxConfigGist,
    },
    {
        id: 'soundcloud',
        validateIframeUrlFn: validateSoundcloudIframeUrl,
        normalizeEmbedUrlFn: normalizeSoundCloudEmbedUrl,
        embedNodeFn: embedSoundCloudNode,
        genIframeMdFn: genSoundcloudIframeMd,
        ...sandboxConfigSoundcloud,
    },
    {
        id: 'mixcloud',
        validateIframeUrlFn: validateMixCloudIframeUrl,
        normalizeEmbedUrlFn: normalizeMixCloudEmbedUrl,
        embedNodeFn: embedMixCloudNode,
        genIframeMdFn: genMixCloudIframeMd,
        ...sandboxConfigMixCloud,
    },
    {
        id: 'archiveorg',
        validateIframeUrlFn: validateArchiveIframeUrl,
        normalizeEmbedUrlFn: normalizeArchiveEmbedUrl,
        embedNodeFn: embedArchiveNode,
        genIframeMdFn: genArchiveIframeMd,
        ...sandboxConfigArchive,
    },
];

export default supportedProviders;

export function validateIframeUrl(url) {
    for (let pi = 0; pi < supportedProviders.length; pi += 1) {
        const provider = supportedProviders[pi];
        const validUrl = provider.validateIframeUrlFn(url);

        if (validUrl === true) {
            console.log(`Found a valid ${provider.id} iframe URL`);
            return {
                providerId: provider.id,
                sandboxAttributes: provider.sandboxAttributes || [],
                useSandbox: provider.useSandbox,
                validUrl,
            };
        }
    }

    return false;
}

export function normalizeEmbedUrl(url) {
    for (let pi = 0; pi < supportedProviders.length; pi += 1) {
        const provider = supportedProviders[pi];

        if (typeof provider.normalizeEmbedUrlFn === 'function') {
            const validEmbedUrl = provider.normalizeEmbedUrlFn(url);

            if (validEmbedUrl !== false) {
                console.log(`Found a valid ${provider.id} embedded URL`);
                return validEmbedUrl;
            }
        }
    }

    return false;
}

export function embedNode(child, links, images) {
    for (let pi = 0; pi < supportedProviders.length; pi += 1) {
        const provider = supportedProviders[pi];

        if (typeof provider.embedNodeFn === 'function') {
            child = provider.embedNodeFn(child, links, images);
        }
    }

    return child;
}

function getProviderById(id) {
    for (let pi = 0; pi < supportedProviders.length; pi += 1) {
        const provider = supportedProviders[pi];

        if (provider.id === id) {
            return provider;
        }
    }

    return null;
}

function getProviderIds() {
    return supportedProviders.map((o) => {
        return o.id;
    });
}

export function generateMd(section, idx, large) {
    let markdown = null;
    const supportedProvidersIds = getProviderIds();
    const regexString = `^([A-Za-z0-9\\?\\=\\_\\-\\/\\.]+) (${supportedProvidersIds.join(
        '|'
    )})\\s?(.*?) ~~~`;
    const regex = new RegExp(regexString);

    const match = section.match(regex);

    if (match && match.length >= 3) {
        const id = match[1];
        const type = match[2];
        const metadataString = match[3];
        let metadata;
        if (metadataString.indexOf('metadata:') === -1) {
            metadata = match[3] ? parseInt(match[3]) : 0;
        } else {
            metadata = metadataString.substring(9);
        }

        const w = large ? 640 : 480;
        const h = large ? 360 : 270;

        const provider = getProviderById(type);
        if (provider) {
            markdown = provider.genIframeMdFn(idx, id, w, h, metadata);
        } else {
            console.error('MarkdownViewer unknown embed type', type);
        }

        if (match[3]) {
            section = section.substring(
                `${id} ${type} ${metadataString} ~~~`.length
            );
        } else {
            section = section.substring(`${id} ${type} ~~~`.length);
        }

        return {
            section,
            markdown,
        };
    }

    return null;
}
export function preprocessHtml(html) {
    html = preprocess3SpeakHtml(html);
    html = preprocessTwitterHtml(html);
    html = preprocessGistHtml(html);
    return html;
}
