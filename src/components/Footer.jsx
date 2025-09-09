import { socialLinks } from "../constants";

const Footer = () => {
    return ( <
        footer className = "footer font-poppins" >
        <
        hr className = "border-slate-200" / >

        <
        div className = "footer-container" >
        <
        p > ©2025 < strong > Mohamed Ashraf < /strong>. All rights reserved.</p >

        <
        div className = "flex items-center justify-center gap-3 mt-2" > {
            socialLinks.map((link) => ( <
                a key = { link.name }
                href = { link.link }
                target = "_blank"
                rel = "noopener noreferrer"
                className = "transition-transform hover:scale-110" >
                <
                img src = { link.iconUrl }
                alt = { link.name }
                className = "object-contain w-6 h-6" /
                >
                <
                /a>
            ))
        } <
        /div> <
        /div> <
        /footer>
    );
};

export default Footer;