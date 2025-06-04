import React from 'react';
import { FaFilePdf } from 'react-icons/fa';

const InfoSection = () => {
    return (
        <section className="bg-base-100 text-base-content py-12 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Columna Izquierda - 3/4 */}
                <div className="md:col-span-3">
                    <h2 className="text-3xl font-bold mb-4 text-primary">
                        ¿Qué es Triage Web?
                    </h2>
                    <p className="mb-6 leading-relaxed">
                        <span className="font-semibold">Triage Web</span> es una plataforma desarrollada como proyecto de grado por dos estudiantes de la Institución Universitaria Tecnológico de Antioquia, en el marco de una investigación sobre la sobreocupación en las salas de urgencias de clínicas y hospitales en la ciudad de Medellín.
                        <br /><br />
                        El sistema está diseñado para apoyar a los profesionales de la salud en la clasificación y priorización de pacientes, utilizando síntomas ingresados por texto o voz. Su objetivo principal es optimizar el tiempo en la generación de registros médicos, ofreciendo una experiencia ágil, precisa y fácil de usar.
                        <br /><br />
                        A la derecha encontrarás los manuales de usuario. La plataforma permite dos modos de uso: como paciente o como profesional de la salud. Puedes explorar ambos perfiles; sin embargo, si te registras con ambas funciones, no podrás visualizar tus propios registros como doctor.
                        <br /><br />
                        Finalmente, te invitamos a compartir tu opinión sobre el sistema a través del siguiente formulario de retroalimentación:
                        <br />
                        <span className="text-accent">Link: Por crear</span>
                    </p>
                </div>

                {/* Columna Derecha - 1/4 */}
                <div className="flex flex-col items-center justify-center gap-4 h-full">
                    {/* Manual Paciente */}
                    <a
                        href="/docs/manual-pacientes.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-primary gap-2"
                    >
                        <FaFilePdf className="text-lg" />
                        Ver Manual Paciente
                    </a>
                    <a
                        href="/docs/manual-pacientes.pdf"
                        download
                        className="btn btn-primary gap-2"
                    >
                        <FaFilePdf className="text-lg" />
                        Descargar Manual Paciente
                    </a>

                    {/* Manual Profesional */}
                    <a
                        href="/docs/manual-profesionales.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-secondary gap-2"
                    >
                        <FaFilePdf className="text-lg" />
                        Ver Manual Profesional
                    </a>
                    <a
                        href="/docs/manual-profesionales.pdf"
                        download
                        className="btn btn-secondary gap-2"
                    >
                        <FaFilePdf className="text-lg" />
                        Descargar Manual Profesional
                    </a>
                </div>
            </div>
        </section>
    );
};

export default InfoSection;