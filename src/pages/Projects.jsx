import { Link } from "react-router-dom";
import { useState } from "react";

import { CTA } from "../components";
import { projects } from "../constants";
import { arrow } from "../assets/icons";

const Projects = () => {
    // 1. Extract unique categories (including 'All')
    const categories = ['All', ...new Set(projects.map((project) => project.category || 'Others'))];

    // 2. State for active filter
    const [filter, setFilter] = useState('All');

    // 3. Filtered projects based on state
    const filteredProjects = filter === 'All'
        ? projects
        : projects.filter((project) => (project.category || 'Others') === filter);

    return (
        <section className='max-container animate-fade-in-up'>
            <h1 className='head-text'>
                My <span className='blue-gradient_text drop-shadow font-semibold'>Projects</span>
            </h1>

            <p className='text-slate-500 mt-2 leading-relaxed'>
                I've embarked on numerous projects throughout the years, but these are
                the ones I hold closest to my heart. Many of them are open-source, so
                if you come across something that piques your interest, feel free to explore the codebase and contribute your ideas
                for further enhancements. Your collaboration is highly valued!
            </p>

            {/* Filter Buttons */}
            <div className='flex flex-wrap gap-3 mt-10 mb-8'>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setFilter(category)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                            ${filter === category
                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-10'>
                {filteredProjects.map((project, index) => (
                    <div
                        className='project-card flex flex-col group animate-fade-in-up'
                        key={project.name}
                        style={{ animationDelay: `${index * 100}ms` }} // Staggered delay
                    >
                        {/* Colored Header with Icon or Image */}
                        <div className={`card-header ${project.theme.replace('btn-back', 'bg-gradient')}`}>
                            {/* Only show blur overlay for ICON projects (no image) */}
                            {!project.imageUrl && (
                                <div className='absolute inset-0 bg-white/10 backdrop-blur-[2px] z-10' />
                            )}

                            {project.imageUrl ? (
                                <img
                                    src={project.imageUrl}
                                    alt={project.name}
                                    // Removed opacity-90, now opacity-100 for Crystal Clear images
                                    className='w-full h-full object-cover absolute inset-0 z-0 opacity-100 group-hover:scale-110 transition-transform duration-500'
                                    style={{ objectPosition: 'center' }}
                                />
                            ) : (
                                <img
                                    src={project.iconUrl}
                                    alt={project.name}
                                    className='card-header-icon relative z-20 group-hover:scale-110 transition-transform duration-500'
                                />
                            )}
                        </div>

                        {/* Card Body */}
                        <div className='p-6 flex flex-col flex-1 bg-white relative z-20'>
                            <div className='flex flex-wrap justify-between items-start gap-2 mb-4'>
                                <h4 className='text-xl font-bold font-poppins text-slate-800 leading-tight break-words min-w-0 pr-2'>
                                    {project.name}
                                </h4>
                                {project.category && (
                                    <span className='tag-pill whitespace-nowrap flex-shrink-0'>
                                        {project.category}
                                    </span>
                                )}
                            </div>

                            <p className='text-slate-500 text-sm leading-relaxed mb-6 flex-1'>
                                {project.description}
                            </p>

                            <div className='mt-auto flex justify-between items-center'>
                                {project.link && (
                                    <Link
                                        to={project.link}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700 transition-colors text-sm'
                                    >
                                        Visit Site
                                        <img
                                            src={arrow}
                                            alt='arrow'
                                            className='w-3 h-3 object-contain'
                                        />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <hr className='border-slate-200' />

            <CTA />
        </section>
    );
};

export default Projects;