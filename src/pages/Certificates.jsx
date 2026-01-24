import { CTA } from "../components";
import nvidia from "../assets/images/nvidia.png";
import andrew from "../assets/images/andrew.png";

const Certificates = () => {
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
        }
    ];

    return (
        <section className='max-container animate-fade-in-up'>
            <h1 className='head-text'>
                My <span className='blue-gradient_text drop-shadow font-semibold'>Certificates</span>
            </h1>

            <p className='text-slate-500 mt-2 leading-relaxed'>
                Professional certifications and achievements that showcase my commitment to continuous learning
                and expertise in data engineering, machine learning, and artificial intelligence.
            </p>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 my-10'>
                {certificates.map((certificate, index) => (
                    <div
                        className='certificate-card flex flex-col group animate-fade-in-up bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300'
                        key={certificate.id}
                        style={{ animationDelay: `${index * 150}ms` }}
                    >
                        {/* Certificate Image */}
                        <div className='relative h-64 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100'>
                            <img
                                src={certificate.image}
                                alt={certificate.name}
                                className='w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500'
                            />
                        </div>

                        {/* Certificate Details */}
                        <div className='p-6 flex flex-col flex-1'>
                            <div className='mb-4'>
                                <h3 className='text-2xl font-bold font-poppins text-slate-800 mb-2'>
                                    {certificate.name}
                                </h3>
                                <p className='text-blue-600 font-semibold text-sm mb-1'>
                                    {certificate.issuer}
                                </p>
                                <p className='text-slate-400 text-sm'>
                                    {certificate.date}
                                </p>
                            </div>

                            <p className='text-slate-600 text-sm leading-relaxed mb-6 flex-1'>
                                {certificate.description}
                            </p>

                            {/* Skills Tags */}
                            <div className='flex flex-wrap gap-2 mt-auto'>
                                {certificate.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className='px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200'
                                    >
                                        {skill}
                                    </span>
                                ))}
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

export default Certificates;
