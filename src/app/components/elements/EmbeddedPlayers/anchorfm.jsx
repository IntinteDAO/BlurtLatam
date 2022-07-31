/* global $STM_Config */
import React from 'react'

/**
 * Regular expressions for detecting and validating provider URLs
 * @type {{htmlReplacement: RegExp, contentId: RegExp, contentIdEmbed: RegExp}}
 */
const regex = {
  contentId:
        /^https:\/\/anchor\.fm\/?([a-zA-Z-0-9]+)\/episodes\/?([a-zA-Z-0-9\/]+)/i,
  contentIdEmbed:
        /^https:\/\/anchor\.fm\/?([a-zA-Z-0-9]+)\/embed\/episodes\/?([a-zA-Z-0-9\/]+)/i
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

/**
 * Check if the iframe code in the post editor is to an allowed URL
 * <iframe src="https://player.twitch.tv/?channel=tfue" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe>
 * <iframe src="https://anchor.fm/the-nerve/embed/episodes/Ep-48-Poet--academic-Emily-Cullen-e1hrfei" height="102px" width="400px" frameborder="0" scrolling="no"></iframe>
 * @param url
 * @returns {boolean|*}
 */
export function validateIframeUrl (url) {
  const match = url.match(regex.contentIdEmbed)

  if (match) {
    return `https://anchor.fm/${match[1]}/embed/episodes/${match[2]}`
  }

  return false
}

/**
 * Rewrites the embedded URL to a normalized format
 * @param url
 * @returns {string|boolean}
 */
export function normalizeEmbedUrl (url) {
  const match = url.match(regex.contentIdEmbed)

  if (match && match.length >= 3) {
    return `https://anchor.fm/${match[1]}/embed/episodes/${match[2]}`
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

  const m = data.match(regex.contentId)

  if (!m || m.length < 3) return null

  return {
    id: `${m[1]}/embed/episodes/${m[2]}`,
    url: m[0],
    canonical: `https://anchor.fm/${m[1]}/embed/episodes/${m[2]}`
  }
}

export function embedNode (child, links /* images */) {
  try {
    const { data } = child
    const anchorfm = extractMetadata(data)
    if (!anchorfm) return child

    child.data = data.replace(
      anchorfm.url,
            `~~~ embed:${anchorfm.id} anchorfm ~~~`
    )

    if (links) links.add(anchorfm.canonical)
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
  const url = `https://anchor.fm/${id}`

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
    height: '102px',
    frameBorder: '0',
    scrolling: 'no',
    allowFullScreen: 'allowFullScreen'
  }
  if (sandbox) {
    iframeProps.sandbox = sandbox
  }

  return (
    <div
      key={`anchorfm-${id}-${idx}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '102px',
        paddingBottom: '2%'
      }}
    >
      <iframe
        title='AnchorFm embedded player'
                // eslint-disable-next-line react/jsx-props-no-spreading
        {...iframeProps}
      />
    </div>
  )
}
