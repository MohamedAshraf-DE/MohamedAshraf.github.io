import {
    Route,
    BrowserRouter as Router,
    Routes,
    useLocation,
} from "react-router-dom";

import { Footer, Navbar, FilmBurnTransition } from "./components";
import { About, Contact, Home, Projects, Certificates, Services } from "./pages";

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
                <Route path="/contact" element={<Contact />} />
            </Routes>
        </div>
    );
};

const App = () => {
    return (
        <main className="bg-slate-300/20 dark:bg-slate-900 transition-colors duration-500">
            <Router>
                <Navbar />

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