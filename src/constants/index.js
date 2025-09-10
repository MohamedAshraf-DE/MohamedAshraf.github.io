import {} from "../assets/images";
import {
    contact,
    github,
    linkedin,
    // new icons
    java,
    sql,
    python,
    c,
    powerbi,
    react,
    tailwindcss,
    nodejs,
    upwork,
    khamsat_1,
    anu,
    nti,
    depi,
    island,
    mostaql, // ✅ import Mostaql icon
} from "../assets/icons";

// ====================== Skills ======================
export const skills = [
    { imageUrl: python, name: "Python", type: "Programming Language" },
    { imageUrl: sql, name: "SQL", type: "Database" },
    { imageUrl: java, name: "Java", type: "Programming Language" },
    { imageUrl: c, name: "C", type: "Programming Language" },
    { imageUrl: react, name: "React", type: "Frontend" },
    { imageUrl: tailwindcss, name: "TailwindCSS", type: "Frontend" },
    { imageUrl: nodejs, name: "Node.js", type: "Backend" },
    { imageUrl: powerbi, name: "Power BI", type: "Data Visualization" },
];

// ====================== Experiences / Timeline ======================
export const experiences = [{
        title: "Expected Graduation",
        company_name: "Alexandria National University",
        iconBg: "#a2d2ff",
        date: "2027",
        icon: anu,
        points: ["B.Sc. in Computer and Communications Engineering."],
    },
    {
        title: "Machine Learning for Data Analysis",
        company_name: "NTI",
        iconBg: "#f0c987",
        date: "2025",
        icon: nti,
        points: [
            "Learned ML concepts and applied them to real datasets.",
            "Built predictive models and data pipelines.",
        ],
    },
    {
        title: "Data Analysis with Power BI",
        company_name: "Ro2ad Masr Digital Initiative",
        iconBg: "#fbc3bc",
        date: "2025",
        icon: depi,
        points: [
            "Learned Power BI, DAX, and Excel.",
            "Built real-world dashboards.",
        ],
    },
    {
        title: "Developed Ashraf Game",
        company_name: "Personal Project",
        iconBg: "#b7e4c7",
        date: "2023",
        icon: island,
        points: ["Created a 3D interactive game with React + Three.js."],
    },
];

// ====================== Social Links ======================
export const socialLinks = [
    { name: "Contact", iconUrl: contact, link: "/contact" },
    { name: "GitHub", iconUrl: github, link: "https://github.com/MohamedAshraf-DE/MohamedAshraf.github.io" },
    { name: "LinkedIn", iconUrl: linkedin, link: "https://www.linkedin.com/in/mohamed--ashraff" },

    // ✅ Freelance platforms grouped together
    { name: "Upwork", iconUrl: upwork, link: "https://www.upwork.com/freelancers/~0190a07e5b17474f9f?mp_source=share" },
    { name: "Khamsat", iconUrl: khamsat_1, link: "https://khamsat.com/user/mohamed_ashraf124" },
    { name: "Mostaql", iconUrl: mostaql, link: "https://mostaql.com/u/MohamedA_Data" },
];

// ====================== Projects ======================
export const projects = [{
        iconUrl: powerbi,
        theme: "btn-back-yellow",
        name: "HR Dashboard",
        description: "An HR analytics dashboard project built with Power BI to visualize employee insights and improve decision-making.",
        link: "",
    },
    {
        iconUrl: java,
        theme: "btn-back-red",
        name: "Banking System",
        description: "A Java-based banking management system implementing core OOP principles for handling accounts and transactions.",
        link: "",
    },
    {
        iconUrl: powerbi,
        theme: "btn-back-green",
        name: "Uber Dashboard",
        description: "A data analytics dashboard built with Power BI to analyze Uber ride data and extract customer and driver insights.",
        link: "",
    },
    {
        iconUrl: python,
        theme: "btn-back-blue",
        name: "Uber Booking ML Model",
        description: "A machine learning model to predict Uber booking demand using Python and data science libraries.",
        link: "",
    },
];