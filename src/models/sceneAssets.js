export function sceneAsset(path, compact = false) {
    return `/scene-assets/${compact ? 'mobile/' : ''}${path}`;
}
