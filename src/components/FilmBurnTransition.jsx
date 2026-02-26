import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const FilmBurnTransition = ({
    triggerPath = "/services",
    duration = 650,
    disabledPreviousPaths = ["/contact"],
}) => {
    const location = useLocation();
    const [active, setActive] = useState(false);

    const first = useRef(true);
    const prevPath = useRef(location.pathname);

    useEffect(() => {
        const current = location.pathname;
        const prev = prevPath.current;

        if (first.current) {
            first.current = false;
            prevPath.current = current;
            return;
        }

        const enteringServices = current === triggerPath && prev !== triggerPath;
        const blocked = disabledPreviousPaths.includes(prev);

        if (enteringServices && !blocked) {
            setActive(true);
            const t = setTimeout(() => setActive(false), duration);
            prevPath.current = current;
            return () => clearTimeout(t);
        }

        prevPath.current = current;
    }, [location.pathname, triggerPath, duration, disabledPreviousPaths]);

    if (!active) return null;

    return (
        <div
            className="film-burn"
            style={{ "--burn-duration": `${duration}ms` }}
            aria-hidden="true"
        />
    );
};

export default FilmBurnTransition;
