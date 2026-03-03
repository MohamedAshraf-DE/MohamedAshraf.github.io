import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { skills, experiences, projects, socialLinks } from "../constants";
import cv from "../assets/images/Mohamed_Ashraf_CV.pdf";
import mylogo from "../assets/images/mylogo.png";
import nvidia from "../assets/images/nvidia.png";
import andrew from "../assets/images/andrew.png";
import A2 from "../assets/images/A2.png";
import depi from "../assets/images/depi.png";
import mlCertificate from "../assets/images/creativa.png";
import hero_ml_photo from "../assets/images/me.jpeg";

import emailjs from "@emailjs/browser";
import { useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment } from "@react-three/drei";
import useAlert from "../hooks/useAlert";
import { Alert } from "../components";
import { LoginCharacters } from "../models";

import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

const RecruiterMode = () => {
    const [scrolled, setScrolled] = useState(false);

    // Contact form state
    const formRef = useRef();
    const canvasRef = useRef();
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const { alert, showAlert, hideAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState("idle");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleChange = ({ target: { name, value } }) => {
        setForm({ ...form, [name]: value });
    };

    const handleFocus = (fieldName) => {
        if (fieldName === "message") {
            setFormState("typing");
        } else {
            setFormState("idle");
        }
    };

    const handleBlur = () => {
        setFormState("idle");
    };

    const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        setMousePos({ x, y });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        emailjs
            .send(
                import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
                {
                    from_name: form.name,
                    from_email: form.email,
                    message: form.message,
                },
                import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
            )
            .then(
                () => {
                    setLoading(false);
                    setFormState("success");
                    showAlert({ show: true, text: "✅ Thank you! Your message has been sent successfully.", type: "success" });
                    setTimeout(() => { hideAlert(); setForm({ name: "", email: "", message: "" }); setFormState("idle"); }, 3000);
                },
                (error) => {
                    setLoading(false);
                    setFormState("error");
                    showAlert({ show: true, text: "❌ Something went wrong. Please try again.", type: "danger" });
                    setTimeout(() => { setFormState("idle"); }, 2000);
                }
            );
    };

    const certificates = [
        {
            id: 1,
            name: "NVIDIA Deep Learning Certificate",
            issuer: "NVIDIA",
            image: nvidia,
            description: "Completed comprehensive training in deep learning fundamentals, neural networks, and AI model development. This certification demonstrates proficiency in building and deploying deep learning solutions using NVIDIA's cutting-edge technologies and frameworks.",
            date: "2024",
            skills: ["Deep Learning", "Neural Networks", "AI Development", "GPU Computing"]
        },
        {
            id: 2,
            name: "Machine Learning Specialization",
            issuer: "Andrew Ng - Stanford University",
            image: andrew,
            description: "Successfully completed Andrew Ng's renowned Machine Learning course covering supervised learning, unsupervised learning, and best practices in machine learning. Gained hands-on experience with algorithms including linear regression, logistic regression, neural networks, and more.",
            date: "2024",
            skills: ["Machine Learning", "Python", "Algorithms", "Data Analysis"]
        },
        {
            id: 3,
            name: "Unsupervised Learning, Recommenders, Reinforcement Learning",
            issuer: "DeepLearning.AI & Stanford University - Coursera",
            image: A2,
            description: "Advanced course covering unsupervised learning techniques including clustering and anomaly detection, building recommender systems with collaborative filtering and content-based filtering, and fundamentals of reinforcement learning.",
            date: "2026",
            skills: ["Unsupervised Learning", "Recommender Systems", "Reinforcement Learning", "Anomaly Detection"]
        },
        {
            id: 4,
            name: "Data Analytics - Microsoft Power BI Specialist",
            issuer: "Digital Egypt Pioneers Program (DEPI) - MCIT",
            image: depi,
            description: "Completed an intensive 6-month specialized program in Data Analytics, focusing on Microsoft Power BI. Gained expertise in data modeling, visualization, and business intelligence to drive data-driven decision making.",
            date: "2025",
            skills: ["Power BI", "Data Analytics", "Data Visualization", "Business Intelligence", "Query Editor"]
        },
        {
            id: 5,
            name: "Machine Learning for Data Analysis",
            issuer: "Digital Egypt Youth Program / NTI",
            image: mlCertificate,
            description: "Completed the Machine Learning for Data Analysis program (Technical 90 hrs + Freelancing 30 hrs). Focused on practical ML workflows, model evaluation, and data-driven solutions.",
            date: "17/08/2025 - 10/10/2025",
            skills: ["Machine Learning", "Data Analysis", "Model Evaluation", "Python"]
        }
    ];

    useEffect(() => {
        // Scroll to top when entering the page
        window.scrollTo(0, 0);

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">

            {/* Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-zinc-950/90 backdrop-blur-md text-white border-b border-zinc-800 shadow-sm py-4" : "bg-transparent text-zinc-100 py-6"}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="font-bold text-xl tracking-tight text-white group cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-3">
                        <img src={mylogo} alt="Logo" className="w-8 h-8 object-contain" />
                        <span>Mohamed <span className="text-emerald-500">Ashraf</span></span>
                    </div>
                    <div className="hidden lg:flex gap-6 items-center text-sm font-medium">
                        <a href="#home" className="hover:text-emerald-400 transition-colors">Home</a>
                        <a href="#about" className="hover:text-emerald-400 transition-colors">About</a>
                        <a href="#skills" className="hover:text-emerald-400 transition-colors">Skills</a>
                        <a href="#experience" className="hover:text-emerald-400 transition-colors">Experience</a>
                        <a href="#projects" className="hover:text-emerald-400 transition-colors">Projects</a>
                        <a href="#certificates" className="hover:text-emerald-400 transition-colors">Certificates</a>
                        <a href="#contact" className="hover:text-emerald-400 transition-colors">Contact</a>
                        <Link to="/" className={`px-4 py-1.5 border rounded-lg transition-all ${scrolled ? "bg-emerald-500 text-zinc-950 border-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-transparent text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/10"}`}>3D Mode</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <motion.section
                id="home"
                className="relative pt-32 pb-24 px-6 min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Decorative elements - Neon Glows */}
                <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none"></div>

                <div className="max-w-6xl mx-auto w-full z-10 animate-fade-in-up flex flex-col items-center">
                    {/* Top Hero Card Split */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full mt-8 mb-16">
                        {/* Profile Picture - Left */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.3)] border-2 border-emerald-500/40 group flex-shrink-0 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_60px_rgba(16,185,129,0.6)]">
                            <div className="absolute inset-0 rounded-[2rem] border-2 border-emerald-400/50 group-hover:border-emerald-400/90 group-hover:shadow-[inset_0_0_60px_rgba(16,185,129,0.5)] transition-all duration-500 z-10 pointer-events-none"></div>
                            <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay z-10 pointer-events-none"></div>
                            <img src={hero_ml_photo} alt="Mohamed Ashraf" className="w-full h-full object-cover relative z-0 transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: "center top" }} />
                        </div>

                        {/* Name Layout - Right */}
                        <div className="flex flex-col text-center md:text-left justify-center px-4">
                            <div className="inline-block w-fit overflow-hidden whitespace-nowrap border-r-4 border-emerald-500 pr-2 animate-[typing_3s_steps(40,end),blink-caret_.75s_step-end_infinite]">
                                <h1 className="inline-block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white pb-2">
                                    Mohamed
                                </h1>
                                <span className="inline-block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] font-['Comic_Sans_MS',cursive] italic ml-4">
                                    Ashraf
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Content Area */}
                    <div className="flex flex-col items-center text-center max-w-3xl">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-200 mb-6 drop-shadow-md">
                            Machine Learning Developer
                        </h2>
                        <p className="text-base sm:text-lg text-zinc-400 mb-10 leading-relaxed max-w-2xl">
                            Passionate about creating innovative solutions and building scalable intelligent systems with a strong foundation in data-driven development and mathematical modeling.
                        </p>

                        {/* Stats Row */}
                        <div className="flex flex-wrap justify-center gap-8 sm:gap-16 mb-12 w-full">
                            <div className="flex flex-col items-center">
                                <span className="text-3xl md:text-4xl font-bold text-white mb-1">2+</span>
                                <span className="text-sm text-zinc-400 font-medium tracking-wide">Years Experience</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-3xl md:text-4xl font-bold text-white mb-1">10+</span>
                                <span className="text-sm text-zinc-400 font-medium tracking-wide">Projects Completed</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-3xl md:text-4xl font-bold text-white mb-1">98%</span>
                                <span className="text-sm text-zinc-400 font-medium tracking-wide">Client Satisfaction</span>
                            </div>
                        </div>

                        {/* Social Links Row */}
                        <div className="flex justify-center gap-5 mb-12">
                            <a href={socialLinks.find(l => l.name === 'GitHub')?.link || "#"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-700/80 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-500 text-zinc-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
                            </a>
                            <a href={socialLinks.find(l => l.name === 'LinkedIn')?.link || "#"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-700/80 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-500 text-zinc-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                            </a>
                            <a href="mailto:mohammed.ashraf.m.w@gmail.com" className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-700/80 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-500 text-zinc-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </a>
                        </div>

                        {/* Buttons Row */}
                        <div className="flex justify-center gap-4 mb-8">
                            <a href="#about" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-md transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]">
                                Learn More About Me
                            </a>
                            <a href={cv} download className="px-6 py-2.5 bg-transparent border border-zinc-500 hover:border-emerald-500 hover:text-emerald-400 text-zinc-300 font-semibold rounded-md transition-all hover:bg-emerald-500/10 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download CV
                            </a>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* About Section */}
            <motion.section
                id="about"
                className="py-24 px-6 bg-black border-t border-zinc-800/50"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
                <div className="max-w-6xl mx-auto flex flex-col items-center">
                    <h3 className="text-4xl font-bold text-white mb-2 text-center">About Me</h3>
                    <p className="text-zinc-500 text-center mb-16 max-w-xl font-medium">I'm a passionate machine learning developer with a love for creating smart digital experiences</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
                        {/* Left Column - Bio */}
                        <div className="flex flex-col gap-6 text-zinc-300 text-[15px] leading-[1.8]">
                            <p>
                                I'm Mohamed Ashraf Mohamed, a Machine Learning Developer from Egypt, with a passion for building innovative AI solutions that solve real-world problems. With expertise in modern algorithms and data architecture, I create systems that are both highly functional and intelligent.
                            </p>
                            <p>
                                I'm currently focused on expanding my skills in Data Engineering and advanced Machine Learning models. My journey into tech has been fueled by a passion for continuous learning, and I've gained deep experience through projects, competitions, and collaborations, focusing on end-to-end data pipelines.
                            </p>
                            <p>
                                When I'm not training models or wrangling data, I enjoy exploring new technologies, contributing to open-source, and sharing knowledge with the community. I'm always excited to take on new challenges and collaborate on interesting projects.
                            </p>
                        </div>

                        {/* Right Column - 4 Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] flex flex-col gap-3 group">
                                <div className="text-emerald-500 bg-emerald-500/10 w-fit p-3 rounded-xl group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                </div>
                                <h4 className="text-white font-bold text-lg mt-2">Clean Code</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">Writing maintainable, scalable, and efficient code with best practices</p>
                            </div>

                            <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] flex flex-col gap-3 group">
                                <div className="text-emerald-500 bg-emerald-500/10 w-fit p-3 rounded-xl group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                </div>
                                <h4 className="text-white font-bold text-lg mt-2">Data Science</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">End-to-end development from raw data mapping to ML deployment</p>
                            </div>

                            <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] flex flex-col gap-3 group">
                                <div className="text-emerald-500 bg-emerald-500/10 w-fit p-3 rounded-xl group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                </div>
                                <h4 className="text-white font-bold text-lg mt-2">Innovation</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">Always exploring new technologies and creative analytical solutions</p>
                            </div>

                            <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] flex flex-col gap-3 group">
                                <div className="text-emerald-500 bg-emerald-500/10 w-fit p-3 rounded-xl group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                </div>
                                <h4 className="text-white font-bold text-lg mt-2">Collaboration</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">Strong team player with excellent communication and Agile proficiency</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Wide Stats Bar */}
                    <div className="mt-20 w-full max-w-4xl bg-zinc-900/80 rounded-full border border-zinc-800 py-6 px-12 flex flex-wrap justify-between items-center shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all duration-500 hover:-translate-y-2 cursor-default group">
                        <div className="flex flex-col items-center flex-1 transition-transform duration-300 group-hover:scale-105">
                            <span className="text-3xl font-bold text-emerald-500 mb-1">2+</span>
                            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Years Experience</span>
                        </div>
                        <div className="h-10 w-px bg-zinc-800 hidden sm:block"></div>
                        <div className="flex flex-col items-center flex-1">
                            <span className="text-3xl font-bold text-emerald-500 mb-1">10+</span>
                            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Projects Completed</span>
                        </div>
                        <div className="h-10 w-px bg-zinc-800 hidden sm:block"></div>
                        <div className="flex flex-col items-center flex-1">
                            <span className="text-3xl font-bold text-emerald-500 mb-1">98%</span>
                            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Client Satisfaction</span>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Skills Section */}
            <motion.section
                id="skills"
                className="py-24 px-6 bg-black border-t border-zinc-800/50"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
                <div className="max-w-6xl mx-auto flex flex-col items-center">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-white mb-4">Core Technologies</h3>
                        <p className="text-zinc-500 max-w-2xl mx-auto font-medium">Tools and frameworks I use to build scalable machine learning and data engineering solutions</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-12 mt-8 max-w-5xl">
                        {skills.map((skill, index) => (
                            <div
                                className="w-20 h-20 block-container animate-fade-in-up group"
                                key={skill.name}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="btn-back rounded-xl bg-gradient-to-br from-emerald-500/50 to-emerald-900/50 group-hover:from-emerald-400 group-hover:to-emerald-600 transition-colors duration-300" />
                                <div className="flex items-center justify-center btn-front rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:border-emerald-500/50 transition-colors duration-300">
                                    <img
                                        src={skill.imageUrl}
                                        alt={skill.name}
                                        className="object-contain w-1/2 h-1/2 drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                {/* Skill Name Tooltip */}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-semibold text-emerald-400 whitespace-nowrap bg-black/80 px-2 py-1 rounded border border-emerald-500/30">
                                    {skill.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Experience Section */}
            <motion.section
                id="experience"
                className="py-24 px-6 bg-black border-t border-zinc-800/50"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-white mb-4">Work Experience</h3>
                        <p className="text-zinc-400 max-w-2xl mx-auto">My professional journey and the roles that have shaped my expertise</p>
                    </div>

                    <div className="flex mt-12 justify-center">
                        <VerticalTimeline lineColor="#27272a">
                            {experiences.map((experience, index) => (
                                <VerticalTimelineElement
                                    key={experience.company_name}
                                    date={experience.date}
                                    dateClassName="text-emerald-400 font-semibold tracking-wide ml-4"
                                    iconStyle={{ background: '#09090b', boxShadow: "0 0 0 4px #10b981, inset 0 2px 0 rgba(0,0,0,.08), 0 0 20px rgba(16,185,129,0.5)" }}
                                    icon={
                                        <div className='flex items-center justify-center w-full h-full rounded-full bg-zinc-900 border border-zinc-800'>
                                            <img
                                                src={experience.icon}
                                                alt={experience.company_name}
                                                className='w-[60%] h-[60%] object-contain drop-shadow-md'
                                            />
                                        </div>
                                    }
                                    contentStyle={{
                                        borderBottom: "4px",
                                        borderStyle: "solid",
                                        borderBottomColor: "#10b981",
                                        boxShadow: "0 4px 20px -2px rgba(0,0,0,0.5)",
                                        background: '#18181b', // zinc-900
                                        color: '#fff',
                                        borderRadius: '1rem',
                                        border: '1px solid #27272a' // zinc-800
                                    }}
                                    contentArrowStyle={{
                                        borderRight: `7px solid #27272a`
                                    }}
                                >
                                    <div>
                                        <h3 className='text-xl font-bold text-white font-poppins'>
                                            {experience.title}
                                        </h3>
                                        <p
                                            className='text-base font-semibold text-emerald-500'
                                            style={{ margin: 0 }}
                                        >
                                            {experience.company_name}
                                        </p>
                                    </div>

                                    <ul className='my-5 ml-5 space-y-2 list-disc marker:text-emerald-500'>
                                        {experience.points.map((point, index) => (
                                            <li
                                                key={`experience-point-${index}`}
                                                className='pl-1 text-sm font-normal text-zinc-400 leading-relaxed'
                                            >
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </VerticalTimelineElement>
                            ))}
                        </VerticalTimeline>
                    </div>
                </div>
            </motion.section>

            {/* Projects Section */}
            <motion.section
                id="projects"
                className="py-24 px-6 bg-black border-t border-zinc-800/50"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-white mb-4">Featured Projects</h3>
                        <p className="text-zinc-500 max-w-2xl mx-auto">A showcase of my recent work and personal projects that demonstrate my skills and creativity</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-10'>
                        {projects.map((project, index) => (
                            <div
                                className='bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-800 flex flex-col group hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-300'
                                key={project.name}
                            >
                                {/* Colored Header with Icon or Image */}
                                <div className={`card-header h-40 relative flex justify-center items-center ${project.theme.replace('btn-back', 'bg-gradient')}`}>
                                    {!project.imageUrl && (
                                        <div className='absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] z-10' />
                                    )}

                                    {project.imageUrl ? (
                                        <img
                                            src={project.imageUrl}
                                            alt={project.name}
                                            className='w-full h-full object-cover absolute inset-0 z-0 opacity-100 group-hover:scale-110 transition-transform duration-500'
                                            style={{ objectPosition: 'center' }}
                                        />
                                    ) : (
                                        <img
                                            src={project.iconUrl}
                                            alt={project.name}
                                            className='w-1/2 h-1/2 object-contain relative z-20 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                        />
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className='p-6 flex flex-col flex-1 relative z-20 bg-zinc-900'>
                                    <div className='flex flex-wrap justify-between items-start gap-2 mb-4'>
                                        <h4 className='text-xl font-bold font-poppins text-zinc-100 leading-tight break-words min-w-0 pr-2 group-hover:text-emerald-400 transition-colors'>
                                            {project.name}
                                        </h4>
                                        {project.category && (
                                            <span className='px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-semibold border border-emerald-500/20 whitespace-nowrap flex-shrink-0 tracking-wide uppercase'>
                                                {project.category}
                                            </span>
                                        )}
                                    </div>

                                    <p className='text-zinc-400 text-sm leading-relaxed mb-6 flex-1'>
                                        {project.description}
                                    </p>

                                    <div className='mt-auto flex justify-between items-center'>
                                        {project.link && (
                                            <a
                                                href={project.link}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='inline-flex items-center gap-2 font-semibold text-emerald-500 hover:text-emerald-400 transition-colors text-sm'
                                            >
                                                Visit Site
                                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7-7m7-7H3"></path>
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center flex-col items-center mt-8">
                        <a href="https://github.com/MohamedAshraf-DE" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-800/80 hover:text-emerald-400 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
                            View More on GitHub
                        </a>
                    </div>
                </div>
            </motion.section>

            {/* Certificates Section */}
            <motion.section
                id="certificates"
                className="py-24 px-6 bg-black border-t border-zinc-800/50"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-white mb-4">Certificates</h3>
                        <p className="text-zinc-500 max-w-2xl mx-auto text-lg">Professional certifications and achievements that showcase my commitment to continuous learning</p>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 my-10'>
                        {certificates.map((certificate, index) => (
                            <div
                                className='certificate-card flex flex-col group animate-fade-in-up bg-zinc-950 rounded-xl shadow-lg border border-zinc-800 overflow-hidden hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300'
                                key={certificate.id}
                            >
                                {/* Certificate Image */}
                                <div className='relative h-64 overflow-hidden bg-black flex items-center justify-center p-4 border-b border-zinc-900'>
                                    {/* Subtle green glow behind certificate image */}
                                    <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
                                    <img
                                        src={certificate.image}
                                        alt={certificate.name}
                                        className='w-full h-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100'
                                    />
                                </div>

                                {/* Certificate Details */}
                                <div className='p-6 flex flex-col flex-1'>
                                    <div className='mb-4'>
                                        <h3 className='text-2xl font-bold font-poppins text-zinc-100 mb-2 group-hover:text-emerald-400 transition-colors'>
                                            {certificate.name}
                                        </h3>
                                        <p className='text-emerald-500 font-semibold text-sm mb-1 uppercase tracking-wide'>
                                            {certificate.issuer}
                                        </p>
                                        <p className='text-zinc-500 text-sm font-mono'>
                                            {certificate.date}
                                        </p>
                                    </div>

                                    <p className='text-zinc-400 text-sm leading-relaxed mb-6 flex-1'>
                                        {certificate.description}
                                    </p>

                                    {/* Skills Tags */}
                                    <div className='flex flex-wrap gap-2 mt-auto'>
                                        {certificate.skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className='px-3 py-1 bg-emerald-500/5 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold rounded-full border uppercase tracking-wider'
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Contact Section */}
            <motion.section
                id="contact"
                className='relative flex flex-col justify-center items-center py-24 px-6 bg-black border-t border-zinc-800/50 overflow-hidden'
                onMouseMove={handleMouseMove}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >

                {/* Background glow for contact */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20" >
                    <div className="w-[800px] h-[800px] bg-emerald-600 rounded-full blur-[150px]"></div>
                </div>

                {
                    alert.show && (
                        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]">
                            <Alert {...alert} />
                        </div>
                    )
                }

                < div className='w-full max-w-6xl border border-zinc-800 bg-zinc-900 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-3xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-16 px-4 py-6 sm:px-8 relative z-10' >

                    {/* Left Panel: Contact Info */}
                    < div className='lg:w-1/3 w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-12 text-white shadow-lg flex flex-col justify-between lg:min-h-[500px] relative overflow-hidden' >
                        {/* Inner panel glow */}
                        < div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" ></div >

                        <div className="relative z-10">
                            <h2 className='text-3xl sm:text-4xl font-bold mb-6 font-poppins text-white'>Get in touch</h2>
                            <p className='text-zinc-400 mb-8 sm:mb-12 leading-relaxed text-lg'>
                                Whether you have a project in mind or just want to discuss the latest tech, I'm here to chat.
                            </p>

                            <div className='flex flex-col gap-8'>
                                {/* Address */}
                                <div className='flex items-start gap-5 group'>
                                    <span className='text-2xl group-hover:scale-110 group-hover:text-emerald-400 transition-transform'>📍</span>
                                    <div>
                                        <h4 className='font-semibold text-xl text-zinc-200'>Visit me</h4>
                                        <p className='text-emerald-500 text-sm'>Alexandria, Egypt</p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className='flex items-start gap-5 group'>
                                    <span className='text-2xl group-hover:scale-110 group-hover:text-emerald-400 transition-transform'>✉️</span>
                                    <div>
                                        <h4 className='font-semibold text-xl text-zinc-200'>Chat to me</h4>
                                        <p className='text-emerald-500 text-sm break-all'>mohammed.ashraf.m.w@gmail.com</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className='flex items-start gap-5 group'>
                                    <span className='text-2xl group-hover:scale-110 group-hover:text-emerald-400 transition-transform'>📞</span>
                                    <div>
                                        <h4 className='font-semibold text-xl text-zinc-200'>Call me</h4>
                                        <p className='text-emerald-500 text-sm'>+20 127 571 8500</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Icons */}
                        <div className='mt-12 relative z-10'>
                            <h4 className='font-semibold text-lg mb-4 text-zinc-400'>Social media</h4>
                            <div className='flex flex-wrap gap-4'>
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.link}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='transition-all w-10 h-10 bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:-translate-y-1 rounded-full flex items-center justify-center'
                                        title={link.name}
                                    >
                                        <img
                                            src={link.iconUrl}
                                            alt={link.name}
                                            className='w-5 h-5 object-contain invert mix-blend-screen opacity-80'
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div >

                    {/* Right Area: Form + 3D Floating Characters */}
                    < div className='lg:w-2/3 w-full flex flex-col pt-4 lg:pt-10' >

                        {/* Main Content Row */}
                        < div className="flex flex-col lg:flex-row gap-10 h-full" >

                            {/* Form Section */}
                            < div className='flex-1 flex flex-col justify-center' >
                                <form
                                    ref={formRef}
                                    onSubmit={handleSubmit}
                                    className='flex flex-col gap-8'
                                >
                                    <div className='flex flex-col gap-2'>
                                        <label className='font-bold text-zinc-400 text-xs uppercase tracking-widest'>Name</label>
                                        <input
                                            type='text'
                                            name='name'
                                            className='input bg-zinc-950/50 border-b-2 border-zinc-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white outline-none transition-all focus:bg-zinc-950 focus:shadow-[0_4px_20px_-10px_rgba(16,185,129,0.5)] placeholder:text-zinc-600'
                                            placeholder='What’s your name?'
                                            required
                                            value={form.name}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('name')}
                                            onBlur={handleBlur}
                                        />
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='font-bold text-zinc-400 text-xs uppercase tracking-widest'>Email</label>
                                        <input
                                            type='email'
                                            name='email'
                                            className='input bg-zinc-950/50 border-b-2 border-zinc-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white outline-none transition-all focus:bg-zinc-950 focus:shadow-[0_4px_20px_-10px_rgba(16,185,129,0.5)] placeholder:text-zinc-600'
                                            placeholder='What’s your email?'
                                            required
                                            value={form.email}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('email')}
                                            onBlur={handleBlur}
                                        />
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='font-bold text-zinc-400 text-xs uppercase tracking-widest'>Message</label>
                                        <textarea
                                            name='message'
                                            rows='4'
                                            className='textarea bg-zinc-950/50 border-b-2 border-zinc-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white outline-none transition-all resize-none focus:bg-zinc-950 focus:shadow-[0_4px_20px_-10px_rgba(16,185,129,0.5)] placeholder:text-zinc-600'
                                            placeholder='Write your message...'
                                            required
                                            value={form.message}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('message')}
                                            onBlur={handleBlur}
                                        />
                                    </div>

                                    <button
                                        type='submit'
                                        disabled={loading}
                                        className='btn w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-bold py-4 px-8 rounded-xl text-md transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] mt-4 tracking-wide uppercase'
                                    >
                                        {loading ? "Sending..." : "Send Message"}
                                    </button>
                                </form>
                            </div>

                            {/* 3D Container - No Background, Floating in Space */}
                            <div
                                ref={canvasRef}
                                className='lg:w-1/2 w-full h-[300px] lg:h-auto relative lg:min-h-[400px]'
                            >
                                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 7], fov: 45 }}>
                                    <Suspense fallback={null}>
                                        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />

                                        <ambientLight intensity={0.3} color="#ffffff" />
                                        <directionalLight
                                            position={[5, 10, 5]}
                                            intensity={1}
                                            color="#10b981"
                                            castShadow
                                            shadow-mapSize-width={1024}
                                            shadow-mapSize-height={1024}
                                        />
                                        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#38bdf8" />

                                        <LoginCharacters formState={formState} mousePos={mousePos} />

                                        <Environment preset="night" />
                                    </Suspense>
                                </Canvas>

                                {/* Privacy Badge */}
                                <div className={`absolute bottom-5 right-5 transition-opacity duration-300 ${formState === 'typing' ? 'opacity-100' : 'opacity-0'}`}>
                                    <span className="bg-zinc-950 border border-emerald-500/50 text-emerald-400 px-3 py-1.5 rounded-full text-xs shadow-[0_0_10px_rgba(16,185,129,0.2)] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Privacy Mode
                                    </span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </motion.section>

            {/* Footer / CTA padding */}
            <div className="py-10 bg-black text-center text-zinc-600 text-sm border-t border-zinc-800/50" >
                © {new Date().getFullYear()} Mohamed Ashraf Mohamed. All rights reserved.
            </div>
        </div>
    );
};

export default RecruiterMode;
