import {
    VerticalTimeline,
    VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { useContext } from "react";

import { CTA } from "../components";
import { experiences, skills } from "../constants";
import { ThemeContext } from "../context/ThemeContext";

import "react-vertical-timeline-component/style.min.css";

const About = () => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    return (
        <section className='max-container animate-fade-in-up'>
            <h1 className='head-text dark:text-white'>
                Hello, I'm{" "}
                <span className='font-semibold blue-gradient_text drop-shadow'>
                    Mohamed Ashraf
                </span>{" "}
                👋
            </h1>

            <div className='flex flex-col gap-3 mt-5 text-slate-500 dark:text-slate-300'>
                <p>
                    Computer and Communication Engineering student based in Egypt, passionate about Artificial Intelligence and Machine Learning, with experience building predictive models, data-driven applications, and interactive software projects.
                </p>
            </div>

            <div className='flex flex-col py-10'>
                {/* Gradient applied to subhead */}
                <h3 className='subhead-text blue-gradient_text drop-shadow font-semibold'>My Skills</h3>

                <div className='flex flex-wrap gap-12 mt-16'>
                    {skills.map((skill, index) => (
                        <div
                            className='w-20 h-20 block-container animate-fade-in-up'
                            key={skill.name}
                            style={{ animationDelay: `${index * 100}ms` }} // Staggered Animation
                        >
                            <div className='btn-back rounded-xl' />
                            <div className='flex items-center justify-center btn-front rounded-xl dark:bg-slate-100'>
                                <img
                                    src={skill.imageUrl}
                                    alt={skill.name}
                                    className='object-contain w-1/2 h-1/2'
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className='py-16'>
                {/* Gradient applied to subhead */}
                <h3 className='subhead-text blue-gradient_text drop-shadow font-semibold'>Work Experience.</h3>
                <div className='flex flex-col gap-3 mt-5 text-slate-500 dark:text-slate-300'>
                    <p>
                        I've worked with all sorts of companies, leveling up my skills and
                        teaming up with smart people. Here's the rundown:
                    </p>
                </div>

                <div className='flex mt-12'>
                    <VerticalTimeline>
                        {experiences.map((experience, index) => (
                            <VerticalTimelineElement
                                key={experience.company_name}
                                date={experience.date}
                                iconStyle={{ background: experience.iconBg }}
                                icon={
                                    <div className='flex items-center justify-center w-full h-full'>
                                        <img
                                            src={experience.icon}
                                            alt={experience.company_name}
                                            className='w-[60%] h-[60%] object-contain'
                                        />
                                    </div>
                                }
                                contentStyle={{
                                    borderBottom: "8px",
                                    borderStyle: "solid",
                                    borderBottomColor: experience.iconBg,
                                    boxShadow: "none",
                                    background: isDark ? '#1e293b' : '#fff', // slate-800
                                    color: isDark ? '#fff' : '#000',
                                }}
                                contentArrowStyle={{
                                    borderRight: `7px solid ${isDark ? '#1e293b' : '#fff'}`
                                }}
                            >
                                <div>
                                    <h3 className='text-xl font-semibold text-black dark:text-white font-poppins'>
                                        {experience.title}
                                    </h3>
                                    <p
                                        className='text-base font-medium text-black-500 dark:text-slate-400'
                                        style={{ margin: 0 }}
                                    >
                                        {experience.company_name}
                                    </p>
                                </div>

                                <ul className='my-5 ml-5 space-y-2 list-disc'>
                                    {experience.points.map((point, index) => (
                                        <li
                                            key={`experience-point-${index}`}
                                            className='pl-1 text-sm font-normal text-black-500/50 dark:text-slate-300'
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

            <hr className='border-slate-200 dark:border-slate-700' />

            <CTA />
        </section>
    );
};

export default About;