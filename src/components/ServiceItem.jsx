import PropTypes from "prop-types";

const ServiceItem = ({ icon, title, description, delay = 0, isFirst, isLast }) => {
    return (
        <div
            className={`animate-fade-in-up relative group flex gap-4 bg-slate-950/60 backdrop-blur-md border border-cyan-400/50 p-4 sm:p-5 hover:bg-slate-900/80 transition-all duration-300
            ${isFirst ? "rounded-t-2xl" : ""} ${isLast ? "rounded-b-2xl" : ""} 
            ${!isLast ? "border-b-0" : ""}
            hover:shadow-[inset_0_0_20px_rgba(34,211,238,0.2)] shadow-[0_0_15px_rgba(34,211,238,0.1)]`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Left glowing edge highlight on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

            <div className="h-12 w-12 rounded-full border-2 border-cyan-400/60 bg-cyan-950/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                <img src={icon} alt="" className="h-6 w-6 object-contain brightness-150" />
            </div>

            <div className="min-w-0 flex flex-col justify-center">
                <h4 className="text-white font-semibold text-base sm:text-lg tracking-wide drop-shadow-md">
                    {title}
                </h4>
                <p className="mt-1 text-cyan-50/70 text-xs sm:text-sm leading-relaxed tracking-wider font-light">
                    {description}
                </p>
            </div>
        </div>
    );
};

ServiceItem.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    delay: PropTypes.number,
    isFirst: PropTypes.bool,
    isLast: PropTypes.bool
};

export default ServiceItem;
