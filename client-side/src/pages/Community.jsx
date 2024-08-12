import React from 'react';

const faculty = [
    { status: 'Full Time', name: 'Amores, Jennifer G.', degrees: 'BSCS, MSCS, PHD UNITS' },
    { status: 'Full Time', name: 'Basabe, Neil A.', degrees: 'BSCS, MIT' },
    { status: 'Full Time', name: 'Bermudez, Leo C.', degrees: 'TBA' },
    { status: 'Full Time', name: 'Caminade, Franz Joseph I.', degrees: 'BSICS, MSIT CANDIDANT' },
    { status: 'Full Time', name: 'Durano, Dennis S.', degrees: 'BSCOE, MIT CANDIDANT' },
    { status: 'Full Time', name: 'Ferolino, Heubert M.', degrees: 'BSIT, MST-CS, PHD UNITS' },
    { status: 'Full Time', name: 'Kim, Carlsan O.', degrees: 'TBA' },
    { status: 'Full Time', name: 'Odjinar, Nonitor O.', degrees: 'TBA' },
    { status: 'Full Time', name: 'Ybañez Leah B.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Arranguez, Manuel D.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Amora, Jean Marie M.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Barral, Christian C.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Batobalonos, Nicole C.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Bayron, Harry James V.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Bentulan, Sherwin B.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Brigoli, Jose Marcelito D.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Cabrera, Cecilia R.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Caliao, Reynaldo T.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Campanilla, Bell S.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Cataraja, Gian Carlo S.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Codera, Joesenh Niño L.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Caburnay, Enmarie I.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Dakay, Susanette A.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Digamos, Norman Vicente P.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Florentino, Cristopher L.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Gamboa, Johnler W.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Gayo, Wilson A.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Lahaylahay, Beverly T.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Lapeña, Michael L.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Largo, Dominic', degrees: 'TBA' },
    { status: 'Part Time', name: 'Maghanoy, Angelbert P.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Miñoza, Wenily Belle M.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Mirambel, Noel Anthony', degrees: 'TBA' },
    { status: 'Part Time', name: 'Nacua, Pet Andrew P.', degrees: 'TBA' },
    { status: 'Part Time', name: 'ONG, Emily L.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Ortega, Eric P.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Patiño, Joaquin S.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Repoledon, Ruphy Renante T.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Ruiz, James Adrian S.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Salimbangon, Jeff P.', degrees: 'TBA' },
    { status: 'Part Time', name: 'Unabia, Kent Ivan R.', degrees: 'TBA' },
];

const officersAndReps = [
    { role: 'President', name: 'Vince Andrew Santoya', image: 'https://via.placeholder.com/150?text=Vince' },
    { role: 'Vice President Internal', name: 'Aubrey Leyros', image: 'https://via.placeholder.com/150?text=Aubrey' },
    { role: 'Vice President External', name: 'Clint Louie Tuyor', image: 'https://via.placeholder.com/150?text=Clint' },
    { role: 'Secretary', name: 'Marlou Tadlip', image: 'https://via.placeholder.com/150?text=Marlou' },
    { role: 'Auditor', name: 'Daisy Lyn Laygan', image: 'https://via.placeholder.com/150?text=Daisy' },
    { role: 'Treasurer', name: 'Jeraiza Gacang', image: 'https://via.placeholder.com/150?text=Jeraiza' },
    { role: 'Asst. Treasurer', name: 'Stephanie Echavez', image: 'https://via.placeholder.com/150?text=Stephanie' },
    { role: 'P.I.O', name: 'Princess Villanueva', image: 'https://via.placeholder.com/150?text=Princess' },
    { role: 'P.R.O', name: 'John Paul Costillas', image: 'https://via.placeholder.com/150?text=John' },
    { role: 'Chief Volunteer', name: 'Rey Vincent De Los Reyes', image: 'https://via.placeholder.com/150?text=Rey' },
    { role: '1st Year Rep', name: 'Sainth Anneshka N. Cuico', image: 'https://via.placeholder.com/150?text=TBA' },
    { role: '2nd Year Rep', name: 'Christ Hanzen Rallos', image: 'https://via.placeholder.com/150?text=Christ' },
    { role: '3rd Year Rep', name: 'Angela Postrero', image: 'https://via.placeholder.com/150?text=Angela' },
    { role: '4th Year Rep', name: 'Shainnah Lhyn Taborada', image: 'https://via.placeholder.com/150?text=Shainnah' }
];


const teamMembers = [
    { name: "Jims", label: "Lead Developer", image: "https://via.placeholder.com/150?text=Jims" },
    { name: "Beans", label: "Front End Developer", image: "https://via.placeholder.com/150?text=Beans" },
    { name: "Driane", label: "FullStack Developer", image: "https://via.placeholder.com/150?text=Driane" },
    { name: "Marianne", label: "Web Designer", image: "https://via.placeholder.com/150?text=Marianne" },
];


const Community = () => {
    return (
        <div className="container mx-auto py-20 px-4">
            <section className="mb-16">
                <h2 className="text-5xl font-bold mb-8 text-center">Officers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {officersAndReps.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 border border-gray-200 shadow-lg rounded-lg flex flex-col items-center text-center transition-transform transform hover:scale-105"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-24 h-24 mb-4 rounded-full object-cover"
                            />
                            <div className="text-xl font-semibold mb-2">{item.role}</div>
                            <div className="text-gray-700">{item.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-16">
                <h2 className="text-5xl font-bold mb-12 text-center">Faculty</h2>
                <div className="w-full">
                    <div className="mb-12">
                        <h3 className="text-3xl font-semibold mb-8 text-center">Full Time</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {faculty
                                .filter(member => member.status === "Full Time")
                                .map((member, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-6 border border-gray-200 shadow-lg rounded-lg flex flex-col items-center text-center transition-transform transform hover:scale-105"
                                    >
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-24 h-24 mb-4 rounded-full object-cover"
                                        />
                                        <h4 className="text-xl font-semibold mb-2">{member.name}</h4>
                                        <p className="text-gray-700 mb-2">{member.degrees}</p>
                                        <p className="text-gray-500">{member.status}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-semibold mb-8 text-center">Part Time</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {faculty
                                .filter(member => member.status === "Part Time")
                                .map((member, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-6 border border-gray-200 shadow-lg rounded-lg flex flex-col items-center text-center transition-transform transform hover:scale-105"
                                    >
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-24 h-24 mb-4 rounded-full object-cover"
                                        />
                                        <h4 className="text-xl font-semibold mb-2">{member.name}</h4>
                                        <p className="text-gray-700 mb-2">{member.degrees}</p>
                                        <p className="text-gray-500">{member.status}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-16">
                <h2 className="text-5xl font-bold mb-8 text-center">Team</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 border border-gray-200 shadow-lg rounded-lg flex flex-col items-center text-center transition-transform transform hover:scale-105"
                        >
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-24 h-24 mb-4 rounded-full object-cover"
                            />
                            <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                            <p className="text-gray-600">{member.label}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Community;
