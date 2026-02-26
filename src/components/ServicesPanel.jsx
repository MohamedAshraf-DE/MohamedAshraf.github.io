import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import ServiceItem from "./ServiceItem";

const ServicesPanel = ({ items }) => {
    return (
        <div
            className="animate-fade-in-up flex flex-col items-start"
            style={{ animationDelay: "40ms" }}
        >
            <div className="mb-4 pl-2">
                <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-wide drop-shadow-md">
                    Our Services
                </h2>
                <p className="mt-1 text-cyan-100/80 text-sm tracking-widest uppercase">
                    What I can help you build
                </p>
            </div>

            {/* Vertically stacked neon cards collection */}
            <div className="flex flex-col gap-0 w-full max-w-[400px]">
                {items.map((s, idx) => (
                    <ServiceItem
                        key={s.title}
                        icon={s.icon}
                        title={s.title}
                        description={s.description}
                        delay={80 + idx * 90}
                        isFirst={idx === 0}
                        isLast={idx === items.length - 1}
                    />
                ))}
            </div>

            <div className="mt-8 w-full max-w-[400px]">
                <Link
                    to="/contact"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:bg-cyan-500/20 transition-all duration-300 uppercase tracking-widest"
                >
                    Let’s Work Together
                </Link>
            </div>
        </div>
    );
};

ServicesPanel.propTypes = {
    items: PropTypes.array.isRequired,
};

export default ServicesPanel;
