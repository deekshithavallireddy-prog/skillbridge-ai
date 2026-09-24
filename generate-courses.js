const fs = require('fs');

const coursesList = [
  "Machine Learning", "Data Science", "Deep Learning", "Natural Language Processing", "Computer Vision", "Data Engineering", "Data Analytics",
  "Full Stack Web Development", "Frontend Development", "Backend Development (Node.js)", "Python Django/Flask", "React Native (Mobile)", "Android Development", "iOS Development",
  "AWS Cloud", "Google Cloud Platform (GCP)", "Microsoft Azure", "DevOps", "Kubernetes", "Cybersecurity",
  "Python Programming", "Java Programming", "C++ Programming", "JavaScript", "Go (Golang)", "Rust Programming",
  "UPSC Civil Services", "Banking (IBPS PO/SBI PO)", "SSC CGL", "RRB NTPC", "NDA Exam", "CA Foundation", "CAT (MBA Entrance)", "NEET (Medical)", "JEE Mains",
  "Digital Marketing", "Project Management (PMP)", "Business Analytics", "UX/UI Design", "Product Management",
  "Blockchain Development", "Game Development (Unity)", "Embedded Systems / IoT", "Ethical Hacking / CEH", "Graphic Design",
  "Nursing (B.Sc Nursing entrance)", "BBA / Management", "Law (CLAT)", "Architecture (NATA)", "Hotel Management (NCHM JEE)"
];

const categoriesMap = {
  0: "Data Science & AI", 1: "Data Science & AI", 2: "Data Science & AI", 3: "Data Science & AI", 4: "Data Science & AI", 5: "Data Science & AI", 6: "Data Science & AI",
  7: "Web Development", 8: "Web Development", 9: "Web Development", 10: "Web Development", 11: "Web Development", 12: "Web Development", 13: "Web Development",
  14: "Cloud & DevOps", 15: "Cloud & DevOps", 16: "Cloud & DevOps", 17: "Cloud & DevOps", 18: "Cloud & DevOps", 19: "Cloud & DevOps",
  20: "Programming Languages", 21: "Programming Languages", 22: "Programming Languages", 23: "Programming Languages", 24: "Programming Languages", 25: "Programming Languages",
  26: "Competitive Exams", 27: "Competitive Exams", 28: "Competitive Exams", 29: "Competitive Exams", 30: "Competitive Exams", 31: "Competitive Exams", 32: "Competitive Exams", 33: "Competitive Exams", 34: "Competitive Exams",
  35: "Management & Business", 36: "Management & Business", 37: "Management & Business", 38: "Management & Business", 39: "Management & Business",
  40: "Specialized Tech", 41: "Specialized Tech", 42: "Specialized Tech", 43: "Specialized Tech", 44: "Specialized Tech",
  45: "Healthcare & Other", 46: "Healthcare & Other", 47: "Healthcare & Other", 48: "Healthcare & Other", 49: "Healthcare & Other"
};

const COURSES = {};

