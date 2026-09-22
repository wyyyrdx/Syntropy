const concepts = (...items) => items.map(([title, explanation, importance = 'primary']) => ({ title, explanation, importance }));
const quiz = (id, question, correctText, distractors, explanation) => [{
  id, question,
  options: [correctText, ...distractors].map((text, index) => ({ id: String.fromCharCode(65 + index), text })),
  correct: 'A', explanation
}];
const chapter = (id, number, title, realmTarget, summary, conceptItems, question, correct, distractors, explanation) => ({
  id, number, title, realmTarget, summary, concepts: concepts(...conceptItems), quiz: quiz(`physics-chapter:${id}`, question, correct, distractors, explanation)
});

export const PHYSICS_CURRICULUM_BOOKS = [
  {
    id: 'class-6', grade: 'Class 6', title: 'Motion, Light & Sound Foundations', role: 'Junior Observer', icon: '🔭', accentColor: '#38bdf8', coverStyle: 'book-cover-blue',
    description: 'Build a physical vocabulary through observable motion, forces, light, sound, and careful measurement.',
    chapters: [
      chapter('p6-ch1', 1, 'Motion and Forces', 'newtons-orchard', 'Describe motion using position, distance, time, speed, and simple pushes or pulls.', [['Speed', 'Speed is distance traveled per unit time.'], ['Balanced Forces', 'Balanced forces produce zero net force and no acceleration.'], ['Friction', 'Friction opposes relative motion between touching surfaces.', 'secondary']], 'Which quantity is distance divided by time?', 'Speed', ['Force', 'Mass', 'Temperature'], 'Speed = distance/time.'),
      chapter('p6-ch2', 2, 'Light and Sound', 'prism-observatory', 'Explore straight-line light, reflection, vibration, pitch, and loudness.', [['Reflection', 'Reflection is the bouncing of light from a surface.'], ['Vibration', 'Sound begins with a vibrating source.'], ['Pitch', 'Pitch rises as vibration frequency increases.', 'secondary']], 'What property most directly controls pitch?', 'Frequency', ['Mass', 'Color', 'Temperature'], 'Higher frequency is perceived as higher pitch.')
    ]
  },
  {
    id: 'class-7', grade: 'Class 7', title: 'Energy, Heat & Simple Machines', role: 'Lab Technician', icon: '⚙️', accentColor: '#10b981', coverStyle: 'book-cover-green',
    description: 'Track energy through thermal systems, fluids, and machines that trade force for distance.',
    chapters: [
      chapter('p7-ch1', 1, 'Heat Transfer', 'thermal-engine-core', 'Distinguish heat from temperature and compare conduction, convection, and radiation.', [['Temperature', 'Temperature relates to average particle kinetic energy.'], ['Conduction', 'Energy transfer through particle interactions.'], ['Radiation', 'Energy transfer by electromagnetic waves.', 'secondary']], 'Which heat-transfer method works through a vacuum?', 'Radiation', ['Conduction', 'Convection', 'Evaporation only'], 'Electromagnetic radiation does not need matter.'),
      chapter('p7-ch2', 2, 'Pressure and Machines', 'hydraulic-pressure-docks', 'Apply pressure, buoyancy, levers, and pulleys to real machines.', [['Pressure', 'Pressure is force per unit area.'], ['Buoyancy', 'A fluid exerts an upward force on immersed objects.'], ['Mechanical Advantage', 'Machines can multiply force while increasing input distance.', 'secondary']], 'Reducing contact area while keeping force fixed makes pressure:', 'Increase', ['Decrease', 'Stay zero', 'Become mass'], 'P = F/A, so smaller area means greater pressure.')
    ]
  },
  {
    id: 'class-8', grade: 'Class 8', title: 'Electricity, Magnetism & Waves', role: 'Systems Engineer', icon: '⚡', accentColor: '#f59e0b', coverStyle: 'book-cover-amber',
    description: 'Connect circuit quantities, magnetic fields, and wave properties through practical systems.',
    chapters: [
      chapter('p8-ch1', 1, 'Circuits and Ohm\'s Law', 'circuit-foundry', 'Build series and parallel circuits and relate voltage, current, and resistance.', [['Current', 'Current is charge flow per unit time.'], ['Potential Difference', 'Voltage is energy transferred per unit charge.'], ['Resistance', 'Resistance opposes current flow.', 'secondary']], 'What current flows through 4 Ω connected to 12 V?', '3 A', ['48 A', '0.33 A', '16 A'], 'I = V/R = 12/4 = 3 A.'),
      chapter('p8-ch2', 2, 'Magnets and Electromagnets', 'magnetic-rail-yard', 'Map magnetic fields and investigate current-produced magnetism.', [['Magnetic Field', 'A region where magnetic materials and moving charges experience force.'], ['Electromagnet', 'A current-carrying coil that produces a controllable field.'], ['Induction', 'Changing magnetic flux can produce an emf.', 'secondary']], 'Which change strengthens a simple electromagnet?', 'Increase the coil current', ['Open the circuit', 'Remove all turns', 'Replace iron with air'], 'A larger current creates a stronger magnetic field.')
    ]
  },
  {
    id: 'class-9', grade: 'Class 9', title: 'Mechanics, Optics & Wave Systems', role: 'Research Analyst', icon: '📐', accentColor: '#a78bfa', coverStyle: 'book-cover-purple',
    description: 'Use equations and models to predict forces, image formation, and wave behavior.',
    chapters: [
      chapter('p9-ch1', 1, 'Newtonian Mechanics', 'newtons-orchard', 'Analyze motion with acceleration, net force, momentum, and Newton\'s laws.', [['Acceleration', 'Acceleration is the rate of change of velocity.'], ['Net Force', 'The vector sum of all forces causes acceleration.'], ['Momentum', 'Momentum equals mass multiplied by velocity.', 'secondary']], 'A net force of 10 N acts on 2 kg. The acceleration is:', '5 m/s²', ['20 m/s²', '12 m/s²', '0.2 m/s²'], 'a = F/m = 10/2 = 5 m/s².'),
      chapter('p9-ch2', 2, 'Geometric Optics and Waves', 'resonance-amphitheater', 'Connect frequency, wavelength, wave speed, reflection, refraction, and resonance.', [['Wave Speed', 'Wave speed equals frequency multiplied by wavelength.'], ['Refraction', 'A wave changes direction when its speed changes at a boundary.'], ['Resonance', 'A system responds strongly near a natural frequency.', 'secondary']], 'A 5 Hz wave has wavelength 2 m. Its speed is:', '10 m/s', ['2.5 m/s', '7 m/s', '0.4 m/s'], 'v = fλ = 5 × 2 = 10 m/s.')
    ]
  },
  {
    id: 'class-10', grade: 'Class 10', title: 'Fields, Energy & Space Physics', role: 'Mission Physicist', icon: '🛰️', accentColor: '#eab308', coverStyle: 'book-cover-gold',
    description: 'Integrate electrical power, conservation laws, gravitation, orbital motion, and planetary systems.',
    chapters: [
      chapter('p10-ch1', 1, 'Electrical Energy and Power', 'circuit-foundry', 'Calculate electrical energy, power, resistance, and efficiency in connected systems.', [['Electrical Power', 'Power is energy transferred per unit time and P = VI.'], ['Electrical Energy', 'Energy transferred can be calculated with E = Pt.'], ['Efficiency', 'Efficiency compares useful output energy with total input.', 'secondary']], 'A 12 V device drawing 2 A uses power of:', '24 W', ['6 W', '14 W', '0.17 W'], 'P = VI = 12 × 2 = 24 W.'),
      chapter('p10-ch2', 2, 'Gravitation and Orbits', 'orbital-mechanics-station', 'Apply universal gravitation and energy conservation to planets and satellites.', [['Universal Gravitation', 'Every pair of masses attracts with an inverse-square force.'], ['Circular Orbit', 'Gravity supplies the centripetal force for an orbiting body.'], ['Orbital Energy', 'Kinetic and gravitational potential energy combine into total orbital energy.', 'secondary']], 'If separation doubles, gravitational force becomes:', 'One quarter', ['One half', 'Twice', 'Four times'], 'The inverse-square dependence gives 1/2² = 1/4.')
    ]
  }
];
