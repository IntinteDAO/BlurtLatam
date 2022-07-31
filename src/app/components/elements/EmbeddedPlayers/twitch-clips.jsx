/* global $STM_Config */
import React from 'react'

/**
 * Regular expressions for detecting and validating provider URLs
 * @type {{htmlReplacement: RegExp, main: RegExp, clip: RegExp}}
 */
const regex = {
  main: /https?:\/\/(?:www.)?twitch\.tv\/([a-zA-Z0-9-_]+)\/clip\/([a-zA-Z0-9-_]+)/i,
  clip: /https:\/\/clips\.twitch\.tv\/embed\?clip=([a-zA-Z0-9-_]+)/i
}
export default regex

/**
 * Configuration for HTML iframe's `sandbox` attribute
 * @type {useSandbox: boolean, sandboxAttributes: string[]}
 */
export const sandboxConfig = {
  useSandbox: false,
  sandboxAttributes: []
}

function getParentDomain () {
  let parentDomain = $STM_Config.site_domain
  if (typeof window !== 'undefined') {
    parentDomain = window.location.hostname
  }

  return parentDomain
}

/**
 * Check if the iframe code in the post editor is to an allowed URL
 * <iframe src="https://clips.twitch.tv/embed?clip=NastyVictoriousCheeseCoolCat-8LNzeiCE2_C9JlqO&parent=www.example.com" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe>
 *
 * @param url
 * @returns {boolean|*}
 */
export function validateIframeUrl (url) {
  const match = url.match(regex.clip)

  if (match) {
    return `https://clips.twitch.tv/embed?clip=${
            match[1]
        }&parent=${getParentDomain()}`
  }

  return false
}

/**
 * Rewrites the embedded URL to a normalized format
 * @param url
 * @returns {string|boolean}
 */
export function normalizeEmbedUrl (url) {
  const match = url.match(regex.clip)

  if (match) {
    return `https://clips.twitch.tv/embed?clip=${match[1]}`
  }

  return false
}

/**
 * Extract the content ID and other metadata from the URL
 * @param data
 * @returns {null|{id: *, canonical: string, url: *}}
 */
function extractMetadata (data) {
  if (!data) return null

  const m = data.match(regex.main)

  if (!m || m.length < 3) return null

  return {
    id: m[2],
    url: m[0],
    canonical: m[0]
    // canonical: `https://clips.twitch.tv/embed?clip=${m[2]}`
  }
}

export function embedNode (child, links /* images */) {
  try {
    const { data } = child
    const twitchClip = extractMetadata(data)

    if (!twitchClip) return child

    child.data = data.replace(
      twitchClip.url,
            `~~~ embed:${twitchClip.id} twclips ~~~`
    )

    if (links) links.add(twitchClip.canonical)
  } catch (error) {
    console.error(error)
  }

  return child
}

/**
 * Generates the Markdown/HTML code to override the detected URL with an iFrame
 * @param idx
 * @param id
 * @param width
 * @param height
 * @returns {*}
 */
export function genIframeMd (idx, id, width, height) {
  const url = `https://clips.twitch.tv/embed?clip=${id}&parent=${getParentDomain()}`

  let sandbox = sandboxConfig.useSandbox
  if (sandbox) {
    if (
      Object.prototype.hasOwnProperty.call(
        sandboxConfig,
        'sandboxAttributes'
      )
    ) {
      sandbox = sandboxConfig.sandboxAttributes.join(' ')
    }
  }
  const aspectRatioPercent = (height / width) * 100
  const iframeProps = {
    src: url,
    width,
    height,
    frameBorder: '0',
    allowFullScreen: 'allowFullScreen'
  }
  if (sandbox) {
    iframeProps.sandbox = sandbox
  }

  return (
    <div
      key={`twitch-clip-${id}-${idx}`}
      className='videoWrapper'
      style={{
        position: 'relative',
        width: '100%',
        height: 0,
        paddingBottom: `${aspectRatioPercent}%`
      }}
    >
      <iframe
        title='Twitch Clip embedded player'
                // eslint-disable-next-line react/jsx-props-no-spreading
        {...iframeProps}
      />
    </div>
  )
}
