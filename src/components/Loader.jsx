import { Html, useProgress } from "@react-three/drei";

const Loader = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="scene-loading" role="status">
                Preparing your island · {Math.round(progress)}%
                <progress aria-label="Loading island" value={progress} max="100" />
            </div>
        </Html>
    );
};

export default Loader;
