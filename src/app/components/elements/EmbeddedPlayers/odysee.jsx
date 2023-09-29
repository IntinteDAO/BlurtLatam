const regex = {
    sanitize: /^(https?:)?\/\/odysee.com\/.*/i,
};

export default regex;

export const sandboxConfig = {
    useSandbox: true,
    sandboxAttributes: ['allow-scripts', 'allow-same-origin', 'allow-popups'],
};

// <iframe id="odysee-iframe" width="560" height="315" src="https://odysee.com/$/embed/vrchat-trolling-people-using-force-gate-open-mod/f0d2bdd3e9488e16a29addab96012b65b308d6ad?r=3GDZfbA88BTF3A9fwWfVi1HLF48uzHJn" allowfullscreen></iframe>
export function validateIframeUrl(url) {
    const match = url.match(regex.sanitize);
    if (!match || match.length !== 2) {
        return false;
    }
    return `${match[0]}`;
}