coursesList.forEach((name, i) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const category = categoriesMap[i] || "Other";
  
  let phases = [
    {
      name: 'Foundations & Basics',
      duration: 'Month 1',
      color: '#2563eb',
      topics: ['Introduction to ' + name, 'Core concepts', 'Environment setup', 'Basic problems', 'Review & Practice']
    },
    {
      name: 'Intermediate Concepts',
      duration: 'Month 2-3',
      color: '#16a34a',
      topics: ['Advanced theory', 'Practical applications', 'Tooling & Ecosystem', 'Mini projects', 'Assessments']
    },
    {
      name: 'Advanced Topics',
      duration: 'Month 4',
      color: '#d97706',
      topics: ['Complex architectures', 'Optimization', 'Best practices', 'Industry standards', 'Deep dive']
    },
    {
      name: 'Projects & Preparation',
      duration: 'Month 5-6',
      color: '#7c3aed',
      topics: ['Capstone Project', 'Mock Interviews', 'Portfolio building', 'Resume review', 'Final Assessment']
    }
  ];

  if(name === "Machine Learning") {
    phases = [
      { name: 'Python & Math Foundations', duration: 'Month 1', color: '#2563eb', topics: ['Python basics', 'NumPy & Pandas', 'Linear Algebra', 'Statistics & Probability', 'Matplotlib & Seaborn'] },
      { name: 'Core ML Algorithms', duration: 'Month 2-3', color: '#16a34a', topics: ['Linear Regression', 'Logistic Regression', 'Decision Trees', 'Random Forest', 'SVM', 'K-Means Clustering', 'KNN'] },
      { name: 'Deep Learning & Neural Networks', duration: 'Month 4', color: '#d97706', topics: ['Neural Network basics', 'TensorFlow/Keras', 'CNN', 'RNN/LSTM', 'Transfer Learning'] },
      { name: 'Projects & Deployment', duration: 'Month 5-6', color: '#7c3aed', topics: ['End-to-end ML project', 'Model evaluation metrics', 'Hyperparameter tuning', 'Flask/FastAPI deployment', 'Streamlit apps', 'GitHub portfolio'] }
    ];
  } else if (name === "Data Science") {
    phases = [
      { name: 'Python/Stats foundations', duration: 'Month 1', color: '#2563eb', topics: ['Python', 'Stats', 'Probability', 'Maths'] },
      { name: 'EDA & Visualization', duration: 'Month 2', color: '#16a34a', topics: ['Pandas', 'Matplotlib', 'Seaborn', 'Dashboards'] },
      { name: 'ML basics', duration: 'Month 3-4', color: '#d97706', topics: ['Regression', 'Classification', 'Clustering'] },
      { name: 'SQL & Big Data tools', duration: 'Month 5-6', color: '#7c3aed', topics: ['SQL', 'Spark', 'Hadoop', 'Projects'] }
    ];
  }

  COURSES[id] = {
    id: id,
    name: name,
    icon: '📚',
    category: category,
    duration: '6 months',
    description: 'Comprehensive course on ' + name,
    phases: phases,
    resources: [
      { type: 'youtube', label: 'Gate Smashers - ' + name, url: 'https://www.youtube.com/' },
      { type: 'youtube', label: 'FreeCodeCamp - ' + name, url: 'https://www.youtube.com/' },
      { type: 'website', label: name + ' Official Docs', url: 'https://google.com' },
      { type: 'website', label: 'GeeksForGeeks - ' + name, url: 'https://geeksforgeeks.org' },
      { type: 'website', label: 'Coursera ' + name, url: 'https://coursera.org' }
    ],
    books: ['Mastering ' + name, name + ' for Beginners', 'Advanced ' + name],
    questions: [
      { q: 'What is the primary purpose of ' + name + '?', opts: ['Data analysis', 'Web dev', 'Everything', 'Nothing'], ans: 0, exp: 'It is a fundamental concept.' },
      { q: 'Which tool is most commonly used in ' + name + '?', opts: ['Tool A', 'Tool B', 'Tool C', 'Tool D'], ans: 0, exp: 'Tool A is the industry standard.' },
      { q: 'What is a key benefit of ' + name + '?', opts: ['Efficiency', 'Cost', 'Time', 'Complexity'], ans: 0, exp: 'Efficiency is key.' },
      { q: 'When was ' + name + ' first introduced?', opts: ['1990s', '2000s', '2010s', '2020s'], ans: 1, exp: 'It gained popularity in the 2000s.' },
      { q: 'Which role uses ' + name + ' the most?', opts: ['Engineer', 'Manager', 'Analyst', 'Designer'], ans: 0, exp: 'Engineers use it daily.' }
    ]
  };
});

let fileContent = `const COURSES = ${JSON.stringify(COURSES, null, 2)};

window.SKILLBRIDGE_COURSES = COURSES;
window.searchCourses = function(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return Object.values(COURSES).filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.category.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q)
  ).slice(0, 10);
};
window.getCourse = function(id) {
  return COURSES[id] || null;
};
`;

fs.writeFileSync('C:/Users/Dell/Desktop/deekshu/New folder/skillbridge-ai/js/courses.js', fileContent);
