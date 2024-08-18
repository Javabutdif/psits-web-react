import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const coreValues = [
    {
        title: "Initiative (Inceptum)",
        attributes: ["Wit", "Practicality", "Ingenuity"],
        svgProps: {
            width: "111",
            height: "111",
            stroke: "black",
            paths: [
                { 
                    d: "M67.4706 63.0206C64.38 66.4695 60.6182 69.3058 56.3855 71.3516V83.132C56.3855 84.1734 55.9639 85.1724 55.2133 85.9082C54.4626 86.6449 53.4445 87.0588 52.383 87.0588H28.3675C27.306 87.0588 26.2879 86.6449 25.5373 85.9082C24.7866 85.1724 24.3649 84.1734 24.3649 83.132V71.3516C18.6048 68.5477 13.7147 64.2824 10.2022 58.9983C6.68976 53.7143 4.68299 47.6042 4.39028 41.3024C4.09758 35.0005 5.52958 28.7367 8.53762 23.1611C11.5457 17.5856 16.0201 12.9016 21.4964 9.59542C26.9728 6.2892 33.2514 4.48134 39.6804 4.3595C45.0439 4.25784 50.349 5.33278 55.2133 7.48975", 
                    strokeWidth: "8", 
                    strokeLinecap: "round", 
                    strokeLinejoin: "round" 
                },
                { 
                    d: "M23.9412 106.647H56.5882", 
                    strokeWidth: "8", 
                    strokeLinecap: "round", 
                    strokeLinejoin: "round" 
                },
                { 
                    d: "M58.664 31.892C55.8963 31.4024 55.8963 27.3622 58.664 26.8726C68.6907 25.0989 76.6657 17.333 78.842 7.22331L79.0089 6.44838C79.6073 3.6669 83.5026 3.64958 84.1248 6.42563L84.3275 7.32873C86.5847 17.3906 94.5613 25.091 104.561 26.8598C107.342 27.352 107.342 31.4127 104.561 31.9047C94.5613 33.6736 86.5847 41.374 84.3275 51.4359L84.1248 52.339C83.5026 55.1151 79.6073 55.0977 79.0089 52.3163L78.842 51.5413C76.6657 41.4318 68.6907 33.6658 58.664 31.892Z", 
                    strokeWidth: "8", 
                    strokeLinecap: "round", 
                    strokeLinejoin: "round" 
                }
            ]
        }
    },
    {
        title: "Innovation (Innovatio)",
        attributes: ["Technology", "Creativity", "Novelty"],
        svgProps: {
            width: "100",
            height: "100",
            stroke: "black",
            paths: [
                { 
                    d: "M29 48C29 44.6863 31.6863 42 35 42H65C68.3137 42 71 44.6863 71 48V52C71 55.3137 68.3137 58 65 58H35C31.6863 58 29 55.3137 29 52V48Z", 
                    strokeWidth: "8", 
                    strokeLinecap: "round", 
                    strokeLinejoin: "round" 
                },
                { 
                    d: "M33 30H67", 
                    strokeWidth: "8", 
                    strokeLinecap: "round", 
                    strokeLinejoin: "round" 
                },
                { 
                    d: "M40 12H60", 
                    strokeWidth: "8", 
                    strokeLinecap: "round", 
                    strokeLinejoin: "round" 
                }
            ]
        }
    },
    {
        title: "Service (Muneris)",
        attributes: ["Industry", "Loyalty", "Courtesy"],
        svgProps: {
            width: "100",
            height: "100",
            stroke: "black",
            paths: [
                { 
                    d: "M25 40C25 34.4772 29.4772 30 35 30H65C70.5228 30 75 34.4772 75 40V60C75 65.5228 70.5228 70 65 70H35C29.4772 70 25 65.5228 25 60V40Z", 
                    strokeWidth: "8", 
                    strokeLinecap: "round", 
                    strokeLinejoin: "round" 
                },
                { 
                    d: "M35 20H65", 
                    strokeWidth: "8", 
                    strokeLinecap: "round", 
                    strokeLinejoin: "round" 
                },
                { 
                    d: "M50 10L50 20", 
                    strokeWidth: "8", 
                    strokeLinecap: "round", 
                    strokeLinejoin: "round" 
                }
            ]
        }
    }
];

const SvgIcon = ({ width, height, stroke, paths }) => (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {paths.map((path, index) => (
            <path key={index} d={path.d} stroke={stroke} strokeWidth={path.strokeWidth} strokeLinecap={path.strokeLinecap} strokeLinejoin={path.strokeLinejoin}/>
        ))}
    </svg>
);

const CoreValues = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, 50]);

    return (
        <section className='container mx-auto px-6 py-12 md:py-24'>
            <div className='text-center mb-6'>
                <motion.h2
                    className="text-3xl font-extrabold mb-2 text-gray-800"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Core Values
                </motion.h2>
                <motion.p
                    className="text-sm text-gray-600"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    These are the core values that CCS believes in:
                </motion.p>
            </div>
            <motion.div
                className='flex-1 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 grid-rows-[150px_150px_150px] gap-8'
                style={{ y }}
            >
                {coreValues.map((value, index) => (
                    <motion.div
                        key={index}
                        className={`${index === 0 ? 'row-span-1 md:col-start-2 lg:col-start-1 md:col-span-2' : index === 1 ? 'row-start-2 md:col-start-1 md:col-span-2 lg:col-start-3  ' : index === 2 ? 'row-start-3 md:row-start-2 lg:row-start-3 lg:col-start-5 md:col-span-2  md:col-start-3' : ''} flex flex-col items-center justify-center`}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                    >
                        <SvgIcon {...value.svgProps} />
                        <h3 className="text-xl font-extra-bold mt-4 text-gray-800">{value.title}</h3>
                        <ul className="mt-2 space-x-4 text-gray-700">
                            {value.attributes.map((attribute, idx) => (
                                <li key={idx} className="inline-block text-sm">{attribute}</li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default CoreValues;
