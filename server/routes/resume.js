const express = require('express');
const { query, queryOne, run } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// =====================================================================
// COMPREHENSIVE SKILL TAXONOMY & ROLE REQUIREMENTS
// =====================================================================
const SKILL_DATABASE = {
  programming: ['Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'R', 'Scala'],
  web: ['HTML', 'HTML5', 'CSS', 'CSS3', 'React', 'React.js', 'Node.js', 'Express', 'Express.js', 'Next.js', 'Vue', 'Angular', 'Tailwind', 'Bootstrap', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'REST API', 'GraphQL'],
  database: ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis', 'Oracle', 'Cassandra', 'DynamoDB', 'Database Design', 'Normalization', 'Indexing'],
  cs_core: ['Data Structures', 'Algorithms', 'DSA', 'Object Oriented Programming', 'OOP', 'Operating Systems', 'OS', 'Computer Networks', 'CN', 'DBMS', 'System Design', 'Computer Architecture'],
  aiml: ['Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'AI', 'NLP', 'Computer Vision', 'PyTorch', 'TensorFlow', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'OpenCV', 'Generative AI', 'LLM', 'Transformers', 'HuggingFace'],
  cloud_devops: ['AWS', 'Amazon Web Services', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'Linux', 'Bash', 'Terraform', 'Jenkins', 'Nginx'],
  tools: ['VS Code', 'Git', 'GitHub', 'Postman', 'Jupyter', 'Figma', 'Linux', 'Jira', 'Trello']
};

const ROLE_BENCHMARKS = {
  'Software Engineer': {
    core: ['DSA', 'Data Structures', 'Algorithms', 'Java', 'Python', 'C++', 'Git', 'SQL', 'DBMS', 'OOP', 'OS', 'Computer Networks'],
    advanced: ['System Design', 'Docker', 'REST API', 'Microservices', 'Unit Testing', 'CI/CD']
  },
  'Web Developer': {
    core: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Git', 'REST API', 'SQL', 'MongoDB'],
    advanced: ['Next.js', 'TypeScript', 'Tailwind', 'Docker', 'State Management', 'WebSockets', 'GraphQL']
  },
  'Data Scientist': {
    core: ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'Machine Learning', 'Statistics', 'Matplotlib'],
    advanced: ['Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Model Deployment', 'Big Data', 'Docker']
  },
  'AI/ML Engineer': {
    core: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NumPy', 'Linear Algebra', 'DSA'],
    advanced: ['Generative AI', 'LLMs', 'Transformers', 'FastAPI', 'Docker', 'MLOps', 'Computer Vision']
  },
  'GATE Aspirant': {
    core: ['Engineering Mathematics', 'Discrete Mathematics', 'Digital Logic', 'COA', 'C Programming', 'Data Structures', 'Algorithms', 'TOC', 'Compiler Design', 'OS', 'DBMS', 'Computer Networks'],
    advanced: ['Previous Year Questions', 'Asymptotic Analysis', 'Graph Algorithms', 'Relational Calculus', 'Pipelining']
  }
};

// =====================================================================
// POST /api/resume/analyze
// =====================================================================
router.post('/analyze', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rawText, filename, education, goal, targetRole } = req.body;

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({ error: 'Resume text is too short or empty. Please provide valid resume content.' });
    }

    const textLower = rawText.toLowerCase();

    // 1. Extract Skills Found
    const foundSkillsSet = new Set();
    Object.keys(SKILL_DATABASE).forEach(cat => {
      SKILL_DATABASE[cat].forEach(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(rawText)) {
          foundSkillsSet.add(skill);
        }
      });
    });
    const skillsFound = Array.from(foundSkillsSet);

    // 2. Extract Sections & Information Detection
    const hasEducation = /education|b\.?tech|b\.?e|degree|university|college|bachelor|master|gpa|cgpa/i.test(rawText);
    const hasProjects = /projects?|developed|built|created|implemented|system|application|web app/i.test(rawText);
    const hasExperience = /experience|internship|work history|employment|developer at|software engineer/i.test(rawText);
    const hasCertifications = /certificat(ion|e)s?|licensed|coursework|coursera|udemy|aws certified/i.test(rawText);
    const hasContact = /email|phone|linkedin|github|\+?\d{10}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(rawText);
    const hasSummary = /summary|objective|profile|about me|professional summary/i.test(rawText);
    const hasActionVerbs = /architected|engineered|spearheaded|optimized|implemented|deployed|collaborated|designed|reduced|increased/i.test(rawText);
    const hasMetrics = /\d+%\s|\d+x\s|\$\d+|\d+\s*users|\d+\s*ms|\d+\s*seconds/i.test(rawText);

    // 3. Compute Resume Proficiency Score (out of 100)
    let score = 30; // base score for uploading
    if (hasEducation) score += 10;
    if (hasContact) score += 10;
    if (hasSummary) score += 5;
    if (hasProjects) score += 15;
    if (hasExperience) score += 10;
    if (hasCertifications) score += 5;
    if (hasActionVerbs) score += 5;
    if (hasMetrics) score += 5;

    // Skills bonus (up to 15 points)
    const skillBonus = Math.min(15, Math.floor(skillsFound.length * 1.5));
    score += skillBonus;
    score = Math.min(100, Math.max(25, score));

    // 4. Role Benchmarks & Missing Skills
    const userRole = targetRole || goal || 'Software Engineer';
    const benchmark = ROLE_BENCHMARKS[userRole] || ROLE_BENCHMARKS['Software Engineer'];

    const missingCore = benchmark.core.filter(s => !skillsFound.some(f => f.toLowerCase() === s.toLowerCase()));
    const missingAdvanced = benchmark.advanced.filter(s => !skillsFound.some(f => f.toLowerCase() === s.toLowerCase()));
    const allMissing = [...missingCore, ...missingAdvanced];

    // Categorize skills by level
    const categorizedSkills = {
      beginner: skillsFound.filter(s => ['HTML', 'CSS', 'C', 'Python', 'VS Code', 'Git', 'SQL'].includes(s)),
      intermediate: skillsFound.filter(s => ['Java', 'C++', 'JavaScript', 'React', 'Node.js', 'Express', 'MySQL', 'PostgreSQL', 'MongoDB', 'DSA', 'OOP'].includes(s)),
      advanced: skillsFound.filter(s => ['System Design', 'Docker', 'Kubernetes', 'PyTorch', 'TensorFlow', 'Next.js', 'AWS', 'Generative AI', 'CI/CD'].includes(s)),
      recommended: allMissing.slice(0, 8)
    };

    // If arrays are empty, provide clean fallbacks
    if (categorizedSkills.beginner.length === 0 && skillsFound.length > 0) {
      categorizedSkills.beginner = skillsFound.slice(0, Math.ceil(skillsFound.length / 2));
    }
    if (categorizedSkills.intermediate.length === 0 && skillsFound.length > 2) {
      categorizedSkills.intermediate = skillsFound.slice(Math.ceil(skillsFound.length / 2));
    }

    // 5. Actionable Feedback & Improvements
    const improvements = [];
    const whatToUpdate = [];
    const whatToAdd = [];
    const whatToRemove = [];

    if (!hasMetrics) {
      whatToUpdate.push('Quantify your project achievements with numbers (e.g. "Improved query performance by 40%", "Scaled to 500+ active users").');
    }
    if (!hasActionVerbs) {
      whatToUpdate.push('Start project and work bullet points with strong action verbs (Engineered, Architected, Spearheaded, Optimized) instead of passive phrasing like "Worked on".');
    }
    if (!hasCertifications) {
      whatToAdd.push(`Add 1-2 recognized certifications relevant to ${userRole} (e.g., AWS Certified Cloud Practitioner, Oracle Java, or Coursera DeepLearning Specialization).`);
    }
    if (!hasSummary) {
      whatToAdd.push('Add a concise 2-line Professional Summary highlighting your top skills, degree, and passion for the target role.');
    }
    if (allMissing.length > 0) {
      whatToAdd.push(`Include high-demand keywords: ${allMissing.slice(0, 4).join(', ')} to boost ATS match rate for ${userRole}.`);
    }
    if (/references available upon request/i.test(rawText)) {
      whatToRemove.push('Remove "References available upon request" — it consumes valuable resume space.');
    }
    if (/hobbies|curriculum vitae|bio-data/i.test(rawText)) {
      whatToRemove.push('Remove generic personal hobby lists or outdated headers like "Bio-Data" to keep the resume strictly professional.');
    }

    const atsRating = score >= 80 ? 'Excellent (88%+ match rate)' : (score >= 60 ? 'Good (65%+ match rate)' : 'Needs Improvement (<50% match rate)');
    const placementReadiness = score >= 75 ? 'Ready for Campus Placements & Tier-1/Tier-2 Tech Drives' : 'Requires Optimization Before Placement Drives';

    const analysisData = {
      score,
      atsRating,
      placementReadiness,
      skillsFound,
      categorizedSkills,
      sectionsDetected: { hasEducation, hasProjects, hasExperience, hasCertifications, hasContact, hasSummary },
      feedback: {
        whatToUpdate: whatToUpdate.length ? whatToUpdate : ['Your project descriptions are clear! Keep refining technical metrics and scale.'],
        whatToAdd: whatToAdd.length ? whatToAdd : ['Ensure links to live GitHub repositories and deployed demo URLs are active.'],
        whatToRemove: whatToRemove.length ? whatToRemove : ['No unnecessary filler found. Layout is concise.'],
        projectCritique: hasProjects ? 'Projects are present. Ensure each project lists Tech Stack, Problem Statement, Solution, and Measurable Outcome.' : 'Missing prominent Projects section. Add at least 2 full-stack or domain-specific projects with GitHub links.',
        certificationCritique: hasCertifications ? 'Certifications detected. Make sure they are recent and include credential IDs.' : 'Consider adding an industry certification to stand out in competitive screening.'
      }
    };

    // Save to Database
    run(`INSERT INTO resume_analyses (user_id, resume_name, score, skills_found, missing_skills, analysis_json) VALUES (?, ?, ?, ?, ?, ?)`, [
      userId,
      filename || 'Resume_Upload',
      score,
      JSON.stringify(skillsFound),
      JSON.stringify(allMissing),
      JSON.stringify(analysisData)
    ]);

    res.json({
      success: true,
      analysis: analysisData
    });
  } catch (err) {
    console.error('Error analyzing resume:', err);
    res.status(500).json({ error: 'Failed to complete resume analysis.' });
  }
});

