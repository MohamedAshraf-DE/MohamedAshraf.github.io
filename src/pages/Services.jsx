import { NavLink } from "react-router-dom";
import {
    servicesAnalytics,
    servicesEngineering,
    servicesMl,
    servicesBackend,
    servicesFrontend,
    servicesEmbedded,
    servicesSql
} from "../assets/images";

const Services = () => {
    const services = [
        { image: servicesAnalytics, title: "Predictive Analytics" },
        { image: servicesMl, title: "Machine Learning & AI" },
        { image: servicesSql, title: "Database Architecture" },
        { image: servicesBackend, title: "Signal Processing & DSP" },
        { image: servicesFrontend, title: "Interactive Dashboards" },
        { image: servicesEmbedded, title: "Embedded & Systems" },
    ];

    const miniNav = [
        { label: "Home", to: "/" },
        { label: "Projects", to: "/projects" },
        { label: "Services", to: "/services" },
        { label: "Certificates", to: "/certificates" },
        { label: "Contact", to: "/contact" },
    ];

    return (
        <section className="relative min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-[#131521] transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-6 sm:px-14 pt-[126px] pb-16 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">

                {/* Header Section */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-slate-800 dark:text-[#f5f5f5] text-4xl sm:text-5xl font-serif font-light mb-4">
                        What I offer
                    </h1>

                    {/* Golden Separator */}
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-[1px] w-16 bg-[#cfa860]"></div>
                        <div className="w-2 h-2 rotate-45 border border-[#cfa860]"></div>
                        <div className="h-[1px] w-16 bg-[#cfa860]"></div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-8 w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {services.map((service, index) => (
                        <div key={index} className="relative group mx-auto w-full max-w-[320px]">
                            {/* Golden Offset Border Bracket (Left & Bottom) */}
                            <div className="absolute -left-4 -bottom-4 w-[calc(100%+20px)] h-[calc(100%+20px)] border-l-2 border-b-2 border-[#cfa860] z-0 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"></div>

                            {/* Main Card Content */}
                            <div className="relative z-10 flex flex-col h-full bg-white dark:bg-[#1a1c29] shadow-lg dark:shadow-none">
                                {/* Image Container */}
                                <div className="h-[220px] w-full overflow-hidden border-b border-gray-100 dark:border-[#cfa860]/20 bg-gray-50 dark:bg-[#1a1c29]">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>

                                {/* Text Box */}
                                <div className="p-6 text-center border-t border-transparent dark:border-white/5 bg-white dark:bg-[#171925]">
                                    <h3 className="text-slate-800 dark:text-white text-xl sm:text-2xl font-serif tracking-wide">
                                        {service.title}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mini Navigation (Optional, kept from previous iteration but styled cleanly) */}
                <div className="mt-20 border-t border-gray-200 dark:border-white/10 pt-8 w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <nav className="flex flex-wrap justify-center items-center gap-6 text-sm">
                        {miniNav.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `transition-colors uppercase tracking-widest font-serif text-xs ${isActive ? "text-[#cfa860]" : "text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white"
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

            </div>
        </section>
    );
};

export default Services;
