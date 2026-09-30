import { useProgress } from '@react-three/drei';

export default function SceneLoading() {
    const { progress } = useProgress();
    return <div className="scene-loading-overlay" role="status" aria-live="polite">
        <span className="loading-orbit" aria-hidden="true" />
        <strong>{progress >= 100 ? 'Preparing the 3D view…' : 'Bringing your island to life…'}</strong>
        <progress aria-label="Loading island" value={progress || undefined} max="100" />
        <span>Castle, clouds & a little magic</span>
    </div>;
}
