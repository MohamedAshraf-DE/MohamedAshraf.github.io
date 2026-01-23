import { Html } from "@react-three/drei";

const Loader = () => {
    return (
        <Html>
            <div className='w-20 h-20 border-4 border-t-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin shadow-lg' />
        </Html>
    );
};

export default Loader;