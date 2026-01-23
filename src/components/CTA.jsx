import { Link } from "react-router-dom";

const CTA = () => {
    return (
        <section className='cta'>
            <p className='cta-text'>
                Have a project in mind? <br className='sm:block hidden' />
                Let’s build something together!
            </p>
            <Link
                to='/contact'
                className='btn bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white hover:scale-105 transition-transform duration-200 shadow-lg border-none'
            >
                Contact
            </Link>
        </section>
    );
};

export default CTA;