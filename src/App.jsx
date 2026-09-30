import {
    Route,
    BrowserRouter as Router,
    Routes,
    useLocation,
} from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";

import Footer from './components/Footer';
import Navbar from './components/Navbar';
import FilmBurnTransition from './components/FilmBurnTransition';
import { soundoff, soundon } from "./assets/icons";
import godfather from "./assets/godfather_clean.webm";

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Projects = lazy(() => import('./pages/Projects'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const RecruiterMode = lazy(() => import('./pages/RecruiterMode'));

const AnimatedRoutes = () => {
    const location = useLocation();

    // The island appears as soon as its first frame is ready, without a route fade.
    const wrapperClass = location.pathname === "/contact" || location.pathname === "/" ? "" : "animate-fade-in-up";

    return (
        <div key={location.pathname} className={wrapperClass}>
            <Suspense fallback={<div className="route-loading" role="status"><span className="loading-orbit" aria-hidden="true" /><span>{location.pathname === '/' ? 'Opening your island…' : 'Opening page…'}</span></div>}>
            <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/services" element={<Services />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/recruiter" element={<RecruiterMode />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>
            </Suspense>
        </div>
    );
};

const GlobalAudioToggle = ({ isPlayingMusic, setIsPlayingMusic }) => {
    const location = useLocation();

    // On Recruiter Mode mobile and desktop, top-center overlaps with the layout header.
    // So we use bottom-6 left-6 universally for Recruiter Mode.
    // Otherwise, we use top-center for mobile and bottom-left for desktop.
    const containerClasses = location.pathname === "/recruiter"
        ? "fixed bottom-6 left-6 z-50"
        : "fixed top-4 left-1/2 -translate-x-1/2 sm:top-auto sm:translate-x-0 sm:bottom-6 sm:left-6 z-50";

    return (
        <div className={containerClasses}>
            <img
                src={!isPlayingMusic ? soundoff : soundon}
                alt='jukebox'
                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                className='w-10 h-10 cursor-pointer object-contain drop-shadow-md hover:scale-110 transition-transform'
            />
        </div>
    );
};

const App = () => {
    const [music] = useState(() => {
        const audio = new Audio(godfather);
        // Keep the soundtrack out of the initial island download.
        audio.preload = 'none';
        audio.volume = 0.4;
        audio.loop = true;
        return audio;
    });

    const [isPlayingMusic, setIsPlayingMusic] = useState(false);

    useEffect(() => {
        if (isPlayingMusic) {
            music.play().catch(() => setIsPlayingMusic(false));
        }

        return () => {
            music.pause();
        };
    }, [isPlayingMusic, music]);

    return (
        <main className="bg-slate-300/20 dark:bg-slate-900 transition-colors duration-500 relative">
            <Router>
                <Navbar />

                {/* Global Music Toggle */}
                <GlobalAudioToggle
                    isPlayingMusic={isPlayingMusic}
                    setIsPlayingMusic={setIsPlayingMusic}
                />

                {/* Burn only on entering Services, blocked if from Contact */}
                <FilmBurnTransition
                    triggerPath="/services"
                    disabledPreviousPaths={["/contact"]}
                    duration={650}
                />

                <AnimatedRoutes />
                <Footer />
            </Router>
        </main>
    );
};

export default App;
