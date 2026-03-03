import { Link } from "react-router-dom";
import { arrow } from "../assets/icons";
import { egyptFlag } from "../assets/images";
import { useState, useEffect } from "react";

const HomeInfo = ({ currentStage }) => {
    // Typing Effect Logic
    const [text, setText] = useState("");
    const fullText = "Mohamed Ashraf";

    useEffect(() => {
        if (currentStage === 1) {
            let index = 0;
            const timer = setInterval(() => {
                setText(fullText.slice(0, index + 1));
                index++;
                if (index > fullText.length) clearInterval(timer);
            }, 100); // Speed of typing
            return () => clearInterval(timer);
        } else {
            setText(""); // Reset when changing stages
        }
    }, [currentStage]);

    // Determine Egyptian Greeting
    const getEgyptGreeting = () => {
        const egyptTimeFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Africa/Cairo',
            hour: '2-digit',
            hour12: false
        });
        const egyptHour = parseInt(egyptTimeFormatter.format(new Date()), 10);

        if (egyptHour >= 5 && egyptHour < 12) {
            return { msg: "Good morning from Egypt", emoji: "🌅" };
        } else if (egyptHour >= 12 && egyptHour < 18) {
            return { msg: "Good afternoon from Egypt", emoji: "☀️" };
        } else {
            return { msg: "Good night from Egypt", emoji: "🌙" };
        }
    };

    if (currentStage === 1) {
        const greeting = getEgyptGreeting();
        return (
            <h1 className="px-8 py-4 mx-5 text-center text-white sm:text-xl sm:leading-snug neo-brutalism-blue">
                Hi, I'm <span className="mx-2 font-semibold text-white drop-shadow-md">{text}<span className="animate-pulse">|</span></span> 👋
                <br />
                {greeting.msg} <img src={egyptFlag} alt="Egypt flag" className="inline w-6 h-4 mx-1" /> {greeting.emoji}
                <br />
                A Computer & Communications Engineer
            </h1>
        );
    }

    if (currentStage === 2) {
        return (
            <div className="info-box">
                <p className="font-medium text-center sm:text-xl">
                    Worked on multiple projects <br /> and picked up many skills along the way
                </p>
                <Link to="/about" className="neo-brutalism-white neo-btn">
                    Learn more <img src={arrow} alt="arrow" className="object-contain w-4 h-4" />
                </Link>
            </div>
        );
    }

    if (currentStage === 3) {
        return (
            <div className="info-box">
                <p className="font-medium text-center sm:text-xl">
                    Built games, dashboards, and applications. <br /> Curious about the impact ?
                </p>
                <Link to="/projects" className="neo-brutalism-white neo-btn">
                    Visit my portfolio <img src={arrow} alt="arrow" className="object-contain w-4 h-4" />
                </Link>
            </div>
        );
    }

    if (currentStage === 4) {
        return (
            <div className="info-box">
                <p className="font-medium text-center sm:text-xl">
                    Need a project done or looking for a dev ? <br /> I'm just a few keystrokes away
                </p>
                <Link to="/contact" className="neo-brutalism-white neo-btn">
                    Let's talk <img src={arrow} alt="arrow" className="object-contain w-4 h-4" />
                </Link>
            </div>
        );
    }

    return null;
};

export default HomeInfo;