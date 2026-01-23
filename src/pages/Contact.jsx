import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import useAlert from "../hooks/useAlert";
import { Alert } from "../components";
import { socialLinks } from "../constants";

const Contact = () => {
    const formRef = useRef();
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const { alert, showAlert, hideAlert } = useAlert();
    const [loading, setLoading] = useState(false);

    const handleChange = ({ target: { name, value } }) => {
        setForm({ ...form, [name]: value });
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
                    showAlert({
                        show: true,
                        text: "✅ Thank you! Your message has been sent successfully.",
                        type: "success",
                    });

                    setTimeout(() => {
                        hideAlert(false);
                        setForm({ name: "", email: "", message: "" });
                    }, 3000);
                },
                (error) => {
                    setLoading(false);
                    showAlert({
                        show: true,
                        text: "❌ Something went wrong. Please try again.",
                        type: "danger",
                    });
                }
            );
    };

    return (
        <section className='relative flex justify-center items-center min-h-[100vh] p-4 lg:p-10 animate-fade-in-up'>
            {alert.show && <Alert {...alert} />}

            <div className='flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl'>

                {/* Left Panel: Info & Contact Details */}
                <div className='lg:w-2/5 w-full bg-gradient-to-br from-blue-500 to-blue-700 p-10 flex flex-col justify-between text-white'>
                    <div>
                        <h2 className='text-3xl font-bold mb-4 font-poppins'>Get in touch</h2>
                        <p className='text-blue-100 mb-8 leading-relaxed'>
                            Whether you have a project in mind or just want to discuss the latest tech, I'm here to chat.
                        </p>

                        <div className='flex flex-col gap-6'>
                            {/* Address */}
                            <div className='flex items-start gap-4'>
                                <span className='text-2xl'>📍</span>
                                <div>
                                    <h4 className='font-semibold text-lg'>Visit me</h4>
                                    <p className='text-blue-100 text-sm'>Alexandria, Egypt</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className='flex items-start gap-4'>
                                <span className='text-2xl'>✉️</span>
                                <div>
                                    <h4 className='font-semibold text-lg'>Chat to me</h4>
                                    <p className='text-blue-100 text-sm break-all'>mohammed.ashraf.m.w@gmail.com</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className='flex items-start gap-4'>
                                <span className='text-2xl'>📞</span>
                                <div>
                                    <h4 className='font-semibold text-lg'>Call me</h4>
                                    <p className='text-blue-100 text-sm'>+20 127 571 8500</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Icons */}
                    <div className='mt-12'>
                        <h4 className='font-semibold text-lg mb-4'>Social media</h4>
                        <div className='flex flex-wrap gap-4'>
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.link}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='transition-transform hover:scale-110'
                                    title={link.name}
                                >
                                    <img
                                        src={link.iconUrl}
                                        alt={link.name}
                                        // Removed filter invert and background classes to match the requested "footer style" (original colors)
                                        className='w-9 h-9 object-contain'
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className='lg:w-3/5 w-full p-10 bg-white'>
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className='flex flex-col gap-6'
                    >
                        <div className='flex flex-col gap-2'>
                            <label className='font-semibold text-slate-600'>Name</label>
                            <input
                                type='text'
                                name='name'
                                className='input bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-3 outline-none transition-all'
                                placeholder='John Doe'
                                required
                                value={form.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className='flex flex-col gap-2'>
                            <label className='font-semibold text-slate-600'>Email</label>
                            <input
                                type='email'
                                name='email'
                                className='input bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-3 outline-none transition-all'
                                placeholder='john@gmail.com'
                                required
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className='flex flex-col gap-2'>
                            <label className='font-semibold text-slate-600'>Message</label>
                            <textarea
                                name='message'
                                rows='4'
                                className='textarea bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-3 outline-none transition-all resize-none'
                                placeholder='Tell me about your project...'
                                required
                                value={form.message}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl mt-4'
                        >
                            {loading ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>

            </div>
        </section>
    );
};

export default Contact;