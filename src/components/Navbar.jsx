import { NavLink } from "react-router-dom";
import mylogo from "../assets/images/mylogo.png";
import cv from "../assets/images/Mohamed_Ashraf_CV.pdf";

const Navbar = () => {
    return (
        <header className="header flex items-center justify-between pl-1 pr-2 sm:px-4 py-2 absolute top-0 w-full z-10 bg-transparent">
            {/* Clickable Rounded Logo to LinkedIn */}
            <a
                href="https://www.linkedin.com/in/mohamed--ashraff/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 -ml-2 sm:ml-0"
            >
                <img
                    src={mylogo}
                    alt="Mohamed Ashraf Logo"
                    className="object-cover w-12 h-12 sm:w-20 sm:h-20 transition-transform duration-200 rounded-full hover:scale-105 hover:shadow-xl"
                />
            </a>

            {/* Navigation Links */}
            <nav className="flex text-sm sm:text-lg font-medium gap-2 sm:gap-7 flex-shrink-0">
                <NavLink
                    to="/about"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600" : "text-black"
                    }
                >
                    About
                </NavLink>

                <NavLink
                    to="/projects"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600" : "text-black"
                    }
                >
                    Projects
                </NavLink>

                <NavLink
                    to="/certificates"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600" : "text-black"
                    }
                >
                    Certificates
                </NavLink>

                <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600" : "text-black"
                    }
                >
                    Contact
                </NavLink>

                {/* CV Download Link */}
                <a
                    href={cv}
                    download="Mohamed_Ashraf_CV.pdf"
                    className="text-black transition-colors hover:text-blue-600"
                >
                    Download CV
                </a>
            </nav>
        </header>
    );
};

export default Navbar;