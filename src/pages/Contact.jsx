import emailjs from "@emailjs/browser";
import { useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment } from "@react-three/drei";
import useAlert from "../hooks/useAlert";
import { Alert } from "../components";
import { socialLinks } from "../constants";
import { LoginCharacters } from "../models";

const Contact = () => {
    const formRef = useRef();
    const canvasRef = useRef();
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const { alert, showAlert, hideAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState("idle"); // 'idle', 'typing', 'success', 'error'
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

    // Track mouse position within window for eye tracking
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
                    showAlert({
                        show: true,
                        text: "✅ Thank you! Your message has been sent successfully.",
                        type: "success",
                    });

                    setTimeout(() => {
                        hideAlert(false);
                        setForm({ name: "", email: "", message: "" });
                        setFormState("idle");
                    }, 3000);
                },
                (error) => {
                    setLoading(false);
                    setFormState("error");
                    showAlert({
                        show: true,
                        text: "❌ Something went wrong. Please try again.",
                        type: "danger",
                    });

                    setTimeout(() => {
                        setFormState("idle");
                    }, 2000);
                }
            );
    };

    return (
        <section className='relative flex flex-col justify-center items-center min-h-screen animate-fade-in-up bg-white pt-24 sm:pt-28 pb-12' onMouseMove={handleMouseMove}>
            {alert.show && <Alert {...alert} />}

            <div className='w-full max-w-[1400px] bg-white mx-auto flex flex-col lg:flex-row gap-6 lg:gap-16 px-4 sm:px-8'>

                {/* Left Panel: Contact Info (Gradient Blue) - Floating Card Style */}
                <div className='lg:w-1/3 w-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 sm:p-12 text-white shadow-2xl flex flex-col justify-between lg:min-h-[500px]'>
                    <div>
                        <h2 className='text-3xl sm:text-4xl font-bold mb-6 font-poppins'>Get in touch</h2>
                        <p className='text-blue-100 mb-8 sm:mb-12 leading-relaxed text-lg'>
                            Whether you have a project in mind or just want to discuss the latest tech, I'm here to chat.
                        </p>

                        <div className='flex flex-col gap-8'>
                            {/* Address */}
                            <div className='flex items-start gap-5'>
                                <span className='text-2xl'>📍</span>
                                <div>
                                    <h4 className='font-semibold text-xl'>Visit me</h4>
                                    <p className='text-blue-100 text-sm'>Alexandria, Egypt</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className='flex items-start gap-5'>
                                <span className='text-2xl'>✉️</span>
                                <div>
                                    <h4 className='font-semibold text-xl'>Chat to me</h4>
                                    <p className='text-blue-100 text-sm break-all'>mohammed.ashraf.m.w@gmail.com</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className='flex items-start gap-5'>
                                <span className='text-2xl'>📞</span>
                                <div>
                                    <h4 className='font-semibold text-xl'>Call me</h4>
                                    <p className='text-blue-100 text-sm'>+20 127 571 8500</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Icons */}
                    <div className='mt-12'>
                        <h4 className='font-semibold text-lg mb-4 opacity-80'>Social media</h4>
                        <div className='flex flex-wrap gap-4'>
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.link}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='transition-transform hover:scale-110 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm'
                                    title={link.name}
                                >
                                    <img
                                        src={link.iconUrl}
                                        alt={link.name}
                                        className='w-5 h-5 object-contain invert'
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Area: Form + 3D Floating Characters */}
                <div className='lg:w-2/3 w-full flex flex-col pt-4 lg:pt-10'>

                    {/* Main Content Row */}
                    <div className="flex flex-col-reverse lg:flex-row gap-10 h-full">

                        {/* Form Section - Wider and cleaner */}
                        <div className='flex-1 flex flex-col justify-center'>
                            <form
                                ref={formRef}
                                onSubmit={handleSubmit}
                                className='flex flex-col gap-8'
                            >
                                <div className='flex flex-col gap-2'>
                                    <label className='font-bold text-gray-700 text-lg'>Name</label>
                                    <input
                                        type='text'
                                        name='name'
                                        className='input bg-gray-50 border-b-2 border-gray-200 focus:border-blue-600 rounded-none px-4 py-4 text-lg outline-none transition-all focus:bg-white'
                                        placeholder='What’s your name?'
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                        onFocus={() => handleFocus('name')}
                                        onBlur={handleBlur}
                                    />
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <label className='font-bold text-gray-700 text-lg'>Email</label>
                                    <input
                                        type='email'
                                        name='email'
                                        className='input bg-gray-50 border-b-2 border-gray-200 focus:border-blue-600 rounded-none px-4 py-4 text-lg outline-none transition-all focus:bg-white'
                                        placeholder='What’s your email?'
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        onFocus={() => handleFocus('email')}
                                        onBlur={handleBlur}
                                    />
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <label className='font-bold text-gray-700 text-lg'>Message</label>
                                    <textarea
                                        name='message'
                                        rows='4'
                                        className='textarea bg-gray-50 border-b-2 border-gray-200 focus:border-blue-600 rounded-none px-4 py-4 text-lg outline-none transition-all resize-none focus:bg-white'
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
                                    className='btn w-full bg-blue-600 hover:bg-black text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-xl hover:shadow-2xl mt-4 transform hover:-translate-y-1'
                                >
                                    {loading ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>

                        {/* 3D Container - No Background, Floating in Space */}
                        <div
                            ref={canvasRef}
                            className='lg:w-1/2 w-full h-[400px] lg:h-auto relative lg:min-h-[500px]'
                        >
                            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 7], fov: 45 }}>
                                <Suspense fallback={null}>
                                    <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />

                                    <ambientLight intensity={0.7} />
                                    <directionalLight
                                        position={[5, 10, 5]}
                                        intensity={1.2}
                                        castShadow
                                        shadow-mapSize-width={1024}
                                        shadow-mapSize-height={1024}
                                    />
                                    <pointLight position={[-5, 5, 5]} intensity={0.5} color="#FFE4E1" />

                                    <LoginCharacters formState={formState} mousePos={mousePos} />

                                    <Environment preset="city" />
                                </Suspense>
                            </Canvas>

                            {/* Privacy Badge */}
                            <div className={`absolute bottom-5 right-5 transition-opacity duration-300 ${formState === 'typing' ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="bg-black/80 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md">
                                    🙈 Privacy Mode Active
                                </span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
};

export default Contact;