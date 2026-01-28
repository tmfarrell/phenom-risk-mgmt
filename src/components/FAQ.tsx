import { Header } from '@/components/Header'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export const FAQ = () => {
    return (
        <div className='min-h-screen w-full'>
            <Header />
            <div className='flex items-start justify-between px-6 pt-6'>
                <div>
                    <h1 className='text-2xl font-bold text-blue-900 text-left'>Frequently Asked Questions</h1>
                </div>
            </div>
            <div className='p-6'>
                <div className='glass-card p-6'>
                    <Accordion type='single' collapsible className='w-full'>
                            <AccordionItem value='item-1'>
                                <AccordionTrigger className='text-left'>What is the Patient Risk Panel?</AccordionTrigger>
                                <AccordionContent className='text-left'>
                                    PhenOM Patient Risk Panel is a dashboard application that helps healthcare providers monitor and manage patient
                                    risks. It provides both relative and absolute risk scores for various health outcomes, helping identify patients
                                    who may need additional attention or intervention.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value='item-2'>
                                <AccordionTrigger className='text-left'>How are risk scores calculated?</AccordionTrigger>
                                <AccordionContent className='text-left'>
                                    Risk scores are calculated using advanced machine learning models that take into account multiple factors
                                    including:
                                    <ul className='list-disc pl-6 mt-2'>
                                        <li>Patient demographics</li>
                                        <li>Diagnoses</li>
                                        <li>Medications</li>
                                        <li>Procedures</li>
                                    </ul>
                                    <p className='text-sm mt-4'>Models were developed on a real-world dataset of 300M+ patients.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value='item-3'>
                                <AccordionTrigger className='text-left'>What&apos;s the difference between relative and absolute risk?</AccordionTrigger>
                                <AccordionContent className='text-left'>
                                    <div className='space-y-4'>
                                        <p>
                                            <strong>Absolute Risk Scores:</strong> tell you how likely it is that a patient will experience a
                                            particular outcome—like hospitalization—over a specific period, based on patterns observed in a large
                                            population of adults aged 65 and older.
                                        </p>
                                        <p>
                                            <em>Example:</em> An absolute score of <strong>12%</strong> means that 12 out of 100 patients with similar
                                            medical histories are expected to be hospitalized in the next 3 months.
                                        </p>
                                        <p>
                                            <strong>Relative Risk Scores:</strong> show how much more or less likely a patient is to experience an
                                            outcome compared to the average risk in the 65+ population.
                                        </p>
                                        <p>
                                            <em>Example:</em> A relative risk of <strong>3×</strong> means that the patient is three times more likely
                                            to experience the outcome compared to the average 65+ year old.
                                        </p>
                                        <p className='text-sm text-gray-600 mt-4'>
                                            Models were developed on a real-world dataset with all patient age groups, but risk score ranges are
                                            calibrated specifically to the 65+ demographic.
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value='item-4'>
                                <AccordionTrigger className='text-left'>What data was used to generate these risk scores?</AccordionTrigger>
                                <AccordionContent className='text-left'>
                                    <p>
                                        The risk predictions are based solely on insurance claims data available up to September 12, 2025. This includes
                                        hospital visits, procedures, diagnoses, and other recorded events up to that date.
                                    </p>
                                    <p className='text-sm mt-4'>
                                        <strong>Important:</strong> No clinical notes, lab results, or EMR data are included. Any events that happened
                                        after September 12, 2025 are not reflected in the scores.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value='item-5'>
                                <AccordionTrigger className='text-left'>When are risk values highlighted in red?</AccordionTrigger>
                                <AccordionContent className='text-left'>
                                    <p>
                                        Risk values are automatically highlighted when they fall within the <strong>top 10% of risk</strong> for that
                                        specific outcome and time period. These high-risk indicators help you quickly identify patients who may need
                                        immediate attention or intervention.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value='item-6'>
                                <AccordionTrigger className='text-left'>Why can&apos;t I find the patient I&apos;m looking for?</AccordionTrigger>
                                <AccordionContent className='text-left'>
                                    <p>
                                        Only patients with (a) a non-null name and (b) enough clinical history to generate all risk scores are
                                        displayed in the application.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value='item-7'>
                                <AccordionTrigger className='text-left'>Why is there a hospitalization risk score for a patient already in the hospital?</AccordionTrigger>
                                <AccordionContent className='text-left'>
                                    <p>
                                        The application does <strong>not</strong> have real-time access to hospitalization status. So if your patient
                                        is already admitted, the system might still display a hospitalization risk score because it is unaware of the
                                        current clinical status.
                                    </p>
                                    <p className='text-sm mt-4'>
                                        Always refer to your Electronic Medical Record (EMR) for the most current and accurate clinical information.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
            </div>
        </div>
    )
}

export default FAQ
