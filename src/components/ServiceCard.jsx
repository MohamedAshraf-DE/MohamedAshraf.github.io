import PropTypes from "prop-types";

const ServiceCard = ({ icon, title, description, index = 0 }) => {
    return (
        <div
            className="animate-fade-in-up group flex items-center gap-4 rounded-xl border-2 border-cyan-400/50 bg-black/40 p-4 backdrop-blur-md
                 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]
                 hover:bg-black/60 hover:border-cyan-300 transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-400/30 shrink-0">
                <img src={icon} alt="" className="h-7 w-7 object-contain brightness-125" />
            </div>

            <div className="min-w-0 flex flex-col justify-center">
                <h3 className="text-white font-bold text-lg sm:text-xl font-poppins leading-tight uppercase tracking-tight">
                    {title}
                </h3>
                <p className="mt-0.5 text-cyan-100/70 text-sm font-worksans tracking-wide">
                    {description}
                </p>
            </div>
        </div>
    );
};

ServiceCard.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    index: PropTypes.number,
};

export default ServiceCard;
