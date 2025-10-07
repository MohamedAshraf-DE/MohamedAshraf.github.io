import emailjs from "@emailjs/browser";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";

import { Fox } from "../models";
import useAlert from "../hooks/useAlert";
import { Alert, Loader } from "../components";

const Contact = () => {
        const formRef = useRef();
        const [form, setForm] = useState({ name: "", email: "", message: "" });
        const { alert, showAlert, hideAlert } = useAlert();
        const [loading, setLoading] = useState(false);
        const [currentAnimation, setCurrentAnimation] = useState("idle");

        const handleChange = ({ target: { name, value } }) => {
            setForm({...form, [name]: value });
        };

        const handleFocus = () => setCurrentAnimation("walk");
        const handleBlur = () => setCurrentAnimation("idle");

        const handleSubmit = (e) => {
            e.preventDefault();
            setLoading(true);
            setCurrentAnimation("hit");

            emailjs
                .send(
                    import.meta.env.VITE_APP_EMAILJS_SERVICE_ID, // service_arg24u5
                    import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID, // template_2pupho7
                    {
                        from_name: form.name,
                        from_email: form.email,
                        message: form.message,
                    },
                    import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY // 7WityJryYNVqfwbqo
                )
                .then(
                    () => {
                        setLoading(false);
                        showAlert({
                            show: true,
                            text: "✅ Thank you! Your message has been sent successfully.",
                            type: "success",
                        });

                        // Reset form and animation after short delay
                        setTimeout(() => {
                            hideAlert(false);
                            setCurrentAnimation("idle");
                            setForm({ name: "", email: "", message: "" });
                        }, 3000);
                    },
                    (error) => {
                        console.error("EmailJS Error:", error);
                        setLoading(false);
                        setCurrentAnimation("idle");

                        showAlert({
                            show: true,
                            text: "❌ Something went wrong. Please try again.",
                            type: "danger",
                        });
                    }
                );
        };

        return ( <
            section className = "relative flex flex-col lg:flex-row max-container" > {
                alert.show && < Alert {...alert }
                />}

                { /* ===== Left Form Section ===== */ } <
                div className = "flex-1 min-w-[50%] flex flex-col" >
                <
                h1 className = "head-text" > Get in Touch < /h1>

                <
                form
                ref = { formRef }
                onSubmit = { handleSubmit }
                className = "flex flex-col w-full gap-7 mt-14" >
                <
                label className = "font-semibold text-black-500" >
                Name <
                input
                type = "text"
                name = "name"
                className = "input"
                placeholder = "John"
                required
                value = { form.name }
                onChange = { handleChange }
                onFocus = { handleFocus }
                onBlur = { handleBlur }
                /> <
                /label>

                <
                label className = "font-semibold text-black-500" >
                Email <
                input
                type = "email"
                name = "email"
                className = "input"
                placeholder = "john@gmail.com"
                required
                value = { form.email }
                onChange = { handleChange }
                onFocus = { handleFocus }
                onBlur = { handleBlur }
                /> <
                /label>

                <
                label className = "font-semibold text-black-500" >
                Your Message <
                textarea
                name = "message"
                rows = "4"
                className = "textarea"
                placeholder = "Write your thoughts here..."
                required
                value = { form.message }
                onChange = { handleChange }
                onFocus = { handleFocus }
                onBlur = { handleBlur }
                /> <
                /label>

                <
                button
                type = "submit"
                disabled = { loading }
                className = "btn"
                onFocus = { handleFocus }
                onBlur = { handleBlur } >
                { loading ? "Sending..." : "Submit" } <
                /button> <
                /form> <
                /div>

                { /* ===== Right 3D Fox Model Section ===== */ } <
                div className = "lg:w-1/2 w-full lg:h-auto md:h-[550px] h-[350px]" >
                <
                Canvas
                camera = {
                    {
                        position: [0, 0, 5],
                        fov: 75,
                        near: 0.1,
                        far: 1000,
                    }
                } >
                <
                directionalLight position = {
                    [0, 0, 1] }
                intensity = { 2.5 }
                /> <
                ambientLight intensity = { 1 }
                /> <
                pointLight position = {
                    [5, 10, 0] }
                intensity = { 2 }
                /> <
                spotLight
                position = {
                    [10, 10, 10] }
                angle = { 0.15 }
                penumbra = { 1 }
                intensity = { 2 }
                />

                <
                Suspense fallback = { < Loader / > } >
                <
                Fox
                currentAnimation = { currentAnimation }
                position = {
                    [0.5, 0.35, 0] }
                rotation = {
                    [12.629, -0.6, 0] }
                scale = {
                    [0.5, 0.5, 0.5] }
                /> <
                /Suspense> <
                /Canvas> <
                /div> <
                /section>
            );
        };

        export default Contact;