// =====================================================================
// GET /api/resume/latest
// =====================================================================
router.get('/latest', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const latest = queryOne(`SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`, [userId]);
    if (!latest) {
      return res.json({ analysis: null });
    }
    const parsed = JSON.parse(latest.analysis_json || '{}');
    res.json({ analysis: parsed, createdAt: latest.created_at });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latest resume analysis.' });
  }
});

// =====================================================================
// GET /api/resume/recommendations
// =====================================================================
router.get('/recommendations', auth, (req, res) => {
  try {
    const user = queryOne(`SELECT * FROM users WHERE id = ?`, [req.user.id]);
    const year = user ? user.year : '3rd Year';
    const goal = user ? user.goal : 'Software Engineer';
    const skills = user ? JSON.parse(user.skills || '[]') : [];

    // Personalization logic based on Education Year & Goal
    const recommendations = generateEducationRecommendations(year, goal, skills);
    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate recommendations.' });
  }
});

function generateEducationRecommendations(year, goal, currentSkills) {
  const isFinalOrPreFinal = year.includes('3rd') || year.includes('4th') || year.includes('Graduate');
  
  return {
    educationContext: `${year} • Goal: ${goal}`,
    nextSkillsToLearn: isFinalOrPreFinal
      ? ['System Design & Scalability', 'Docker & Containers', 'REST APIs & Microservices', 'CI/CD Automation', 'Advanced DSA (Graphs & DP)']
      : ['Data Structures & Algorithms (Trees, Graphs)', 'Object-Oriented Programming (Java / C++)', 'Database Design & SQL', 'Git & GitHub Collaboration'],
    programmingLanguages: goal.includes('AI') ? ['Python (Advanced)', 'C++ (for performance)'] : ['Java / C++ (for DSA)', 'JavaScript / TypeScript', 'Python'],
    coreSubjects: ['Operating Systems (Process, Memory, Deadlocks)', 'DBMS & SQL Query Optimization', 'Computer Networks (TCP/IP, Routing, Protocols)', 'Object-Oriented Design Principles'],
    toolsAndFrameworks: goal.includes('AI') ? ['PyTorch / TensorFlow', 'Pandas & NumPy', 'FastAPI', 'Docker', 'HuggingFace'] : ['React / Next.js', 'Node.js / Express', 'Postman', 'Docker', 'Git'],
    projectsToBuild: [
      {
        title: goal.includes('AI') ? 'AI Powered Resume Matcher & ATS Scorer' : 'Full-Stack Scalable E-Commerce / Collaboration App',
        tech: goal.includes('AI') ? 'Python, PyTorch, FastAPI, React, Docker' : 'React, Node.js, PostgreSQL, Redis, Docker',
        complexity: isFinalOrPreFinal ? 'Advanced Full-Stack with Auth & Deployment' : 'Intermediate with Clean CRUD & Database',
        impact: 'Demonstrates end-to-end architecture, API design, database normalization, and live cloud deployment.'
      },
      {
        title: 'Distributed Real-Time Chat & Notification Engine',
        tech: 'Node.js, WebSockets / Socket.io, Redis, MongoDB',
        complexity: 'Intermediate / Advanced',
        impact: 'Highlights concurrency, socket lifecycle management, caching, and low-latency data streaming.'
      },
      {
        title: goal.includes('GATE') ? 'Core OS Process & Memory Simulator' : 'Cloud Native Task & Analytics Microservices',
        tech: 'Java / Python / Go, SQLite / Postgres, Docker',
        complexity: 'Core Systems / Backend',
        impact: 'Proves deep understanding of operating systems, algorithmic efficiency, and modular code design.'
      }
    ],
    certifications: goal.includes('AI')
      ? ['DeepLearning.AI Machine Learning Specialization', 'AWS Certified Machine Learning - Specialty']
      : ['AWS Certified Solutions Architect / Cloud Practitioner', 'Oracle Certified Professional Java SE Developer'],
    placementChecklist: [
      'Solve 150+ standard DSA problems (Arrays, LinkedList, Trees, Graphs, DP)',
      'Prepare 2 strong portfolio projects with live demo URLs and clean GitHub code',
      'Master core CS fundamentals (OS process scheduling, DBMS normalization, CN 3-way handshake)',
      'Conduct at least 5 mock technical interview rounds and practice STAR method for HR rounds',
      'Optimize resume with quantified achievements and export with ATS-friendly font'
    ]
  };
}

module.exports = router;
