import { NavLink } from "react-router-dom";
import mylogo from "../assets/images/mylogo.png";

const Navbar = () => {
    return ( <
        header className = 'flex items-center justify-between px-4 py-2 header' > { /* Clickable Rounded Logo to LinkedIn */ } <
        a href = "https://www.linkedin.com/in/mohamed-ashraf-de/"
        target = "_blank"
        rel = "noopener noreferrer" >
        <
        img src = { mylogo }
        alt = 'Mohamed Ashraf Logo'
        className = 'object-cover w-20 h-20 transition-transform duration-200 rounded-full hover:scale-105 hover:shadow-xl' /
        >
        <
        /a>

        { /* Navigation Links */ } <
        nav className = 'flex text-lg font-medium gap-7' >
        <
        NavLink to = '/about'
        className = {
            ({ isActive }) =>
            isActive ? "text-blue-600" : "text-black"
        } >
        About <
        /NavLink> <
        NavLink to = '/projects'
        className = {
            ({ isActive }) =>
            isActive ? "text-blue-600" : "text-black"
        } >
        Projects <
        /NavLink> <
        /nav> <
        /header>
    );
};

export default Navbar;