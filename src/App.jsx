import {
    Route,
    BrowserRouter as Router,
    Routes,
    useLocation,
} from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import { Footer, Navbar, FilmBurnTransition } from "./components";
import { About, Contact, Home, Projects, Certificates, Services, RecruiterMode } from "./pages";
import { soundoff, soundon } from "./assets/icons";
import godfather from "./assets/godfather_clean.webm";

const AnimatedRoutes = () => {
    const location = useLocation();

    // Contact without wrapper animations
    const wrapperClass = location.pathname === "/contact" ? "" : "animate-fade-in-up";

    return (
        <div key={location.pathname} className={wrapperClass}>
            <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/services" element={<Services />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/recruiter" element={<RecruiterMode />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>
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
    const audioRef = useRef(new Audio(godfather));
    audioRef.current.volume = 0.4;
    audioRef.current.loop = true;

    const [isPlayingMusic, setIsPlayingMusic] = useState(false);

    useEffect(() => {
        if (isPlayingMusic) {
            audioRef.current.play();
        }

        return () => {
            audioRef.current.pause();
        };
    }, [isPlayingMusic]);

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